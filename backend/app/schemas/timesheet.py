from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time, datetime


class TimesheetEntryBase(BaseModel):
    date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    lunch_out: Optional[time] = None  # Lunch start time
    lunch_in: Optional[time] = None  # Lunch end time
    break_minutes: int = 0
    hours: float = 0


class TimesheetEntryCreate(TimesheetEntryBase):
    pass


class TimesheetEntryResponse(TimesheetEntryBase):
    id: int

    class Config:
        from_attributes = True


class TimesheetBase(BaseModel):
    week_start: date
    week_end: date
    notes: Optional[str] = None


class TimesheetCreate(TimesheetBase):
    entries: List[TimesheetEntryCreate] = []


class TimesheetUpdate(BaseModel):
    notes: Optional[str] = None
    entries: Optional[List[TimesheetEntryCreate]] = None


class TimesheetSubmit(BaseModel):
    signature: Optional[str] = None  # Base64-encoded signature image


class TimesheetReview(BaseModel):
    approved: bool
    rejection_reason: Optional[str] = None


class TimesheetResponse(TimesheetBase):
    id: int
    student_id: int
    total_hours: float
    status: str
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    entries: List[TimesheetEntryResponse] = []
    created_at: datetime
    signature: Optional[str] = None
    signature_date: Optional[date] = None

    class Config:
        from_attributes = True


class TimesheetListResponse(BaseModel):
    id: int
    week_start: date
    week_end: date
    total_hours: float
    status: str
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TimesheetWithStudentResponse(TimesheetResponse):
    """Timesheet response with student info for admin views"""
    student_name: Optional[str] = None
    student_email: Optional[str] = None

    class Config:
        from_attributes = True
