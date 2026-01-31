from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user, get_current_admin_user
from app.models.user import User
from app.models.timesheet import Timesheet, TimesheetEntry, TimesheetStatus
from app.schemas.timesheet import (
    TimesheetCreate, TimesheetUpdate, TimesheetResponse,
    TimesheetListResponse, TimesheetReview, TimesheetWithStudentResponse
)

router = APIRouter(prefix="/timesheets", tags=["Timesheets"])


@router.get("/", response_model=List[TimesheetListResponse])
def list_timesheets(
    skip: int = 0,
    limit: int = 50,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List timesheets (students see their own, admins see all)"""
    query = db.query(Timesheet)

    if current_user.role == "student":
        query = query.filter(Timesheet.student_id == current_user.id)

    if status:
        query = query.filter(Timesheet.status == status)

    timesheets = query.order_by(Timesheet.week_start.desc()).offset(skip).limit(limit).all()
    return timesheets


@router.get("/pending", response_model=List[TimesheetWithStudentResponse])
def list_pending_timesheets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List pending timesheets for approval (admin only)"""
    timesheets = db.query(Timesheet).filter(
        Timesheet.status == TimesheetStatus.submitted.value
    ).order_by(Timesheet.submitted_at.asc()).all()

    # Add student info to each timesheet
    result = []
    for ts in timesheets:
        student = db.query(User).filter(User.id == ts.student_id).first()
        ts_dict = {
            "id": ts.id,
            "student_id": ts.student_id,
            "week_start": ts.week_start,
            "week_end": ts.week_end,
            "total_hours": ts.total_hours,
            "status": ts.status,
            "notes": ts.notes,
            "submitted_at": ts.submitted_at,
            "reviewed_at": ts.reviewed_at,
            "rejection_reason": ts.rejection_reason,
            "entries": ts.entries,
            "created_at": ts.created_at,
            "student_name": f"{student.first_name} {student.last_name}" if student else None,
            "student_email": student.email if student else None
        }
        result.append(ts_dict)
    return result


@router.post("/", response_model=TimesheetResponse)
def create_timesheet(
    timesheet_data: TimesheetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new timesheet"""
    # Check for existing timesheet for this week
    existing = db.query(Timesheet).filter(
        Timesheet.student_id == current_user.id,
        Timesheet.week_start == timesheet_data.week_start
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Timesheet already exists for this week"
        )

    # Calculate total hours from entries
    total_hours = sum(entry.hours for entry in timesheet_data.entries)

    # Create timesheet
    db_timesheet = Timesheet(
        student_id=current_user.id,
        week_start=timesheet_data.week_start,
        week_end=timesheet_data.week_end,
        notes=timesheet_data.notes,
        total_hours=total_hours
    )
    db.add(db_timesheet)
    db.flush()

    # Create entries
    for entry_data in timesheet_data.entries:
        db_entry = TimesheetEntry(
            timesheet_id=db_timesheet.id,
            date=entry_data.date,
            start_time=entry_data.start_time,
            end_time=entry_data.end_time,
            break_minutes=entry_data.break_minutes,
            hours=entry_data.hours
        )
        db.add(db_entry)

    db.commit()
    db.refresh(db_timesheet)
    return db_timesheet


@router.get("/{timesheet_id}", response_model=TimesheetResponse)
def get_timesheet(
    timesheet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific timesheet"""
    timesheet = db.query(Timesheet).filter(Timesheet.id == timesheet_id).first()

    if not timesheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timesheet not found"
        )

    # Students can only view their own timesheets
    if current_user.role == "student" and timesheet.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this timesheet"
        )

    return timesheet


@router.put("/{timesheet_id}", response_model=TimesheetResponse)
def update_timesheet(
    timesheet_id: int,
    timesheet_update: TimesheetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a timesheet (only if draft or rejected)"""
    timesheet = db.query(Timesheet).filter(
        Timesheet.id == timesheet_id,
        Timesheet.student_id == current_user.id
    ).first()

    if not timesheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timesheet not found"
        )

    if timesheet.status not in [TimesheetStatus.draft.value, TimesheetStatus.rejected.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update submitted or approved timesheet"
        )

    # Update notes
    if timesheet_update.notes is not None:
        timesheet.notes = timesheet_update.notes

    # Update entries if provided
    if timesheet_update.entries is not None:
        # Delete existing entries
        db.query(TimesheetEntry).filter(
            TimesheetEntry.timesheet_id == timesheet_id
        ).delete()

        # Add new entries
        total_hours = 0
        for entry_data in timesheet_update.entries:
            db_entry = TimesheetEntry(
                timesheet_id=timesheet_id,
                date=entry_data.date,
                start_time=entry_data.start_time,
                end_time=entry_data.end_time,
                break_minutes=entry_data.break_minutes,
                hours=entry_data.hours
            )
            db.add(db_entry)
            total_hours += entry_data.hours

        timesheet.total_hours = total_hours

    db.commit()
    db.refresh(timesheet)
    return timesheet


@router.post("/{timesheet_id}/submit", response_model=TimesheetResponse)
def submit_timesheet(
    timesheet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Submit a timesheet for approval"""
    timesheet = db.query(Timesheet).filter(
        Timesheet.id == timesheet_id,
        Timesheet.student_id == current_user.id
    ).first()

    if not timesheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timesheet not found"
        )

    if timesheet.status not in [TimesheetStatus.draft.value, TimesheetStatus.rejected.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Timesheet already submitted"
        )

    timesheet.status = TimesheetStatus.submitted.value
    timesheet.submitted_at = datetime.utcnow()
    db.commit()
    db.refresh(timesheet)
    return timesheet


@router.post("/{timesheet_id}/review", response_model=TimesheetResponse)
def review_timesheet(
    timesheet_id: int,
    review: TimesheetReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Approve or reject a timesheet (admin only)"""
    timesheet = db.query(Timesheet).filter(Timesheet.id == timesheet_id).first()

    if not timesheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timesheet not found"
        )

    if timesheet.status != TimesheetStatus.submitted.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Timesheet is not pending review"
        )

    timesheet.reviewed_at = datetime.utcnow()
    timesheet.reviewed_by = current_user.id

    if review.approved:
        timesheet.status = TimesheetStatus.approved.value
    else:
        timesheet.status = TimesheetStatus.rejected.value
        timesheet.rejection_reason = review.rejection_reason

    db.commit()
    db.refresh(timesheet)
    return timesheet
