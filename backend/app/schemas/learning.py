from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LearningProgressBase(BaseModel):
    lesson_id: int
    completed: bool = False


class LearningProgressCreate(LearningProgressBase):
    pass


class LearningProgressUpdate(BaseModel):
    completed: bool


class LearningProgressResponse(LearningProgressBase):
    id: int
    student_id: int
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AnnouncementBase(BaseModel):
    title: str
    message: str
    announcement_type: str = "info"


class AnnouncementCreate(AnnouncementBase):
    expires_at: Optional[datetime] = None


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    announcement_type: Optional[str] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None


class AnnouncementResponse(AnnouncementBase):
    id: int
    is_active: bool
    created_at: datetime
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True
