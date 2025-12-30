# MASTERY.AI 🚀

A next-generation education platform featuring adaptive mastery learning, real-time analytics, and AI-powered educational tools.

---

## 🗺️ Product Roadmap

### **Phase 1: Foundation & Stability (Current)**
- [x] **Project Evaluation Engine**: Rubric-based grading with weighted scoring.
- [x] **Resource Request System**: Seamless teacher-student resource workflows.
- [x] **Thought Proof (MVP)**: Invisible keystroke recording and journey validation.
- [ ] **Cross-Browser Optimization**: Ensuring visual fidelity across all devices.
- [ ] **Automated Testing Suite**: Full E2E coverage for core flows.

### **Phase 2: AI Expansion & Personalization**
- [ ] **Gemini-Powered Grading Assistant**: AI-suggested rubric scores.
- [ ] **Adaptive Intervention Bot**: Proactive support triggers.
- [ ] **Automated Syllabus Generation**: Dynamic course mapping.

### **Phase 3: Collaborative Mastery**
- [ ] **Advanced Peer Evaluation**: Double-blind reviews.
- [ ] **Real-Time Collaborative Workspaces**: Integrated project editors.
- [ ] **Mastery Badges**: Verifiable digital credentials.

### **Phase 4: Scaling & Ecosystem**
- [ ] **Mobile Applications**: Native iOS and Android apps.
- [ ] **LMS Integrations**: Sync with Google Classroom/Canvas.
- [ ] **Developer API**: Extensible 3D "Constellation" modules.

---

## 🌐 Deployment Guide (Step-by-Step)

### **Step 1: Backend Deployment (Render)**
1. **Database**: 
   - Create a **New PostgreSQL** database on Render.
   - Copy the **Internal Database URL**.
2. **Web Service**:
   - Create a **New Web Service** and connect your GitHub repo.
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Environment Variables**:
   - `DATABASE_URL`: (Your Internal Database URL)
   - `SECRET_KEY`: (A random secure string)
   - `GEMINI_API_KEY`: (Your Google AI API key)
   - `ALGORITHM`: `HS256`

### **Step 2: Frontend Deployment (Vercel)**
1. **Project Setup**:
   - Import your GitHub repo to Vercel.
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
2. **Environment Variables**:
   - Add `VITE_API_BASE_URL`: `https://your-backend-url.onrender.com/api/v1`
3. **Deploy**:
   - Click **Deploy**. Vercel will build the `dist` folder automatically.

### **Step 3: Final Sync (CORS)**
- Copy your Vercel URL (e.g., `https://mastery.vercel.app`).
- In your backend `app/main.py`, add this URL to the `CORSMiddleware` origins list.
- Push the change to GitHub; Render will auto-redeploy.

---

## 💻 Local Setup
1. **Backend**: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
2. **Frontend**: `cd frontend && npm install && npm run dev`
3. **PostgreSQL**: Ensure you have a local DB running or use a Docker container.

---

## 📄 License
MIT © 2024 MASTERY.AI Team
