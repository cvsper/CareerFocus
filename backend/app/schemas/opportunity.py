from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class OpportunityBase(BaseModel):
    title: str
    organization: str
    location: Optional[str] = None
    opportunity_type: str
    description: Optional[str] = None
    requirements: Optional[str] = None  # JSON string of requirements array
    duration: Optional[str] = None
    hours_per_week: Optional[str] = None
    compensation: Optional[str] = None
    application_deadline: Optional[date] = None
    is_featured: bool = False


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    organization: Optional[str] = None
    location: Optional[str] = None
    opportunity_type: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    duration: Optional[str] = None
    hours_per_week: Optional[str] = None
    compensation: Optional[str] = None
    application_deadline: Optional[date] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None


class OpportunityResponse(OpportunityBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
