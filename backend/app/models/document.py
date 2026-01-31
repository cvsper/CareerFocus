from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class DocumentStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class DocumentType(str, enum.Enum):
    w4 = "W-4 Form"
    i9 = "I-9 Form"
    photo_id = "Photo ID"
    work_permit = "Work Permit"
    emergency_contact = "Emergency Contact Form"
    direct_deposit = "Direct Deposit Form"
    other = "Other"


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_type = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)  # S3 or storage URL
    file_size = Column(Integer, nullable=True)  # in bytes
    mime_type = Column(String, nullable=True)
    status = Column(String, default=DocumentStatus.pending.value)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # Relationships
    student = relationship("User", back_populates="documents", foreign_keys=[student_id])
