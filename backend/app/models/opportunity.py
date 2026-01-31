from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Boolean
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class OpportunityType(str, enum.Enum):
    internship = "Internship"
    pathway = "Pathway"
    part_time = "Part-Time"
    apprenticeship = "Apprenticeship"


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    organization = Column(String, nullable=False)
    location = Column(String, nullable=True)
    opportunity_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)  # JSON array stored as text
    duration = Column(String, nullable=True)
    hours_per_week = Column(String, nullable=True)
    compensation = Column(String, nullable=True)
    application_deadline = Column(Date, nullable=True)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
