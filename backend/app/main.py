from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_tables, SessionLocal
from app.api import api_router

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


def seed_database_if_empty():
    """Seed database with initial data if empty"""
    from app.models import User, Program, Enrollment, Opportunity, Announcement
    from app.models.program import ProgramStatus, EnrollmentStatus
    from app.core.security import get_password_hash
    from datetime import date

    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(User).first():
            print("Database already has data, skipping seed.")
            return

        print("Seeding database with initial data...")

        # Create admin user
        admin = User(
            email="admin@careerfocus.org",
            hashed_password=get_password_hash("admin123"),
            first_name="Admin",
            last_name="User",
            role="admin",
            is_active=True
        )
        db.add(admin)

        # Create demo student
        student = User(
            email="john.smith@email.com",
            hashed_password=get_password_hash("student123"),
            first_name="John",
            last_name="Smith",
            phone="(555) 123-4567",
            address="123 Campus Drive, Dorm A, Room 304",
            role="student",
            is_active=True,
            emergency_contact_name="Sarah Smith",
            emergency_contact_phone="(555) 987-6543",
            emergency_contact_relationship="Mother"
        )
        db.add(student)
        db.flush()

        # Create program
        program1 = Program(
            name="Summer Internship Program 2024",
            description="Gain hands-on experience in software development.",
            organization="TechCorp Solutions Inc.",
            location="Downtown Campus - Building A",
            start_date=date(2024, 6, 3),
            end_date=date(2024, 8, 23),
            total_hours=320,
            spots_available=0,
            status=ProgramStatus.in_progress.value
        )
        db.add(program1)
        db.flush()

        # Create enrollment
        enrollment = Enrollment(
            student_id=student.id,
            program_id=program1.id,
            status=EnrollmentStatus.active.value,
            hours_completed=124.5,
            supervisor_name="Sarah Johnson"
        )
        db.add(enrollment)

        # Create opportunities
        opp1 = Opportunity(
            title="Software Development Intern",
            organization="TechCorp Solutions",
            location="Downtown Campus",
            opportunity_type="Internship",
            description="Join our engineering team to work on real-world software projects.",
            duration="12 weeks",
            hours_per_week="20-25",
            compensation="Paid",
            application_deadline=date(2024, 11, 15),
            is_featured=True,
            is_active=True
        )
        db.add(opp1)

        # Create announcement
        ann1 = Announcement(
            title="Payroll Processing Update",
            message="Timesheets for this period must be submitted by Friday 5PM.",
            announcement_type="warning",
            is_active=True
        )
        db.add(ann1)

        db.commit()
        print("Database seeded successfully!")
        print("Demo accounts: admin@careerfocus.org/admin123, john.smith@email.com/student123")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


@app.on_event("startup")
async def startup_event():
    # Create database tables
    create_tables()
    # Seed if empty
    seed_database_if_empty()


@app.get("/")
async def root():
    return {
        "message": "WBLE Student Portal API",
        "docs": f"{settings.API_V1_PREFIX}/docs",
        "health": "ok"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/debug/db-status")
async def db_status():
    """Check database status - for debugging only"""
    from app.models import User
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        users = db.query(User).all()
        user_list = [{"id": u.id, "email": u.email, "role": u.role} for u in users]
        return {
            "user_count": user_count,
            "users": user_list,
            "database_connected": True
        }
    except Exception as e:
        return {"error": str(e), "database_connected": False}
    finally:
        db.close()


@app.post("/debug/seed")
async def manual_seed():
    """Manually trigger database seeding - for debugging only"""
    try:
        seed_database_if_empty()
        return {"message": "Seed completed"}
    except Exception as e:
        return {"error": str(e)}
