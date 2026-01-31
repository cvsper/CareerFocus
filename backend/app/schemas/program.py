from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class ProgramBase(BaseModel):
    name: str
    description: Optional[str] = None
    organization: str
    location: Optional[str] = None
    start_date: date
    end_date: date
    total_hours: float = 0
    spots_available: int = 0
    application_deadline: Optional[date] = None


class ProgramCreate(ProgramBase):
    pass


class ProgramUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    organization: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_hours: Optional[float] = None
    spots_available: Optional[int] = None
    application_deadline: Optional[date] = None
    status: Optional[str] = None


class ProgramResponse(ProgramBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class EnrollmentBase(BaseModel):
    program_id: int


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentResponse(BaseModel):
    id: int
    student_id: int
    program_id: int
    status: str
    hours_completed: float
    supervisor_name: Optional[str] = None
    enrolled_at: datetime
    completed_at: Optional[datetime] = None
    program: ProgramResponse

    class Config:
        from_attributes = True
