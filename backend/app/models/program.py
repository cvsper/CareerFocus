from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class ProgramStatus(str, enum.Enum):
    draft = "draft"
    open = "open"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class EnrollmentStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    completed = "completed"
    withdrawn = "withdrawn"


class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    organization = Column(String, nullable=False)
    location = Column(String, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_hours = Column(Float, default=0)
    spots_available = Column(Integer, default=0)
    application_deadline = Column(Date, nullable=True)
    status = Column(String, default=ProgramStatus.draft.value)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    enrollments = relationship("Enrollment", back_populates="program")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    status = Column(String, default=EnrollmentStatus.pending.value)
    hours_completed = Column(Float, default=0)
    supervisor_name = Column(String, nullable=True)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    student = relationship("User", back_populates="enrollments")
    program = relationship("Program", back_populates="enrollments")
