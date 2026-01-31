"""
Seed script to populate the database with initial data.
Run with: python seed.py
"""
from datetime import date, datetime, timedelta
from app.core.database import SessionLocal, create_tables
from app.core.security import get_password_hash
from app.models import (
    User, Program, Enrollment, Opportunity, Announcement,
    ProgramStatus, EnrollmentStatus
)


def seed_database():
    create_tables()
    db = SessionLocal()

    try:
        # Check if data already exists
        if db.query(User).first():
            print("Database already seeded. Skipping...")
            return

        print("Seeding database...")

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

        # Create another student
        student2 = User(
            email="emily.johnson@email.com",
            hashed_password=get_password_hash("student123"),
            first_name="Emily",
            last_name="Johnson",
            role="student",
            is_active=True
        )
        db.add(student2)

        db.flush()

        # Create programs
        program1 = Program(
            name="Summer Internship Program 2024",
            description="Gain hands-on experience in software development while working on real projects with a dedicated team of mentors.",
            organization="TechCorp Solutions Inc.",
            location="Downtown Campus - Building A",
            start_date=date(2024, 6, 3),
            end_date=date(2024, 8, 23),
            total_hours=320,
            spots_available=0,
            status=ProgramStatus.in_progress.value
        )
        db.add(program1)

        program2 = Program(
            name="Fall Healthcare Pathway",
            description="Explore careers in healthcare through job shadowing and hands-on training.",
            organization="Regional Medical Center",
            location="Medical District",
            start_date=date(2024, 9, 9),
            end_date=date(2024, 12, 6),
            total_hours=200,
            spots_available=8,
            application_deadline=date(2024, 8, 15),
            status=ProgramStatus.open.value
        )
        db.add(program2)

        program3 = Program(
            name="Business Administration Internship",
            description="Learn business fundamentals while supporting local economic development initiatives.",
            organization="City Chamber of Commerce",
            location="City Center",
            start_date=date(2024, 10, 1),
            end_date=date(2024, 12, 15),
            total_hours=150,
            spots_available=6,
            application_deadline=date(2024, 9, 1),
            status=ProgramStatus.open.value
        )
        db.add(program3)

        db.flush()

        # Create enrollment for John
        enrollment = Enrollment(
            student_id=student.id,
            program_id=program1.id,
            status=EnrollmentStatus.active.value,
            hours_completed=124.5,
            supervisor_name="Sarah Johnson"
        )
        db.add(enrollment)

        # Create opportunities
        opportunities = [
            Opportunity(
                title="Software Development Intern",
                organization="TechCorp Solutions",
                location="Downtown Campus",
                opportunity_type="Internship",
                description="Join our engineering team to work on real-world software projects.",
                requirements='["Currently enrolled student", "Basic programming knowledge", "Strong communication skills"]',
                duration="12 weeks",
                hours_per_week="20-25",
                compensation="Paid",
                application_deadline=date(2024, 11, 15),
                is_featured=True,
                is_active=True
            ),
            Opportunity(
                title="Healthcare Administrative Assistant",
                organization="Regional Medical Center",
                location="Medical District",
                opportunity_type="Pathway",
                description="Learn healthcare administration while supporting patient services.",
                requirements='["Interest in healthcare", "Computer proficiency", "Attention to detail"]',
                duration="10 weeks",
                hours_per_week="15-20",
                compensation="Paid",
                application_deadline=date(2024, 12, 1),
                is_featured=True,
                is_active=True
            ),
            Opportunity(
                title="Marketing & Communications Intern",
                organization="City Chamber of Commerce",
                location="City Center",
                opportunity_type="Internship",
                description="Support marketing campaigns and community outreach initiatives.",
                requirements='["Strong writing skills", "Social media familiarity", "Creative mindset"]',
                duration="8 weeks",
                hours_per_week="15-20",
                compensation="Paid",
                application_deadline=date(2024, 11, 20),
                is_featured=False,
                is_active=True
            ),
            Opportunity(
                title="Retail Customer Service",
                organization="Community Retail Partners",
                location="Various Locations",
                opportunity_type="Part-Time",
                description="Develop customer service and sales skills in a supportive retail environment.",
                requirements='["Friendly attitude", "Reliable", "Weekend availability"]',
                duration="Ongoing",
                hours_per_week="10-15",
                compensation="Paid",
                is_featured=False,
                is_active=True
            ),
        ]
        for opp in opportunities:
            db.add(opp)

        # Create announcements
        announcements = [
            Announcement(
                title="Payroll Processing Update",
                message="Timesheets for this period must be submitted by Friday 5PM.",
                announcement_type="warning",
                is_active=True
            ),
            Announcement(
                title="New Learning Content Available",
                message="Check out our new lesson on reading pay stubs.",
                announcement_type="info",
                is_active=True
            ),
        ]
        for ann in announcements:
            db.add(ann)

        db.commit()
        print("Database seeded successfully!")
        print("\nDemo Credentials:")
        print("  Admin: admin@careerfocus.org / admin123")
        print("  Student: john.smith@email.com / student123")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
