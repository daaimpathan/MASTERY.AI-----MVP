"""
Proof of Thought service for keystroke recording and verification.
"""

import hashlib
import json
import zlib
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
import uuid

from app.models.thought_proof import ThoughtProof, KeystrokeEvent
from app.models.assignment import StudentAssignment


class ThoughtProofService:
    """Service for managing proof of thought recordings."""
    
    @staticmethod
    def start_recording(db: Session, student_assignment_id: uuid.UUID) -> ThoughtProof:
        """
        Initialize a new proof of thought recording session.
        
        Args:
            db: Database session
            student_assignment_id: ID of the student assignment
            
        Returns:
            Created ThoughtProof record
        """
        # Check if proof already exists
        existing = db.query(ThoughtProof).filter(
            ThoughtProof.student_assignment_id == student_assignment_id
        ).first()
        
        if existing:
            return existing
        
        proof = ThoughtProof(
            student_assignment_id=student_assignment_id,
            started_at=datetime.utcnow()
        )
        
        db.add(proof)
        db.commit()
        db.refresh(proof)
        
        return proof
    
    @staticmethod
    def record_keystroke_batch(
        db: Session,
        thought_proof_id: uuid.UUID,
        events: List[Dict[str, Any]]
    ) -> int:
        """
        Record a batch of keystroke events.
        
        Args:
            db: Database session
            thought_proof_id: ID of the thought proof
            events: List of event dictionaries
            
        Returns:
            Number of events recorded
        """
        keystroke_events = []
        
        for event in events:
            keystroke_event = KeystrokeEvent(
                thought_proof_id=thought_proof_id,
                timestamp=datetime.fromisoformat(event['timestamp'].replace('Z', '+00:00')),
                event_type=event['type'],
                content=event.get('content'),
                position=event.get('position'),
                length=event.get('length'),
                line_number=event.get('line'),
                column_number=event.get('column')
            )
            keystroke_events.append(keystroke_event)
        
        db.bulk_save_objects(keystroke_events)
        
        # Update event count
        proof = db.query(ThoughtProof).filter(ThoughtProof.id == thought_proof_id).first()
        if proof:
            proof.events_count += len(events)
        
        db.commit()
        
        return len(events)
    
    @staticmethod
    def generate_replay_data(db: Session, thought_proof_id: uuid.UUID) -> Dict[str, Any]:
        """
        Generate compressed replay data from keystroke events.
        
        Args:
            db: Database session
            thought_proof_id: ID of the thought proof
            
        Returns:
            Replay data dictionary
        """
        proof = db.query(ThoughtProof).filter(ThoughtProof.id == thought_proof_id).first()
        if not proof:
            raise ValueError("Thought proof not found")
        
        # Get all events ordered by timestamp
        events = db.query(KeystrokeEvent).filter(
            KeystrokeEvent.thought_proof_id == thought_proof_id
        ).order_by(KeystrokeEvent.timestamp).all()
        
        # Convert to JSON-serializable format
        replay_events = []
        for event in events:
            replay_events.append({
                'timestamp': event.timestamp.isoformat(),
                'type': event.event_type,
                'content': event.content,
                'position': event.position,
                'length': event.length,
                'line': event.line_number,
                'column': event.column_number
            })
        
        replay_data = {
            'started_at': proof.started_at.isoformat(),
            'events': replay_events,
            'total_events': len(replay_events)
        }
        
        # Compress and store
        json_str = json.dumps(replay_data)
        compressed = zlib.compress(json_str.encode('utf-8'))
        proof.events_json = compressed.hex()
        
        # Calculate hash
        proof.replay_hash = hashlib.sha256(json_str.encode('utf-8')).hexdigest()
        
        db.commit()
        
        return replay_data
    
    @staticmethod
    async def generate_narration(
        db: Session,
        thought_proof_id: uuid.UUID,
        gemini_service
    ) -> str:
        """
        Generate AI narration of the student's thought process.
        
        Args:
            db: Database session
            thought_proof_id: ID of the thought proof
            gemini_service: Gemini AI service instance
            
        Returns:
            Generated narration text
        """
        proof = db.query(ThoughtProof).filter(ThoughtProof.id == thought_proof_id).first()
        if not proof:
            raise ValueError("Thought proof not found")
        
        # Analyze keystroke patterns
        events = db.query(KeystrokeEvent).filter(
            KeystrokeEvent.thought_proof_id == thought_proof_id
        ).order_by(KeystrokeEvent.timestamp).all()
        
        # Calculate statistics
        total_events = len(events)
        insert_events = sum(1 for e in events if e.event_type == 'insert')
        delete_events = sum(1 for e in events if e.event_type == 'delete')
        paste_events = sum(1 for e in events if e.event_type == 'paste')
        
        # Calculate time gaps (pauses)
        pauses = []
        for i in range(1, len(events)):
            gap = (events[i].timestamp - events[i-1].timestamp).total_seconds()
            if gap > 5:  # Pause longer than 5 seconds
                pauses.append(gap)
        
        # Build context for AI
        analysis_prompt = f"""Analyze this student's writing process and generate a professional narration of their thought process.

Statistics:
- Total keystrokes: {total_events}
- Insertions: {insert_events}
- Deletions: {delete_events}
- Paste events: {paste_events}
- Number of pauses (>5s): {len(pauses)}
- Average pause duration: {sum(pauses)/len(pauses) if pauses else 0:.1f}s
- Revision ratio: {delete_events/insert_events if insert_events > 0 else 0:.2f}

Generate a 2-3 paragraph narration that:
1. Describes their writing approach (outline first? iterative? linear?)
2. Highlights moments of struggle or revision
3. Notes signs of original thinking vs. potential copying
4. Maintains a neutral, observational tone

Focus on the PROCESS, not the content."""

        # Call Gemini AI
        narration = await gemini_service.generate_text(analysis_prompt)
        
        # Store narration
        proof.narration_text = narration
        proof.narration_generated_at = datetime.utcnow()
        db.commit()
        
        return narration
    
    @staticmethod
    def sign_proof(db: Session, thought_proof_id: uuid.UUID, private_key: str) -> str:
        """
        Create cryptographic signature for the proof.
        
        Args:
            db: Database session
            thought_proof_id: ID of the thought proof
            private_key: Server private key for signing
            
        Returns:
            Signature string
        """
        proof = db.query(ThoughtProof).filter(ThoughtProof.id == thought_proof_id).first()
        if not proof or not proof.replay_hash:
            raise ValueError("Proof not ready for signing")
        
        # Simple HMAC-based signing (in production, use proper asymmetric crypto)
        import hmac
        signature = hmac.new(
            private_key.encode('utf-8'),
            proof.replay_hash.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        proof.signature = signature
        proof.verified = True
        proof.verified_at = datetime.utcnow()
        
        db.commit()
        
        return signature
    
    @staticmethod
    def verify_proof(db: Session, thought_proof_id: uuid.UUID, public_key: str) -> bool:
        """
        Verify the cryptographic signature of a proof.
        
        Args:
            db: Database session
            thought_proof_id: ID of the thought proof
            public_key: Server public key for verification
            
        Returns:
            True if signature is valid
        """
        proof = db.query(ThoughtProof).filter(ThoughtProof.id == thought_proof_id).first()
        if not proof or not proof.signature or not proof.replay_hash:
            return False
        
        # Verify HMAC signature
        import hmac
        expected_signature = hmac.new(
            public_key.encode('utf-8'),
            proof.replay_hash.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(proof.signature, expected_signature)
    
    @staticmethod
    def finalize_proof(
        db: Session,
        thought_proof_id: uuid.UUID,
        private_key: str
    ) -> ThoughtProof:
        """
        Finalize the proof: generate replay, sign, and mark as complete.
        
        Args:
            db: Database session
            thought_proof_id: ID of the thought proof
            private_key: Server private key
            
        Returns:
            Finalized ThoughtProof
        """
        # Generate replay data
        ThoughtProofService.generate_replay_data(db, thought_proof_id)
        
        # Sign the proof
        ThoughtProofService.sign_proof(db, thought_proof_id, private_key)
        
        # Mark as finalized
        proof = db.query(ThoughtProof).filter(ThoughtProof.id == thought_proof_id).first()
        proof.finalized_at = datetime.utcnow()
        
        # Calculate total duration
        if proof.keystroke_events:
            first_event = proof.keystroke_events[0]
            last_event = proof.keystroke_events[-1]
            proof.total_duration_seconds = int((last_event.timestamp - first_event.timestamp).total_seconds())
        
        db.commit()
        db.refresh(proof)
        
        return proof
    
    @staticmethod
    def get_replay_data(db: Session, thought_proof_id: uuid.UUID) -> Dict[str, Any]:
        """
        Get decompressed replay data.
        
        Args:
            db: Database session
            thought_proof_id: ID of the thought proof
            
        Returns:
            Replay data dictionary
        """
        proof = db.query(ThoughtProof).filter(ThoughtProof.id == thought_proof_id).first()
        if not proof or not proof.events_json:
            raise ValueError("Replay data not available")
        
        # Decompress
        compressed = bytes.fromhex(proof.events_json)
        json_str = zlib.decompress(compressed).decode('utf-8')
        
        return json.loads(json_str)
