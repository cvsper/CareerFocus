from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_active_user, get_current_admin_user
from app.models.user import User
from app.models.timesheet import Timesheet, TimesheetStatus
from app.models.document import Document, DocumentStatus
from app.models.program import Enrollment
from app.schemas.user import UserResponse, UserUpdate, StudentProfileResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all users (admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/students", response_model=List[UserResponse])
def list_students(
    skip: int = 0,
    limit: int = 100,
    role: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List users by role (admin only). Without role filter, returns all non-admin users."""
    query = db.query(User).filter(User.role != "admin")
    if role:
        query = query.filter(User.role == role)
    users = query.offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user by ID"""
    # Students can only view their own profile
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update current user's profile"""
    update_data = user_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/students/{student_id}/profile", response_model=StudentProfileResponse)
def get_student_profile(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get comprehensive student profile (admin only)"""
    student = db.query(User).filter(
        User.id == student_id,
        User.role != "admin"
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Get all timesheets
    timesheets = db.query(Timesheet).filter(
        Timesheet.student_id == student_id
    ).order_by(Timesheet.week_start.desc()).all()

    # Get all documents
    documents = db.query(Document).filter(
        Document.student_id == student_id
    ).order_by(Document.uploaded_at.desc()).all()

    # Get all enrollments
    enrollments = db.query(Enrollment).filter(
        Enrollment.student_id == student_id
    ).all()

    # Calculate stats
    total_hours = sum(ts.total_hours for ts in timesheets if ts.status == TimesheetStatus.approved.value)
    pending_ts = sum(1 for ts in timesheets if ts.status == TimesheetStatus.submitted.value)
    approved_ts = sum(1 for ts in timesheets if ts.status == TimesheetStatus.approved.value)
    pending_docs = sum(1 for doc in documents if doc.status == DocumentStatus.pending.value)
    approved_docs = sum(1 for doc in documents if doc.status == DocumentStatus.approved.value)

    # Get current program
    current_enrollment = next(
        (e for e in enrollments if e.status == 'active'),
        None
    )
    current_program = current_enrollment.program.name if current_enrollment else None

    # Build timesheet list
    timesheet_list = [
        {
            "id": ts.id,
            "week_start": ts.week_start.isoformat(),
            "week_end": ts.week_end.isoformat(),
            "total_hours": ts.total_hours,
            "status": ts.status,
            "submitted_at": ts.submitted_at.isoformat() if ts.submitted_at else None,
            "reviewed_at": ts.reviewed_at.isoformat() if ts.reviewed_at else None,
            "rejection_reason": ts.rejection_reason,
        }
        for ts in timesheets
    ]

    # Build document list
    document_list = [
        {
            "id": doc.id,
            "document_type": doc.document_type,
            "file_name": doc.file_name,
            "file_url": doc.file_url,
            "status": doc.status,
            "uploaded_at": doc.uploaded_at.isoformat(),
            "reviewed_at": doc.reviewed_at.isoformat() if doc.reviewed_at else None,
            "rejection_reason": doc.rejection_reason,
        }
        for doc in documents
    ]

    # Build enrollment list
    enrollment_list = [
        {
            "id": e.id,
            "program_id": e.program_id,
            "program_name": e.program.name,
            "organization": e.program.organization,
            "status": e.status,
            "hours_completed": e.hours_completed,
            "supervisor_name": e.supervisor_name,
            "worksite_phone": e.worksite_phone,
            "enrolled_at": e.enrolled_at.isoformat(),
            "completed_at": e.completed_at.isoformat() if e.completed_at else None,
        }
        for e in enrollments
    ]

    return StudentProfileResponse(
        id=student.id,
        email=student.email,
        first_name=student.first_name,
        last_name=student.last_name,
        phone=student.phone,
        address=student.address,
        role=student.role,
        is_active=student.is_active,
        created_at=student.created_at,
        case_id=student.case_id,
        job_title=student.job_title,
        emergency_contact_name=student.emergency_contact_name,
        emergency_contact_phone=student.emergency_contact_phone,
        emergency_contact_relationship=student.emergency_contact_relationship,
        enrollments=enrollment_list,
        timesheets=timesheet_list,
        documents=document_list,
        total_hours_worked=total_hours,
        pending_timesheets=pending_ts,
        approved_timesheets=approved_ts,
        pending_documents=pending_docs,
        approved_documents=approved_docs,
        current_program=current_program,
    )


@router.put("/{user_id}/deactivate", response_model=UserResponse)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Deactivate a user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.is_active = False
    db.commit()
    db.refresh(user)
    return user
