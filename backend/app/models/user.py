from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    student = "student"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    role = Column(String, default=UserRole.student.value)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

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

    # Emergency contact
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)
    emergency_contact_relationship = Column(String, nullable=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
