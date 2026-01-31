from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_active_user, get_current_admin_user
from app.models.user import User
from app.models.program import Program, Enrollment, ProgramStatus, EnrollmentStatus
from app.schemas.program import (
    ProgramCreate, ProgramUpdate, ProgramResponse,
    EnrollmentCreate, EnrollmentResponse
)

router = APIRouter(prefix="/programs", tags=["Programs"])


@router.get("/", response_model=List[ProgramResponse])
def list_programs(
    skip: int = 0,
    limit: int = 50,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all programs"""
    query = db.query(Program)

    if status:
        query = query.filter(Program.status == status)
    else:
        # By default, show open and in_progress programs
        query = query.filter(Program.status.in_([
            ProgramStatus.open.value,
            ProgramStatus.in_progress.value
        ]))

    programs = query.order_by(Program.start_date.desc()).offset(skip).limit(limit).all()
    return programs


@router.get("/available", response_model=List[ProgramResponse])
def list_available_programs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List programs open for enrollment"""
    programs = db.query(Program).filter(
        Program.status == ProgramStatus.open.value,
        Program.spots_available > 0
    ).order_by(Program.application_deadline.asc()).all()
    return programs


@router.post("/", response_model=ProgramResponse)
def create_program(
    program_data: ProgramCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new program (admin only)"""
    db_program = Program(**program_data.model_dump())
    db.add(db_program)
    db.commit()
    db.refresh(db_program)
    return db_program


@router.get("/{program_id}", response_model=ProgramResponse)
def get_program(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific program"""
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    return program


@router.put("/{program_id}", response_model=ProgramResponse)
def update_program(
    program_id: int,
    program_update: ProgramUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a program (admin only)"""
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )

    update_data = program_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(program, field, value)

    db.commit()
    db.refresh(program)
    return program


@router.delete("/{program_id}")
def delete_program(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a program (admin only)"""
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )

    # Check if program has enrollments
    enrollment_count = db.query(Enrollment).filter(
        Enrollment.program_id == program_id
    ).count()

    if enrollment_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete program with {enrollment_count} enrolled student(s)"
        )

    db.delete(program)
    db.commit()
    return {"message": "Program deleted successfully"}


@router.get("/admin/all", response_model=List[ProgramResponse])
def list_all_programs_admin(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all programs including drafts and completed (admin only)"""
    programs = db.query(Program).order_by(Program.created_at.desc()).offset(skip).limit(limit).all()
    return programs


# Enrollment endpoints
@router.get("/enrollments/my", response_model=List[EnrollmentResponse])
def my_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's program enrollments"""
    enrollments = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id
    ).all()
    return enrollments


@router.get("/enrollments/current", response_model=EnrollmentResponse)
def current_enrollment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current active enrollment"""
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.status == EnrollmentStatus.active.value
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active enrollment found"
        )
    return enrollment


@router.post("/{program_id}/enroll", response_model=EnrollmentResponse)
def enroll_in_program(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Enroll in a program"""
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )

    if program.status != ProgramStatus.open.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Program is not open for enrollment"
        )

    if program.spots_available <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No spots available"
        )

    # Check for existing enrollment
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.program_id == program_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this program"
        )

    enrollment = Enrollment(
        student_id=current_user.id,
        program_id=program_id,
        status=EnrollmentStatus.pending.value
    )
    db.add(enrollment)

    # Decrement available spots
    program.spots_available -= 1

    db.commit()
    db.refresh(enrollment)
    return enrollment
