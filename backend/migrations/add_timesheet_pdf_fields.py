"""
Migration script to add PDF timesheet fields to the database.
Run this script to add the new columns for PDF generation support.

Usage:
    python migrations/add_timesheet_pdf_fields.py
"""
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import engine


def run_migration():
    """Add new columns for PDF timesheet generation"""

    migrations = [
        # User table - add case_id and job_title
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS case_id VARCHAR UNIQUE;
        """,
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS job_title VARCHAR;
        """,

        # Enrollment table - add worksite_phone
        """
        ALTER TABLE enrollments
        ADD COLUMN IF NOT EXISTS worksite_phone VARCHAR;
        """,

        # Timesheet table - add signature fields
        """
        ALTER TABLE timesheets
        ADD COLUMN IF NOT EXISTS signature TEXT;
        """,
        """
        ALTER TABLE timesheets
        ADD COLUMN IF NOT EXISTS signature_date DATE;
        """,

        # TimesheetEntry table - add lunch times
        """
        ALTER TABLE timesheet_entries
        ADD COLUMN IF NOT EXISTS lunch_out TIME;
        """,
        """
        ALTER TABLE timesheet_entries
        ADD COLUMN IF NOT EXISTS lunch_in TIME;
        """,
    ]

    with engine.connect() as conn:
        for sql in migrations:
            try:
                conn.execute(text(sql))
                conn.commit()
                print(f"OK: {sql.strip().split(chr(10))[1].strip()[:60]}...")
            except Exception as e:
                if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
                    print(f"SKIP (already exists): {sql.strip().split(chr(10))[1].strip()[:60]}...")
                else:
                    print(f"ERROR: {e}")
                    raise

    print("\nMigration completed successfully!")


if __name__ == "__main__":
    print("Running PDF timesheet fields migration...")
    print("-" * 50)
    run_migration()
