import asyncio
from typing import Dict, List, Optional
from uuid import UUID, uuid4
from fastapi import WebSocket

class QuizSession:
    def __init__(self, quiz_id: str, host_id: str, title: str):
        self.quiz_id = quiz_id
        self.host_id = host_id
        self.title = title
        self.is_active = True
        self.current_question_index = -1
        self.students: Dict[str, Dict] = {}  # student_id -> {name, score, connection}
        self.host_connection: Optional[WebSocket] = None
        self.questions = []  # List of question objects

    async def connect_student(self, student_id: str, name: str, websocket: WebSocket):
        await websocket.accept()
        self.students[student_id] = {
            "name": name,
            "score": 0,
            "connection": websocket,
            "answers": {}
        }
        await self.broadcast_lobby_state()

    async def connect_host(self, websocket: WebSocket):
        await websocket.accept()
        self.host_connection = websocket
        await self.broadcast_lobby_state()

    def disconnect_student(self, student_id: str):
        if student_id in self.students:
            del self.students[student_id]

    async def broadcast_lobby_state(self):
        """Send current player list to host and all students."""
        player_list = [
            {"id": sid, "name": s["name"], "score": s["score"]}
            for sid, s in self.students.items()
        ]
        
        message = {
            "type": "lobby_update",
            "players": player_list,
            "count": len(player_list)
        }
        
        await self.broadcast(message)

    async def broadcast(self, message: dict):
        """Send message to everyone in the session."""
        # Send to host
        if self.host_connection:
            try:
                await self.host_connection.send_json(message)
            except:
                pass # Handle disconnection gracefully

        # Send to students
        for s in self.students.values():
            try:
                await s["connection"].send_json(message)
            except:
                pass

    async def start_quiz(self, questions: List[dict]):
        self.questions = questions
        self.current_question_index = 0
        await self.send_question()

    async def next_question(self):
        if self.current_question_index < len(self.questions) - 1:
            self.current_question_index += 1
            await self.send_question()
        else:
            await self.end_quiz()

    async def send_question(self):
        question = self.questions[self.current_question_index]
        # Don't send the correct answer to students!
        student_question = {k: v for k, v in question.items() if k != "correct_answer"}
        
        await self.broadcast({
            "type": "new_question",
            "question": student_question,
            "total_questions": len(self.questions),
            "current_index": self.current_question_index
        })

    async def handle_answer(self, student_id: str, answer: str):
        if student_id not in self.students:
            return
            
        current_q = self.questions[self.current_question_index]
        is_correct = current_q["correct_answer"] == answer
        
        # Update score
        points = 100 if is_correct else 0
        self.students[student_id]["score"] += points
        self.students[student_id]["answers"][self.current_question_index] = answer

        # Notify host of submission (real-time progress)
        if self.host_connection:
            await self.host_connection.send_json({
                "type": "student_answered",
                "student_id": student_id
            })

    async def end_quiz(self):
        # Calculate final leaderboard
        leaderboard = sorted(
            [{"name": s["name"], "score": s["score"]} for s in self.students.values()],
            key=lambda x: x["score"],
            reverse=True
        )
        
        await self.broadcast({
            "type": "quiz_end",
            "leaderboard": leaderboard
        })

class QuizManager:
    def __init__(self):
        self.sessions: Dict[str, QuizSession] = {}

    def create_session(self, host_id: str, title: str) -> str:
        # Generate a short 6-character code for joining
        quiz_id = str(uuid4())[:6].upper()
        self.sessions[quiz_id] = QuizSession(quiz_id, host_id, title)
        return quiz_id

    def get_session(self, quiz_id: str) -> Optional[QuizSession]:
        return self.sessions.get(quiz_id)

    def end_session(self, quiz_id: str):
        if quiz_id in self.sessions:
            del self.sessions[quiz_id]

# Global instance
quiz_manager = QuizManager()
