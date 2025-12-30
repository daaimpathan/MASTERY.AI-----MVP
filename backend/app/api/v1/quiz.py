from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.services.quiz_manager import quiz_manager
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(tags=["Quiz"])

class CreateQuizRequest(BaseModel):
    title: str
    questions: List[dict] # {question_text, options, correct_answer}

class JoinQuizRequest(BaseModel):
    code: str
    student_name: str

@router.post("/quiz/create")
async def create_quiz(request: CreateQuizRequest, current_user: User = Depends(get_current_user)):
    """Teacher creates a new quiz session."""
    if current_user.role != "teacher" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only teachers can create quizzes")
        
    quiz_id = quiz_manager.create_session(str(current_user.id), request.title)
    
    # Store questions in the session immediately for simplicity
    # In a real app, you might fetch them from DB or pass them differently
    session = quiz_manager.get_session(quiz_id)
    if session:
        session.questions = request.questions

    return {"quiz_id": quiz_id, "message": "Quiz created successfully"}

@router.post("/quiz/check-code")
async def check_code(request: JoinQuizRequest):
    """Verify if a game code is valid."""
    session = quiz_manager.get_session(request.code)
    if not session:
        raise HTTPException(status_code=404, detail="Invalid game code")
    if not session.is_active:
        raise HTTPException(status_code=400, detail="Quiz session has ended")
    return {"valid": True, "title": session.title}

@router.websocket("/ws/quiz/{quiz_id}")
async def websocket_endpoint(websocket: WebSocket, quiz_id: str, student_name: Optional[str] = None, role: str = "student"):
    """
    WebSocket endpoint for real-time quiz interaction.
    Teacher connects with role='host'
    Student connects with role='student' and student_name
    """
    session = quiz_manager.get_session(quiz_id)
    if not session:
        await websocket.close(code=4000)
        return

    student_id = str(uuid4()) # Temporary ID for this session connection

    try:
        if role == "host":
            # In a real app, verify token here to ensure it's the actual host
            await session.connect_host(websocket)
        else:
            if not student_name:
                await websocket.close(code=4001)
                return
            await session.connect_student(student_id, student_name, websocket)

        # Listen for messages
        while True:
            data = await websocket.receive_json()
            
            # Handle Host Commands
            if role == "host":
                if data.get("action") == "start":
                    await session.start_quiz(session.questions)
                elif data.get("action") == "next_question":
                    await session.next_question()
                elif data.get("action") == "end_quiz":
                    await session.end_quiz()
            
            # Handle Student Answers
            elif role == "student":
                if data.get("action") == "submit_answer":
                    answer = data.get("answer")
                    await session.handle_answer(student_id, answer)

    except WebSocketDisconnect:
        if role == "student":
            session.disconnect_student(student_id)
            await session.broadcast_lobby_state()
from app.services.ai_service import ai_service

class GenerateAIRequest(BaseModel):
    topic: str
    count: int = 5
    difficulty: str = "Medium"

@router.post("/quiz/generate-ai")
async def generate_ai_quiz(request: GenerateAIRequest, current_user: User = Depends(get_current_user)):
    """Generate quiz questions using AI."""
    if current_user.role != "teacher" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only teachers can generate quizzes")

    try:
        questions = await ai_service.generate_quiz_questions(request.topic, request.count, request.difficulty)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
