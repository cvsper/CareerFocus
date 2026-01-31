from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user, get_current_admin_user
from app.models.user import User
from app.models.learning import LearningProgress, Announcement
from app.schemas.learning import (
    LearningProgressCreate, LearningProgressUpdate, LearningProgressResponse,
    AnnouncementCreate, AnnouncementResponse
)

router = APIRouter(prefix="/learning", tags=["Learning Hub"])


# Learning Progress endpoints
@router.get("/progress", response_model=List[LearningProgressResponse])
def get_learning_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's learning progress"""
    progress = db.query(LearningProgress).filter(
        LearningProgress.student_id == current_user.id
    ).all()
    return progress


@router.post("/progress", response_model=LearningProgressResponse)
def create_or_update_progress(
    progress_data: LearningProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark a lesson as complete or incomplete"""
    # Check for existing progress
    existing = db.query(LearningProgress).filter(
        LearningProgress.student_id == current_user.id,
        LearningProgress.lesson_id == progress_data.lesson_id
    ).first()

    if existing:
        existing.completed = progress_data.completed
        if progress_data.completed:
            existing.completed_at = datetime.utcnow()
        else:
            existing.completed_at = None
        db.commit()
        db.refresh(existing)
        return existing

    # Create new progress entry
    db_progress = LearningProgress(
        student_id=current_user.id,
        lesson_id=progress_data.lesson_id,
        completed=progress_data.completed,
        completed_at=datetime.utcnow() if progress_data.completed else None
    )
    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    return db_progress


@router.put("/progress/{lesson_id}", response_model=LearningProgressResponse)
def update_lesson_progress(
    lesson_id: int,
    progress_update: LearningProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update progress for a specific lesson"""
    progress = db.query(LearningProgress).filter(
        LearningProgress.student_id == current_user.id,
        LearningProgress.lesson_id == lesson_id
    ).first()

    if not progress:
        # Create new progress entry
        progress = LearningProgress(
            student_id=current_user.id,
            lesson_id=lesson_id,
            completed=progress_update.completed,
            completed_at=datetime.utcnow() if progress_update.completed else None
        )
        db.add(progress)
    else:
        progress.completed = progress_update.completed
        if progress_update.completed:
            progress.completed_at = datetime.utcnow()
        else:
            progress.completed_at = None

    db.commit()
    db.refresh(progress)
    return progress


# Announcements endpoints
@router.get("/announcements", response_model=List[AnnouncementResponse])
def list_announcements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List active announcements"""
    now = datetime.utcnow()
    announcements = db.query(Announcement).filter(
        Announcement.is_active == True,
        (Announcement.expires_at == None) | (Announcement.expires_at > now)
    ).order_by(Announcement.created_at.desc()).all()
    return announcements


@router.post("/announcements", response_model=AnnouncementResponse)
def create_announcement(
    announcement_data: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new announcement (admin only)"""
    db_announcement = Announcement(**announcement_data.model_dump())
    db.add(db_announcement)
    db.commit()
    db.refresh(db_announcement)
    return db_announcement


@router.delete("/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete an announcement (admin only)"""
    announcement = db.query(Announcement).filter(
        Announcement.id == announcement_id
    ).first()

    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )

    db.delete(announcement)
    db.commit()
    return {"message": "Announcement deleted"}
