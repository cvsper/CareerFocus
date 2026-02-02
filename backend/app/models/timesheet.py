from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Float, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class TimesheetStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"


class Timesheet(Base):
    __tablename__ = "timesheets"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    week_start = Column(Date, nullable=False)
    week_end = Column(Date, nullable=False)
    total_hours = Column(Float, default=0)
    notes = Column(Text, nullable=True)
    status = Column(String, default=TimesheetStatus.draft.value)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Signature fields
    signature = Column(Text, nullable=True)  # Base64-encoded signature image
    signature_date = Column(Date, nullable=True)  # Date signature was applied

    # Relationships
    student = relationship("User", back_populates="timesheets", foreign_keys=[student_id])
    entries = relationship("TimesheetEntry", back_populates="timesheet", cascade="all, delete-orphan")


class TimesheetEntry(Base):
    __tablename__ = "timesheet_entries"

    id = Column(Integer, primary_key=True, index=True)
    timesheet_id = Column(Integer, ForeignKey("timesheets.id"), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    lunch_out = Column(Time, nullable=True)  # Lunch start time
    lunch_in = Column(Time, nullable=True)  # Lunch end time
    break_minutes = Column(Integer, default=0)
    hours = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    timesheet = relationship("Timesheet", back_populates="entries")
