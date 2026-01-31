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
    from datetime import date, datetime, timedelta

    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(User).first():
            print("Database already has data, skipping seed.")
            return

        print("Seeding database with initial data...")

        # ============ USERS ============
        # Admin user
        admin = User(
            email="admin@careerfocus.org",
            hashed_password=get_password_hash("admin123"),
            first_name="Admin",
            last_name="User",
            role="admin",
            is_active=True
        )
        db.add(admin)

        # Demo student 1
        student1 = User(
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
        db.add(student1)

        # Demo student 2
        student2 = User(
            email="emily.johnson@email.com",
            hashed_password=get_password_hash("student123"),
            first_name="Emily",
            last_name="Johnson",
            phone="(555) 234-5678",
            address="456 University Ave, Apt 201",
            role="student",
            is_active=True,
            emergency_contact_name="Michael Johnson",
            emergency_contact_phone="(555) 876-5432",
            emergency_contact_relationship="Father"
        )
        db.add(student2)

        # Demo student 3
        student3 = User(
            email="marcus.williams@email.com",
            hashed_password=get_password_hash("student123"),
            first_name="Marcus",
            last_name="Williams",
            phone="(555) 345-6789",
            address="789 College Blvd, Suite 5",
            role="student",
            is_active=True,
            emergency_contact_name="Lisa Williams",
            emergency_contact_phone="(555) 765-4321",
            emergency_contact_relationship="Mother"
        )
        db.add(student3)

        # Demo student 4
        student4 = User(
            email="sarah.chen@email.com",
            hashed_password=get_password_hash("student123"),
            first_name="Sarah",
            last_name="Chen",
            phone="(555) 456-7890",
            role="student",
            is_active=True
        )
        db.add(student4)

        # Demo student 5
        student5 = User(
            email="alex.rivera@email.com",
            hashed_password=get_password_hash("student123"),
            first_name="Alex",
            last_name="Rivera",
            phone="(555) 567-8901",
            role="student",
            is_active=True
        )
        db.add(student5)

        db.flush()

        # ============ PROGRAMS ============
        today = date.today()

        # Program 1 - Current/In Progress
        program1 = Program(
            name="Summer Internship Program 2024",
            description="Gain hands-on experience in software development while working on real projects with a dedicated team of mentors. Learn modern technologies including React, Node.js, and cloud services.",
            organization="TechCorp Solutions Inc.",
            location="Downtown Campus - Building A",
            start_date=today - timedelta(days=60),
            end_date=today + timedelta(days=30),
            total_hours=320,
            spots_available=0,
            status=ProgramStatus.in_progress.value
        )
        db.add(program1)

        # Program 2 - Available for enrollment
        program2 = Program(
            name="Fall Healthcare Pathway",
            description="Explore careers in healthcare through job shadowing and hands-on training at Regional Medical Center. Perfect for students interested in nursing, medical technology, or healthcare administration.",
            organization="Regional Medical Center",
            location="Medical District - Main Hospital",
            start_date=today + timedelta(days=30),
            end_date=today + timedelta(days=120),
            total_hours=240,
            spots_available=8,
            application_deadline=today + timedelta(days=14),
            status=ProgramStatus.open.value
        )
        db.add(program2)

        # Program 3 - Available for enrollment
        program3 = Program(
            name="Business Administration Internship",
            description="Learn business fundamentals while supporting local economic development initiatives. Gain experience in marketing, finance, and project management.",
            organization="City Chamber of Commerce",
            location="City Center - Commerce Building",
            start_date=today + timedelta(days=45),
            end_date=today + timedelta(days=115),
            total_hours=200,
            spots_available=6,
            application_deadline=today + timedelta(days=21),
            status=ProgramStatus.open.value
        )
        db.add(program3)

        # Program 4 - Available for enrollment
        program4 = Program(
            name="Construction Trades Apprenticeship",
            description="Learn fundamental construction skills including carpentry, electrical basics, and safety protocols. Earn industry-recognized certifications upon completion.",
            organization="BuildWell Construction",
            location="Industrial Park - Training Center",
            start_date=today + timedelta(days=60),
            end_date=today + timedelta(days=180),
            total_hours=400,
            spots_available=12,
            application_deadline=today + timedelta(days=30),
            status=ProgramStatus.open.value
        )
        db.add(program4)

        # Program 5 - Completed
        program5 = Program(
            name="Spring Job Readiness Workshop",
            description="Essential skills training covering resume writing, interview techniques, and workplace professionalism.",
            organization="Career Focus",
            location="Community Center",
            start_date=today - timedelta(days=120),
            end_date=today - timedelta(days=90),
            total_hours=40,
            spots_available=0,
            status=ProgramStatus.completed.value
        )
        db.add(program5)

        db.flush()

        # ============ ENROLLMENTS ============
        # Student 1 enrolled in current program
        enrollment1 = Enrollment(
            student_id=student1.id,
            program_id=program1.id,
            status=EnrollmentStatus.active.value,
            hours_completed=124.5,
            supervisor_name="Sarah Johnson"
        )
        db.add(enrollment1)

        # Student 2 enrolled in healthcare pathway
        enrollment2 = Enrollment(
            student_id=student2.id,
            program_id=program2.id,
            status=EnrollmentStatus.active.value,
            hours_completed=0,
            supervisor_name="Dr. Michael Brown"
        )
        db.add(enrollment2)

        # Student 1 completed the workshop
        enrollment3 = Enrollment(
            student_id=student1.id,
            program_id=program5.id,
            status=EnrollmentStatus.completed.value,
            hours_completed=40,
            completed_at=datetime.now() - timedelta(days=90)
        )
        db.add(enrollment3)

        # ============ OPPORTUNITIES ============
        # Opportunity 1 - Featured Internship
        opp1 = Opportunity(
            title="Software Development Intern",
            organization="TechCorp Solutions",
            location="Downtown Campus",
            opportunity_type="Internship",
            description="Join our engineering team to work on real-world software projects. Gain experience with modern technologies including React, Node.js, and cloud services.",
            requirements="Currently enrolled student, Basic programming knowledge, Strong communication skills",
            duration="12 weeks",
            hours_per_week="20-25",
            compensation="Paid - $18/hr",
            application_deadline=today + timedelta(days=30),
            is_featured=True,
            is_active=True
        )
        db.add(opp1)

        # Opportunity 2 - Featured Healthcare
        opp2 = Opportunity(
            title="Healthcare Administrative Assistant",
            organization="Regional Medical Center",
            location="Medical District",
            opportunity_type="Pathway",
            description="Learn healthcare administration while supporting patient services and medical records management. Great opportunity to explore healthcare careers.",
            requirements="Interest in healthcare, Computer proficiency, Attention to detail",
            duration="10 weeks",
            hours_per_week="15-20",
            compensation="Paid - $16/hr",
            application_deadline=today + timedelta(days=45),
            is_featured=True,
            is_active=True
        )
        db.add(opp2)

        # Opportunity 3 - Marketing
        opp3 = Opportunity(
            title="Marketing & Communications Intern",
            organization="City Chamber of Commerce",
            location="City Center",
            opportunity_type="Internship",
            description="Support marketing campaigns and community outreach initiatives. Create content for social media and assist with event planning.",
            requirements="Strong writing skills, Social media familiarity, Creative mindset",
            duration="8 weeks",
            hours_per_week="15-20",
            compensation="Paid - $15/hr",
            application_deadline=today + timedelta(days=21),
            is_featured=False,
            is_active=True
        )
        db.add(opp3)

        # Opportunity 4 - Retail
        opp4 = Opportunity(
            title="Retail Customer Service",
            organization="Community Retail Partners",
            location="Various Locations",
            opportunity_type="Part-Time",
            description="Develop customer service and sales skills while working in a supportive retail environment. Flexible scheduling available.",
            requirements="Friendly attitude, Reliable, Weekend availability",
            duration="Ongoing",
            hours_per_week="10-15",
            compensation="Paid - $14/hr",
            application_deadline=None,
            is_featured=False,
            is_active=True
        )
        db.add(opp4)

        # Opportunity 5 - Construction
        opp5 = Opportunity(
            title="Construction Trades Apprentice",
            organization="BuildWell Construction",
            location="Industrial Park",
            opportunity_type="Apprenticeship",
            description="Learn fundamental construction skills including carpentry, electrical basics, and safety protocols. Earn industry certifications.",
            requirements="Physical capability, Safety orientation, 18+ years old",
            duration="16 weeks",
            hours_per_week="25-30",
            compensation="Paid + Certification",
            application_deadline=today + timedelta(days=60),
            is_featured=False,
            is_active=True
        )
        db.add(opp5)

        # Opportunity 6 - Finance
        opp6 = Opportunity(
            title="Finance & Accounting Intern",
            organization="First Community Bank",
            location="Financial District",
            opportunity_type="Internship",
            description="Gain experience in banking operations, financial analysis, and customer service. Learn about personal and commercial banking.",
            requirements="Math proficiency, Attention to detail, Professional demeanor",
            duration="10 weeks",
            hours_per_week="20",
            compensation="Paid - $17/hr",
            application_deadline=today + timedelta(days=35),
            is_featured=False,
            is_active=True
        )
        db.add(opp6)

        # Opportunity 7 - Nonprofit
        opp7 = Opportunity(
            title="Community Outreach Coordinator",
            organization="United Way",
            location="Community Center",
            opportunity_type="Part-Time",
            description="Help coordinate community programs and volunteer activities. Great for students interested in nonprofit work and social services.",
            requirements="Strong communication, Empathy, Organizational skills",
            duration="Ongoing",
            hours_per_week="10-15",
            compensation="Stipend + Experience",
            application_deadline=None,
            is_featured=False,
            is_active=True
        )
        db.add(opp7)

        # ============ ANNOUNCEMENTS ============
        # Announcement 1
        ann1 = Announcement(
            title="Payroll Processing Update",
            message="Timesheets for this pay period must be submitted by Friday 5PM. Late submissions may delay your payment.",
            announcement_type="warning",
            is_active=True
        )
        db.add(ann1)

        # Announcement 2
        ann2 = Announcement(
            title="New Opportunities Available",
            message="Check out the latest internship and job opportunities added this week. Several new positions in healthcare and technology sectors!",
            announcement_type="info",
            is_active=True
        )
        db.add(ann2)

        # Announcement 3
        ann3 = Announcement(
            title="Professional Development Workshop",
            message="Join us for a resume writing workshop next Tuesday at 3PM in the Career Center. RSVP through the portal.",
            announcement_type="info",
            is_active=True
        )
        db.add(ann3)

        # Announcement 4
        ann4 = Announcement(
            title="Document Submission Reminder",
            message="Please ensure all required documents are uploaded and approved before your placement start date.",
            announcement_type="warning",
            is_active=True
        )
        db.add(ann4)

        db.commit()
        print("Database seeded successfully!")
        print("=" * 50)
        print("Demo Accounts:")
        print("  Admin: admin@careerfocus.org / admin123")
        print("  Student: john.smith@email.com / student123")
        print("  Student: emily.johnson@email.com / student123")
        print("  Student: marcus.williams@email.com / student123")
        print("=" * 50)

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


def reseed_database():
    """Force reseed the database - clears existing data"""
    from app.models import User, Program, Enrollment, Opportunity, Announcement, Timesheet, Document, LearningProgress
    from app.models.timesheet import TimesheetEntry

    db = SessionLocal()
    try:
        print("Clearing existing data...")
        # Delete in order respecting foreign key constraints
        db.query(TimesheetEntry).delete()
        db.query(LearningProgress).delete()
        db.query(Document).delete()
        db.query(Timesheet).delete()
        db.query(Enrollment).delete()
        db.query(Program).delete()
        db.query(Opportunity).delete()
        db.query(Announcement).delete()
        db.query(User).delete()
        db.commit()
        print("Data cleared successfully.")
    except Exception as e:
        print(f"Error clearing data: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

    # Now seed fresh data
    seed_database_if_empty()


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
    from app.models import User, Program, Opportunity, Announcement
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        program_count = db.query(Program).count()
        opportunity_count = db.query(Opportunity).count()
        announcement_count = db.query(Announcement).count()

        users = db.query(User).all()
        user_list = [{"id": u.id, "email": u.email, "role": u.role} for u in users]
        return {
            "user_count": user_count,
            "program_count": program_count,
            "opportunity_count": opportunity_count,
            "announcement_count": announcement_count,
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


@app.post("/debug/reseed")
async def manual_reseed():
    """Force reseed database (clears existing data) - for debugging only"""
    try:
        reseed_database()
        return {"message": "Reseed completed - database refreshed with demo data"}
    except Exception as e:
        return {"error": str(e)}
