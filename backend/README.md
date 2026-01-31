# WBLE Student Portal - Backend API

FastAPI backend for the Work-Based Learning Experience Student Portal.

## Tech Stack

- **Framework:** FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Auth:** JWT (python-jose)
- **Password Hashing:** bcrypt

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Set Up Database

Make sure PostgreSQL is running, then create the database:

```bash
createdb wble_portal
```

Or using psql:
```sql
CREATE DATABASE wble_portal;
```

### 5. Seed Database (Optional)

```bash
python seed.py
```

This creates demo users:
- Admin: `admin@careerfocus.org` / `admin123`
- Student: `john.smith@email.com` / `student123`

### 6. Run Development Server

```bash
uvicorn app.main:app --reload
```

API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/api/v1/docs`
- ReDoc: `http://localhost:8000/api/v1/redoc`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login (get JWT token)
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users/` - List users (admin)
- `GET /api/v1/users/students` - List students (admin)
- `PUT /api/v1/users/me` - Update profile

### Timesheets
- `GET /api/v1/timesheets/` - List timesheets
- `POST /api/v1/timesheets/` - Create timesheet
- `POST /api/v1/timesheets/{id}/submit` - Submit for approval
- `POST /api/v1/timesheets/{id}/review` - Approve/reject (admin)

### Programs
- `GET /api/v1/programs/` - List programs
- `GET /api/v1/programs/available` - List open programs
- `POST /api/v1/programs/{id}/enroll` - Enroll in program
- `GET /api/v1/programs/enrollments/current` - Get active enrollment

### Documents
- `GET /api/v1/documents/` - List documents
- `POST /api/v1/documents/` - Upload document
- `POST /api/v1/documents/{id}/review` - Approve/reject (admin)

### Opportunities
- `GET /api/v1/opportunities/` - List opportunities
- `GET /api/v1/opportunities/featured` - List featured

### Learning Hub
- `GET /api/v1/learning/progress` - Get learning progress
- `POST /api/v1/learning/progress` - Update lesson progress
- `GET /api/v1/learning/announcements` - Get announcements

### Dashboard
- `GET /api/v1/dashboard/student` - Student dashboard data
- `GET /api/v1/dashboard/admin` - Admin dashboard data

## Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `SECRET_KEY` - Random secret for JWT signing
5. Create a PostgreSQL database on Render and link it

## Project Structure

```
backend/
├── app/
│   ├── api/           # API route handlers
│   ├── core/          # Config, security, database
│   ├── models/        # SQLAlchemy models
│   ├── schemas/       # Pydantic schemas
│   ├── services/      # Business logic
│   └── main.py        # FastAPI app entry
├── requirements.txt
├── seed.py            # Database seeder
└── .env.example
```
