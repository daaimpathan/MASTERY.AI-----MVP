# MASTERY.AI Backend - Adaptive Mastery & Engagement Platform

Production-ready FastAPI backend for the MASTERY.AI EdTech platform.

## 🚀 Features

### Core Pillars

1. **Project-Based Learning (PBL) Management**
   - Create and assign multidisciplinary projects
   - Rubric-based evaluation (communication, collaboration, problem-solving)
   - Individual + group scoring
   - Peer + teacher evaluation support
   - Evidence upload (files, links, notes)

2. **Inclusive Engagement Tracking**
   - Track explicit + implicit engagement signals
   - Real-time Engagement Index (0-100) per student
   - Explainable AI with contributing factors
   - At-risk student identification

3. **Adaptive Homework & Mastery System**
   - Concept-level mastery graph per student
   - Automatic weak concept detection
   - Personalized assignments (easy → medium → hard)
   - Continuous mastery updates after every attempt

### Technical Features

- **Authentication**: JWT + refresh tokens
- **Authorization**: Role-based access control (Admin, Teacher, Student)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Caching**: Redis for engagement metrics
- **AI/ML**: Custom algorithms for engagement, mastery, and adaptation
- **API Documentation**: Auto-generated OpenAPI/Swagger docs

## 📋 Prerequisites

- Python 3.10+
- PostgreSQL 15+
- Redis 7+

## 🛠️ Installation

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

Edit `.env`:

```env
# Database
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/amep_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT Secret (generate a secure random string)
SECRET_KEY=your-super-secret-key-change-this

# CORS (add your frontend URL)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 5. Set Up Database

Create PostgreSQL database:

```sql
CREATE DATABASE amep_db;
```

The tables will be created automatically on first run.

### 6. Start Redis

```bash
# Windows (if installed via installer)
redis-server

# Linux
sudo service redis-server start

# Mac
brew services start redis
```

## 🏃 Running the Application

### Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## 📚 API Documentation

Once running, visit http://localhost:8000/api/docs for interactive API documentation.

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

#### (More endpoints to be added as development continues)

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_engagement_calculator.py
```

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Configuration
│   ├── database.py             # Database setup
│   ├── dependencies.py         # Dependency injection
│   │
│   ├── models/                 # SQLAlchemy models
│   │   ├── user.py
│   │   ├── class_model.py
│   │   ├── project.py
│   │   ├── engagement.py
│   │   └── assignment.py
│   │
│   ├── schemas/                # Pydantic schemas
│   │   └── user.py
│   │
│   ├── api/v1/                 # API routes
│   │   └── auth.py
│   │
│   ├── services/               # Business logic
│   │   └── auth_service.py
│   │
│   ├── ai/                     # AI/ML components
│   │   ├── engagement_calculator.py
│   │   ├── mastery_scorer.py
│   │   └── assignment_generator.py
│   │
│   └── utils/                  # Utilities
│       ├── security.py
│       └── cache.py
│
├── tests/                      # Tests
├── requirements.txt
├── .env.example
└── README.md
```

## 🔐 Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Refresh token rotation
- Role-based access control (RBAC)
- Input validation with Pydantic
- SQL injection prevention via ORM

## 🎯 AI/ML Components

### 1. Engagement Index Calculator

Calculates a 0-100 engagement score based on:
- Attendance (25%)
- Assignment submission (20%)
- Quiz participation (15%)
- Interaction frequency (15%)
- Timeliness (15%)
- Resource engagement (10%)

**Explainability**: Returns detailed breakdown of each factor's contribution.

### 2. Mastery Scorer

Bayesian-inspired algorithm that:
- Updates mastery based on correctness, difficulty, and time spent
- Applies temporal decay for unpracticed concepts
- Considers learning rate (harder to improve at high mastery)

### 3. Adaptive Assignment Generator

Generates personalized assignments by:
- Identifying mastery gaps
- Checking prerequisite readiness
- Balancing difficulty based on current mastery
- Avoiding recently answered questions

## 📊 Database Schema

The system uses 25+ tables organized around:
- **Users & Auth**: users, institutions, refresh_tokens
- **Classes**: classes, enrollments
- **PBL**: projects, rubrics, submissions, evaluations
- **Engagement**: engagement_events, engagement_index, attendance_records
- **Adaptive Learning**: concepts, student_mastery, assignments, recommendations

## 🚀 Deployment

### Docker (Recommended)

```bash
# Build image
docker build -t amep-backend .

# Run container
docker run -p 8000:8000 --env-file .env amep-backend
```

### Manual Deployment

1. Set up PostgreSQL and Redis on production server
2. Update `.env` with production credentials
3. Install dependencies: `pip install -r requirements.txt`
4. Run with gunicorn: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`

## 🔧 Configuration

Key environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: JWT secret key (keep secure!)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Access token lifetime (default: 30)
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token lifetime (default: 7)
- `ENGAGEMENT_CALCULATION_PERIOD_DAYS`: Engagement calculation window (default: 30)
- `MASTERY_THRESHOLD`: Mastery threshold for "mastered" (default: 70)

## 📝 License

Copyright © 2025 MASTERY.AI Team. All rights reserved.

## 🤝 Contributing

This is a production-ready system. For contributions, please follow:
1. Create feature branch
2. Write tests
3. Update documentation
4. Submit pull request

## 📞 Support

For issues or questions, please open an issue on the repository.
