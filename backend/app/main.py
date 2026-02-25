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
    from app.models import User, Program, Enrollment, Opportunity, Announcement, ContractorOnboarding
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

        # WBLE Participant 1
        wble1 = User(
            email="john.smith@email.com",
            hashed_password=get_password_hash("student123"),
            first_name="John",
            last_name="Smith",
            phone="(555) 123-4567",
            address="123 Campus Drive, Dorm A, Room 304",
            role="wble_participant",
            employment_type="participant",
            is_active=True,
            emergency_contact_name="Sarah Smith",
            emergency_contact_phone="(555) 987-6543",
            emergency_contact_relationship="Mother"
        )
        db.add(wble1)

        # WBLE Participant 2
        wble2 = User(
            email="emily.johnson@email.com",
            hashed_password=get_password_hash("student123"),
            first_name="Emily",
            last_name="Johnson",
            phone="(555) 234-5678",
            address="456 University Ave, Apt 201",
            role="wble_participant",
            employment_type="participant",
            is_active=True,
            emergency_contact_name="Michael Johnson",
            emergency_contact_phone="(555) 876-5432",
            emergency_contact_relationship="Father"
        )
        db.add(wble2)

        # WBLE Participant 3
        wble3 = User(
            email="marcus.williams@email.com",
            hashed_password=get_password_hash("student123"),
            first_name="Marcus",
            last_name="Williams",
            phone="(555) 345-6789",
            address="789 College Blvd, Suite 5",
            role="wble_participant",
            employment_type="participant",
            is_active=True,
            emergency_contact_name="Lisa Williams",
            emergency_contact_phone="(555) 765-4321",
            emergency_contact_relationship="Mother"
        )
        db.add(wble3)

        # Contractor 1
        contractor1 = User(
            email="maria.garcia@email.com",
            hashed_password=get_password_hash("contractor123"),
            first_name="Maria",
            last_name="Garcia",
            phone="(555) 456-7890",
            address="321 Oak Lane, Wesley Chapel, FL 33544",
            role="contractor",
            employment_type="1099",
            hourly_rate=22.50,
            company_start_date=date.today() - timedelta(days=90),
            job_title="Home Health Aide",
            is_active=True,
            emergency_contact_name="Carlos Garcia",
            emergency_contact_phone="(555) 654-3210",
            emergency_contact_relationship="Spouse"
        )
        db.add(contractor1)

        # Contractor 2
        contractor2 = User(
            email="james.brown@email.com",
            hashed_password=get_password_hash("contractor123"),
            first_name="James",
            last_name="Brown",
            phone="(555) 567-8901",
            address="654 Pine Street, Tampa, FL 33601",
            role="contractor",
            employment_type="1099",
            hourly_rate=25.00,
            company_start_date=date.today() - timedelta(days=30),
            job_title="Certified Nursing Assistant",
            is_active=True,
        )
        db.add(contractor2)

        # Employee 1
        employee1 = User(
            email="sarah.chen@careerfocus.org",
            hashed_password=get_password_hash("employee123"),
            first_name="Sarah",
            last_name="Chen",
            phone="(555) 678-9012",
            address="987 Corporate Blvd, Suite 202",
            role="employee",
            employment_type="w2",
            department="Operations",
            company_start_date=date.today() - timedelta(days=365),
            job_title="Program Coordinator",
            is_active=True,
        )
        db.add(employee1)

        # TTW Participant 1
        ttw1 = User(
            email="david.martinez@email.com",
            hashed_password=get_password_hash("ttw123"),
            first_name="David",
            last_name="Martinez",
            phone="(555) 789-0123",
            address="246 Elm Street, Tampa, FL 33602",
            role="ttw_participant",
            employment_type="participant",
            is_active=True,
            sga_monthly_limit=1470.00,
            vr_counselor_name="Dr. Patricia Lee",
            vr_counselor_phone="(813) 555-0199",
            emergency_contact_name="Rosa Martinez",
            emergency_contact_phone="(555) 890-1234",
            emergency_contact_relationship="Mother"
        )
        db.add(ttw1)

        db.flush()

        # ============ CONTRACTOR ONBOARDING ============
        onboarding1 = ContractorOnboarding(
            user_id=contractor1.id,
            onboarding_status="in_progress",
            documents_complete=False,
            training_complete=False,
            ready_for_assignment=False,
        )
        db.add(onboarding1)

        onboarding2 = ContractorOnboarding(
            user_id=contractor2.id,
            onboarding_status="pending",
            documents_complete=False,
            training_complete=False,
            ready_for_assignment=False,
        )
        db.add(onboarding2)

        # ============ PROGRAMS ============
        today = date.today()

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

        program2 = Program(
            name="Fall Healthcare Pathway",
            description="Explore careers in healthcare through job shadowing and hands-on training at Regional Medical Center.",
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

        program3 = Program(
            name="Business Administration Internship",
            description="Learn business fundamentals while supporting local economic development initiatives.",
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

        program4 = Program(
            name="Construction Trades Apprenticeship",
            description="Learn fundamental construction skills including carpentry, electrical basics, and safety protocols.",
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
        enrollment1 = Enrollment(
            student_id=wble1.id,
            program_id=program1.id,
            status=EnrollmentStatus.active.value,
            hours_completed=124.5,
            supervisor_name="Sarah Johnson"
        )
        db.add(enrollment1)

        enrollment2 = Enrollment(
            student_id=wble2.id,
            program_id=program2.id,
            status=EnrollmentStatus.active.value,
            hours_completed=0,
            supervisor_name="Dr. Michael Brown"
        )
        db.add(enrollment2)

        enrollment3 = Enrollment(
            student_id=wble1.id,
            program_id=program5.id,
            status=EnrollmentStatus.completed.value,
            hours_completed=40,
            completed_at=datetime.now() - timedelta(days=90)
        )
        db.add(enrollment3)

        # TTW participant enrollment
        enrollment4 = Enrollment(
            student_id=ttw1.id,
            program_id=program3.id,
            status=EnrollmentStatus.active.value,
            hours_completed=16,
            supervisor_name="Janet Wilson"
        )
        db.add(enrollment4)

        # ============ OPPORTUNITIES ============
        opp1 = Opportunity(
            title="Software Development Intern",
            organization="TechCorp Solutions",
            location="Downtown Campus",
            opportunity_type="Internship",
            description="Join our engineering team to work on real-world software projects.",
            requirements="Currently enrolled student, Basic programming knowledge, Strong communication skills",
            duration="12 weeks",
            hours_per_week="20-25",
            compensation="Paid - $18/hr",
            application_deadline=today + timedelta(days=30),
            is_featured=True,
            is_active=True
        )
        db.add(opp1)

        opp2 = Opportunity(
            title="Healthcare Administrative Assistant",
            organization="Regional Medical Center",
            location="Medical District",
            opportunity_type="Pathway",
            description="Learn healthcare administration while supporting patient services.",
            requirements="Interest in healthcare, Computer proficiency, Attention to detail",
            duration="10 weeks",
            hours_per_week="15-20",
            compensation="Paid - $16/hr",
            application_deadline=today + timedelta(days=45),
            is_featured=True,
            is_active=True
        )
        db.add(opp2)

        opp3 = Opportunity(
            title="Home Health Aide - Contractor",
            organization="Career Focus Inc.",
            location="Wesley Chapel / Tampa Area",
            opportunity_type="Contract",
            description="Provide in-home care to patients. Requires CPR, HIPAA, and background check.",
            requirements="CPR Certification, HIPAA Training, Background Check, Driver's License",
            duration="Ongoing",
            hours_per_week="20-40",
            compensation="$22-28/hr (1099)",
            application_deadline=None,
            is_featured=True,
            is_active=True
        )
        db.add(opp3)

        opp4 = Opportunity(
            title="Retail Customer Service",
            organization="Community Retail Partners",
            location="Various Locations",
            opportunity_type="Part-Time",
            description="Develop customer service and sales skills in a supportive retail environment.",
            requirements="Friendly attitude, Reliable, Weekend availability",
            duration="Ongoing",
            hours_per_week="10-15",
            compensation="Paid - $14/hr",
            application_deadline=None,
            is_featured=False,
            is_active=True
        )
        db.add(opp4)

        opp5 = Opportunity(
            title="Construction Trades Apprentice",
            organization="BuildWell Construction",
            location="Industrial Park",
            opportunity_type="Apprenticeship",
            description="Learn fundamental construction skills and earn industry certifications.",
            requirements="Physical capability, Safety orientation, 18+ years old",
            duration="16 weeks",
            hours_per_week="25-30",
            compensation="Paid + Certification",
            application_deadline=today + timedelta(days=60),
            is_featured=False,
            is_active=True
        )
        db.add(opp5)

        # ============ ANNOUNCEMENTS ============
        ann1 = Announcement(
            title="Payroll Processing Update",
            message="Timesheets for this pay period must be submitted by Friday 5PM. Late submissions may delay your payment.",
            announcement_type="warning",
            is_active=True
        )
        db.add(ann1)

        ann2 = Announcement(
            title="New Contractor Positions Available",
            message="Career Focus is hiring home health aides. Competitive 1099 rates with flexible scheduling. Apply through the portal.",
            announcement_type="info",
            is_active=True
        )
        db.add(ann2)

        ann3 = Announcement(
            title="Professional Development Workshop",
            message="Join us for a resume writing workshop next Tuesday at 3PM in the Career Center. RSVP through the portal.",
            announcement_type="info",
            is_active=True
        )
        db.add(ann3)

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
        print("  Admin:      admin@careerfocus.org / admin123")
        print("  WBLE:       john.smith@email.com / student123")
        print("  WBLE:       emily.johnson@email.com / student123")
        print("  WBLE:       marcus.williams@email.com / student123")
        print("  Contractor: maria.garcia@email.com / contractor123")
        print("  Contractor: james.brown@email.com / contractor123")
        print("  Employee:   sarah.chen@careerfocus.org / employee123")
        print("  TTW:        david.martinez@email.com / ttw123")
        print("=" * 50)

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


def reseed_database():
    """Force reseed the database - clears existing data"""
    from app.models import User, Program, Enrollment, Opportunity, Announcement, Timesheet, Document, LearningProgress, ContractorOnboarding
    from app.models.timesheet import TimesheetEntry

    db = SessionLocal()
    try:
        print("Clearing existing data...")
        # Delete in order respecting foreign key constraints
        db.query(TimesheetEntry).delete()
        db.query(LearningProgress).delete()
        db.query(Document).delete()
        db.query(Timesheet).delete()
        db.query(ContractorOnboarding).delete()
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
    import os
    # One-time schema migration: drop old tables and recreate with new schema
    if os.getenv("RESET_DB", "false").lower() == "true":
        print("RESET_DB=true: Dropping all tables and recreating...")
        Base.metadata.drop_all(bind=engine)
    # Create database tables
    create_tables()
    # Seed if empty
    seed_database_if_empty()


@app.get("/")
async def root():
    return {
        "message": "Career Focus Portal API",
        "docs": f"{settings.API_V1_PREFIX}/docs",
        "health": "ok"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
