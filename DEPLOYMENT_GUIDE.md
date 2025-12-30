# MASTERY.AI - Deployment & Setup Guide

A next-generation education platform featuring adaptive mastery learning, real-time analytics, and AI-powered educational tools.

## 🚀 Features

- **Adaptive Mastery**: AI-powered personalized learning paths that adapt to each student's pace.
- **Real-Time Analytics**: Track engagement, attendance, and progress with live teacher dashboards.
- **Project-Based Learning (PBL)**: Collaborative tools, peer evaluation, and rubric-based grading.
- **AI Tutors**: Personalized AI assistance for students and automated grading suggestions for teachers.
- **Thought Proof System**: Advanced anti-plagiarism system that validates the learning journey through keystroke analysis and AI narration.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Lucide Icons, Shadcn UI
- **State Management**: Zustand, TanStack Query
- **3D/Graphics**: Three.js, Recharts

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT-based auth with OAuth2 support
- **AI/ML**: Google Gemini API, OpenAI API
- **Caching**: Redis (Optional but recommended)

## 💻 Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Redis (Optional)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost/mastery_db
   SECRET_KEY=your_secret_key
   REDIS_URL=redis://localhost:6379/0  # Optional
   GEMINI_API_KEY=your_gemini_key
   ```
5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env.local`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment

### Backend (Render)
- **Service Type**: Web Service
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Output Directory**: `dist`
- **Environment Variables**: Add `VITE_API_BASE_URL` pointing to your Render service.

## 📄 License

MIT
