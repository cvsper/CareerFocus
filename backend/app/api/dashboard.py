from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, date

from app.core.database import get_db
from app.core.security import get_current_active_user, get_current_admin_user
from app.models.user import User
from app.models.program import Enrollment, EnrollmentStatus
from app.models.timesheet import Timesheet, TimesheetStatus
from app.models.document import Document, DocumentStatus
from app.models.learning import LearningProgress, Announcement

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


class StudentDashboardResponse(BaseModel):
    student_name: str
    program_name: Optional[str] = None
    program_status: Optional[str] = None
    total_hours: float
    current_pay_period_start: Optional[date] = None
    current_pay_period_end: Optional[date] = None
    timesheet_status: str
    pending_documents: int
    completed_lessons: int
    total_lessons: int


class AdminDashboardResponse(BaseModel):
    total_students: int
    active_students: int
    pending_timesheets: int
    pending_documents: int
    total_hours_pending: float


@router.get("/student", response_model=StudentDashboardResponse)
def get_student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get dashboard data for current student"""
    # Get current enrollment
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.status == EnrollmentStatus.active.value
    ).first()

    program_name = None
    program_status = None
    if enrollment and enrollment.program:
        program_name = enrollment.program.name
        program_status = enrollment.status

    # Get total hours from approved timesheets
    total_hours = db.query(func.sum(Timesheet.total_hours)).filter(
        Timesheet.student_id == current_user.id,
        Timesheet.status == TimesheetStatus.approved.value
    ).scalar() or 0

    # Get current/latest timesheet
    latest_timesheet = db.query(Timesheet).filter(
        Timesheet.student_id == current_user.id
    ).order_by(Timesheet.week_start.desc()).first()

    timesheet_status = "Not Submitted"
    current_pay_period_start = None
    current_pay_period_end = None

    if latest_timesheet:
        current_pay_period_start = latest_timesheet.week_start
        current_pay_period_end = latest_timesheet.week_end
        if latest_timesheet.status == TimesheetStatus.approved.value:
            timesheet_status = "Approved"
        elif latest_timesheet.status == TimesheetStatus.submitted.value:
            timesheet_status = "Submitted"
        elif latest_timesheet.status == TimesheetStatus.rejected.value:
            timesheet_status = "Rejected"
        else:
            timesheet_status = "Draft"

    # Get pending documents count
    pending_documents = db.query(Document).filter(
        Document.student_id == current_user.id,
        Document.status == DocumentStatus.pending.value
    ).count()

    # Get learning progress
    completed_lessons = db.query(LearningProgress).filter(
        LearningProgress.student_id == current_user.id,
        LearningProgress.completed == True
    ).count()

    total_lessons = 8  # Hardcoded based on frontend lessons

    return StudentDashboardResponse(
        student_name=current_user.first_name,
        program_name=program_name,
        program_status=program_status,
        total_hours=total_hours,
        current_pay_period_start=current_pay_period_start,
        current_pay_period_end=current_pay_period_end,
        timesheet_status=timesheet_status,
        pending_documents=pending_documents,
        completed_lessons=completed_lessons,
        total_lessons=total_lessons
    )


@router.get("/admin", response_model=AdminDashboardResponse)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get dashboard data for admin"""
    # Total students
    total_students = db.query(User).filter(User.role == "student").count()

    # Active students (with active enrollment)
    active_students = db.query(Enrollment).filter(
        Enrollment.status == EnrollmentStatus.active.value
    ).distinct(Enrollment.student_id).count()

    # Pending timesheets
    pending_timesheets = db.query(Timesheet).filter(
        Timesheet.status == TimesheetStatus.submitted.value
    ).count()

    # Pending documents
    pending_documents = db.query(Document).filter(
        Document.status == DocumentStatus.pending.value
    ).count()

    # Total hours pending approval
    total_hours_pending = db.query(func.sum(Timesheet.total_hours)).filter(
        Timesheet.status == TimesheetStatus.submitted.value
    ).scalar() or 0

    return AdminDashboardResponse(
        total_students=total_students,
        active_students=active_students,
        pending_timesheets=pending_timesheets,
        pending_documents=pending_documents,
        total_hours_pending=total_hours_pending
    )
