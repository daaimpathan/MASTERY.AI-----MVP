import google.generativeai as genai
from app.config import get_settings
import json
import logging
from typing import List, Dict, Any

settings = get_settings()
logger = logging.getLogger(__name__)

# Configure Gemini
if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to configure Gemini: {e}")

class AIService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    async def generate_quiz_questions(self, topic: str, count: int = 5, difficulty: str = "Medium") -> List[Dict[str, Any]]:
        """
        Generates quiz questions using Gemini API.
        """
        if not settings.GEMINI_API_KEY:
            raise Exception("GEMINI_API_KEY is not configured. Check .env file.")

        prompt = f"""
        Generate {count} multiple-choice quiz questions about "{topic}" at a {difficulty} difficulty level.
        
        The output must be a valid JSON array of objects with this exact schema:
        [
            {{
                "question_text": "Question goes here?",
                "options": {{
                    "A": "Option 1",
                    "B": "Option 2",
                    "C": "Option 3",
                    "D": "Option 4"
                }},
                "correct_answer": "A" 
            }}
        ]
        
        Ensure "correct_answer" is one of "A", "B", "C", or "D".
        Do not include markdown formatting (like ```json), just the raw JSON string.
        """

        try:
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            # fast cleanup if model adds markdown blocks
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
                
            questions = json.loads(content)
            return questions
        except Exception as e:
            logger.error(f"AI Generation Failed: {str(e)}")
            raise Exception(f"AI Generation Error: {str(e)}")

    async def chat_with_tutor(self, message: str, history: List[Dict[str, str]] = [], context: Dict[str, Any] = None) -> str:
        """
        Chat with the AI tutor.
        """
        if not settings.GEMINI_API_KEY:
            # DEMO/MOCK MODE
            import random
            time_delay = 1 # Simulate thinking
            import asyncio
            await asyncio.sleep(time_delay)
            
            lower_msg = message.lower()
            if "polynomial" in lower_msg:
                return "A polynomial equation is an equation involving a sum of powers in one or more variables multiplied by coefficients. For example, 2x² + 3x - 5 = 0. Would you like to try solving a simple one?"
            elif "quadratic" in lower_msg or "quadractic" in lower_msg:
                return "A quadratic equation is a polynomial equation of degree 2, usually in the form ax² + bx + c = 0. The solutions are found using the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a. Want to see an example?"
            elif "hello" in lower_msg or "hi" in lower_msg:
                return "Hello there! I'm your AI Tutor. I'm running in Demo Mode right now, but I can still help you understand how this platform works! 🚀"
            elif "help" in lower_msg:
                return "I can help you with your homework, explain difficult concepts, or quiz you on topics you've learned. What are you working on today?"
            else:
                return f"That's an interesting question about '{message}'. In a full deployment, I would use my advanced Gemini brain to explain this concept in detail, using the Socratic method to guide you! For now, try asking me about 'polynomials'."

        try:
            # Construct a prompt with history
            system_instruction = """You are a helpful, patient, and encouraging AI tutor for K-12 students. 
            Your goal is to help students learn by explaining concepts, providing examples, and guiding them through problems using the Socratic method (ask questions to guide them).
            
            IMPORTANT GUIDELINES:
            1. The student might make spelling mistakes (e.g., "studnet", "speeling"). You MUST understand their intent despite these errors and DO NOT point out the typos unless it's critical for the concept.
            2. Be concise but partial. Don't give long lectures. Use bullet points if explaining steps.
            3. If the student asks for the answer, try to guide them first. "What do you think is the first step?"
            4. Use emojis occasionally to be friendly (e.g., 📚, ✨, 🤔).
            """
            
            # Inject Context if available
            if context:
                system_instruction += "\n\nSTUDENT CONTEXT (Use this to personalize your help):"
                
                if context.get('first_name'):
                    system_instruction += f"\n- Student Name: {context['first_name']}"
                
                if context.get('recent_low_mastery_topics'):
                    topics = ", ".join(context['recent_low_mastery_topics'])
                    system_instruction += f"\n- Topics user is struggling with: {topics}. (Try to relate questions to these if relevant)."
                
                if context.get('pending_assignments'):
                    assignments = ", ".join(context['pending_assignments'])
                    system_instruction += f"\n- Pending Assignments: {assignments}. (Remind them if they seem off-track)."

            # Simple stateless approach: append history to prompt
            # In production, use model.start_chat with history, but this works for simple turns
            full_prompt = system_instruction + "\n\nConversation History:\n"
            
            # Limit history to last 5 turns to save context window
            recent_history = history[-5:] if history else []
            
            for msg in recent_history:
                role = "Student" if msg.get('role') == 'user' else "Tutor"
                content = msg.get('text', '')
                full_prompt += f"{role}: {content}\n"
            
            full_prompt += f"Student: {message}\nTutor:"

            response = self.model.generate_content(full_prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"AI Chat Failed: {str(e)}")
            return "I'm having trouble connecting to my brain right now. Can you try asking again?"

    async def generate_focus_assignment(self, topic: str):
        """Generates 3 subjective conceptual questions for deep work."""
        if not settings.GEMINI_API_KEY:
            return {
                "questions": [
                    "What are the core principles of this topic?",
                    "How does this connect to your previous knowledge?",
                    "What is the most challenging aspect you want to master?"
                ]
            }

        prompt = f"""
        Generate 3 deep, subjective, conceptual questions for a student studying: "{topic}".
        The questions should force them to think critically, not just recall facts.
        Do not provide answers.
        Format as JSON: {{ "questions": ["Q1", "Q2", "Q3"] }}
        """

        try:
            response = self.model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            import json
            data = json.loads(text)
            return data
        except Exception as e:
            logger.error(f"Gemini Focus Error: {e}")
            return {
                "questions": [
                    f"Why is {topic} important?",
                    "Describe the key mechanism of this topic.",
                    "Create a mind map of this concept."
                ]
            }

    async def generate_assignment_content(self, title: str) -> str:
        """Generates assignment instruction content based on a title."""
        if not settings.GEMINI_API_KEY:
            return f"[AI GENERATED LESSON PLAN FOR: {title}]\n1. Objective: Understand key concepts of {title}.\n2. Activity: Read relevant chapters and solve problems.\n3. Assessment: Submit your work by the due date.\n(Note: This is a placeholder. Configure GEMINI_API_KEY for real AI generation.)"

        prompt = f"""
        You are an expert teacher. Create a concise but detailed assignment description/lesson plan for a high school student assignment titled: "{title}".
        
        Include:
        1. Learning Objectives
        2. Step-by-step Instructions
        3. Deliverables
        
        Format as plain text (no markdown symbols like ** or #), using numbered lists and clear sections. Keep it under 200 words.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Assignment Gen Error: {e}")
            return f"Failed to generate content for {title}. Please try again."

ai_service = AIService()
