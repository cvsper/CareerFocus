# WBLE Student Portal - Career Focus

A Work-Based Learning Experience (WBLE) Student Portal for Career Focus, a nonprofit organization connecting students with work-based learning opportunities.

## Features

### Student Portal
- **Dashboard** - Overview of program status, timesheet status, pending documents, and learning progress
- **Timesheets** - Weekly timesheet submission with hour tracking
- **Documents** - Upload and track onboarding documents (ID, W-4, etc.)
- **Programs** - View enrolled programs and available programs for enrollment
- **Job Opportunities** - Browse internships, pathways, and part-time positions
- **Learning Hub** - 8 micro-learning lessons about payroll and workplace basics
- **Profile** - Manage personal information and emergency contacts

### Admin Portal
- **Dashboard** - Overview stats (students, pending approvals, etc.)
- **Student Management** - View and search all registered students
- **Approvals** - Review and approve/reject timesheets and documents
- **Program Management** - Create, edit, and delete programs
- **Opportunity Management** - Create, edit, and delete job opportunities

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide Icons

### Backend
- Python 3.11
- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- JWT Authentication (python-jose)
- Bcrypt password hashing

## Project Structure

```
CareerFocus/
├── Protoype/                 # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service and auth context
│   │   └── App.tsx           # Main app with routing
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # Backend FastAPI application
│   ├── app/
│   │   ├── api/              # API route handlers
│   │   ├── core/             # Config, database, security
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   └── main.py           # FastAPI app entry point
│   └── requirements.txt
│
└── README.md
```

## Local Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11
- PostgreSQL

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set environment variables:
   ```bash
   export DATABASE_URL="postgresql://user:password@localhost:5432/careerfocus"
   export SECRET_KEY="your-secret-key-here"
   ```

5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be available at `http://localhost:8000`
   API docs at `http://localhost:8000/api/v1/docs`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Protoype
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set environment variables (create `.env` file):
   ```
   VITE_API_URL=http://localhost:8000/api/v1
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Deployment (Render)

### Backend (Web Service)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `SECRET_KEY` - A secure random string

### Frontend (Static Site)
1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Set the following:
   - **Root Directory**: `Protoype`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variable:
   - `VITE_API_URL` - Your backend API URL (e.g., `https://your-api.onrender.com/api/v1`)

### Database (PostgreSQL)
1. Create a PostgreSQL database on Render
2. Copy the Internal Database URL to your backend's `DATABASE_URL` environment variable

## Demo Accounts

After the database is seeded (automatically on first startup):

| Role    | Email                     | Password    |
|---------|---------------------------|-------------|
| Admin   | admin@careerfocus.org     | admin123    |
| Student | john.smith@email.com      | student123  |
| Student | emily.johnson@email.com   | student123  |
| Student | marcus.williams@email.com | student123  |

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register new user
- `GET /api/v1/auth/me` - Get current user

### Timesheets
- `GET /api/v1/timesheets/` - List timesheets
- `POST /api/v1/timesheets/` - Create timesheet
- `POST /api/v1/timesheets/{id}/submit` - Submit timesheet
- `GET /api/v1/timesheets/pending` - List pending (admin)
- `POST /api/v1/timesheets/{id}/review` - Approve/reject (admin)

### Documents
- `GET /api/v1/documents/` - List documents
- `POST /api/v1/documents/` - Upload document
- `GET /api/v1/documents/pending` - List pending (admin)
- `POST /api/v1/documents/{id}/review` - Approve/reject (admin)

### Programs
- `GET /api/v1/programs/` - List programs
- `GET /api/v1/programs/available` - List available for enrollment
- `POST /api/v1/programs/{id}/enroll` - Enroll in program
- `GET /api/v1/programs/admin/all` - List all (admin)
- `POST /api/v1/programs/` - Create program (admin)
- `PUT /api/v1/programs/{id}` - Update program (admin)
- `DELETE /api/v1/programs/{id}` - Delete program (admin)

### Opportunities
- `GET /api/v1/opportunities/` - List opportunities
- `GET /api/v1/opportunities/featured` - List featured
- `GET /api/v1/opportunities/admin/all` - List all (admin)
- `POST /api/v1/opportunities/` - Create (admin)
- `PUT /api/v1/opportunities/{id}` - Update (admin)
- `DELETE /api/v1/opportunities/{id}` - Delete (admin)

### Learning
- `GET /api/v1/learning/progress` - Get learning progress
- `PUT /api/v1/learning/progress/{lesson_id}` - Update lesson progress
- `GET /api/v1/learning/announcements` - Get announcements

### Users
- `PUT /api/v1/users/me` - Update profile
- `GET /api/v1/users/students` - List students (admin)

## License

Copyright 2024 Career Focus. All rights reserved.
