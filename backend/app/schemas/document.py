from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DocumentBase(BaseModel):
    document_type: str
    file_name: str


class DocumentCreate(DocumentBase):
    file_url: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None


class DocumentReview(BaseModel):
    approved: bool
    rejection_reason: Optional[str] = None


class DocumentResponse(DocumentBase):
    id: int
    student_id: int
    file_url: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    status: str
    uploaded_at: datetime
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    id: int
    document_type: str
    file_name: str
    status: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


class DocumentWithStudentResponse(DocumentResponse):
    """Document response with student info for admin views"""
    student_name: Optional[str] = None
    student_email: Optional[str] = None

    class Config:
        from_attributes = True
