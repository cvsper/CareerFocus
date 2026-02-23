from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    case_id: Optional[str] = None
    job_title: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: str = "wble_participant"
    employment_type: Optional[str] = None
    department: Optional[str] = None


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    case_id: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    hourly_rate: Optional[float] = None
    company_start_date: Optional[date] = None
    vr_counselor_name: Optional[str] = None
    vr_counselor_phone: Optional[str] = None


class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    case_id: Optional[str] = None
    job_title: Optional[str] = None
    employment_type: Optional[str] = None
    department: Optional[str] = None
    hourly_rate: Optional[float] = None
    company_start_date: Optional[date] = None
    sga_monthly_limit: Optional[float] = None
    vr_counselor_name: Optional[str] = None
    vr_counselor_phone: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class StudentProfileResponse(BaseModel):
    """Comprehensive user profile for admin view"""
    # Basic info
    id: int
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    # Additional info
    case_id: Optional[str] = None
    job_title: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    employment_type: Optional[str] = None
    department: Optional[str] = None
    hourly_rate: Optional[float] = None
    company_start_date: Optional[date] = None
    sga_monthly_limit: Optional[float] = None
    vr_counselor_name: Optional[str] = None
    vr_counselor_phone: Optional[str] = None

    # Related data (as dicts to avoid circular imports)
    enrollments: list = []
    timesheets: list = []
    documents: list = []

    # Summary stats
    total_hours_worked: float = 0
    pending_timesheets: int = 0
    approved_timesheets: int = 0
    pending_documents: int = 0
    approved_documents: int = 0
    current_program: Optional[str] = None

    # Contractor-specific
    onboarding_status: Optional[str] = None

    class Config:
        from_attributes = True
