from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    employee = "employee"
    contractor = "contractor"
    wble_participant = "wble_participant"
    ttw_participant = "ttw_participant"


class EmploymentType(str, enum.Enum):
    w2 = "w2"
    c1099 = "1099"
    participant = "participant"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    role = Column(String, default=UserRole.wble_participant.value)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Expanded fields for multi-role support
    employment_type = Column(String, nullable=True)  # w2, 1099, participant
    department = Column(String, nullable=True)  # For employees
    hourly_rate = Column(Numeric(10, 2), nullable=True)  # For contractors/employees
    company_start_date = Column(Date, nullable=True)  # Employment start date

    # Relationships - use primaryjoin for tables with multiple FKs to User
    timesheets = relationship(
        "Timesheet",
        back_populates="student",
        primaryjoin="User.id == Timesheet.student_id"
    )
    documents = relationship(
        "Document",
        back_populates="student",
        primaryjoin="User.id == Document.student_id"
    )
    enrollments = relationship("Enrollment", back_populates="student")
    learning_progress = relationship("LearningProgress", back_populates="student")
    contractor_onboarding = relationship(
        "ContractorOnboarding",
        back_populates="user",
        primaryjoin="User.id == ContractorOnboarding.user_id",
        uselist=False
    )

    # Emergency contact
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)
    emergency_contact_relationship = Column(String, nullable=True)

    # Timesheet/PDF fields
    case_id = Column(String, nullable=True, unique=True)  # Participant ID
    job_title = Column(String, nullable=True)  # Current job title

    # TTW-specific fields
    sga_monthly_limit = Column(Numeric(10, 2), nullable=True)  # SGA threshold ($1,470/month in 2026)
    vr_counselor_name = Column(String, nullable=True)
    vr_counselor_phone = Column(String, nullable=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def is_participant(self):
        return self.role in (UserRole.wble_participant.value, UserRole.ttw_participant.value)

    @property
    def can_submit_timesheets(self):
        return self.role in (
            UserRole.wble_participant.value,
            UserRole.ttw_participant.value,
            UserRole.contractor.value,
        )
