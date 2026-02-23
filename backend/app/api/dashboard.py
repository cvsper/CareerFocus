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
    role: str = "wble_participant"
    program_name: Optional[str] = None
    program_status: Optional[str] = None
    total_hours: float
    current_pay_period_start: Optional[date] = None
    current_pay_period_end: Optional[date] = None
    timesheet_status: str
    pending_documents: int
    completed_lessons: int
    total_lessons: int
    # TTW-specific
    sga_monthly_limit: Optional[float] = None
    hours_this_month: Optional[float] = None
    # Contractor-specific
    onboarding_status: Optional[str] = None
    documents_complete: Optional[bool] = None


class AdminDashboardResponse(BaseModel):
    total_users: int
    total_wble: int
    total_ttw: int
    total_contractors: int
    total_employees: int
    active_participants: int
    pending_timesheets: int
    pending_documents: int
    total_hours_pending: float


@router.get("/student", response_model=StudentDashboardResponse)
def get_student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get dashboard data for current user (any non-admin role)"""
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

    # TTW-specific: hours this month for SGA tracking
    hours_this_month = None
    sga_monthly_limit = None
    if current_user.role == "ttw_participant":
        today = date.today()
        first_of_month = today.replace(day=1)
        hours_this_month = db.query(func.sum(Timesheet.total_hours)).filter(
            Timesheet.student_id == current_user.id,
            Timesheet.status == TimesheetStatus.approved.value,
            Timesheet.week_start >= first_of_month
        ).scalar() or 0
        sga_monthly_limit = float(current_user.sga_monthly_limit) if current_user.sga_monthly_limit else 1470.0

    # Contractor-specific: onboarding status
    onboarding_status = None
    documents_complete = None
    if current_user.role == "contractor" and current_user.contractor_onboarding:
        onboarding_status = current_user.contractor_onboarding.onboarding_status
        documents_complete = current_user.contractor_onboarding.documents_complete

    return StudentDashboardResponse(
        student_name=current_user.first_name,
        role=current_user.role,
        program_name=program_name,
        program_status=program_status,
        total_hours=total_hours,
        current_pay_period_start=current_pay_period_start,
        current_pay_period_end=current_pay_period_end,
        timesheet_status=timesheet_status,
        pending_documents=pending_documents,
        completed_lessons=completed_lessons,
        total_lessons=total_lessons,
        sga_monthly_limit=sga_monthly_limit,
        hours_this_month=hours_this_month,
        onboarding_status=onboarding_status,
        documents_complete=documents_complete,
    )


@router.get("/admin", response_model=AdminDashboardResponse)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get dashboard data for admin"""
    # Count users by role
    total_users = db.query(User).filter(User.role != "admin").count()
    total_wble = db.query(User).filter(User.role.in_(["wble_participant", "student"])).count()
    total_ttw = db.query(User).filter(User.role == "ttw_participant").count()
    total_contractors = db.query(User).filter(User.role == "contractor").count()
    total_employees = db.query(User).filter(User.role == "employee").count()

    # Active participants (with active enrollment)
    active_participants = db.query(Enrollment).filter(
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
        total_users=total_users,
        total_wble=total_wble,
        total_ttw=total_ttw,
        total_contractors=total_contractors,
        total_employees=total_employees,
        active_participants=active_participants,
        pending_timesheets=pending_timesheets,
        pending_documents=pending_documents,
        total_hours_pending=total_hours_pending
    )
