from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class ContractorOnboarding(Base):
    __tablename__ = "contractor_onboarding"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    onboarding_status = Column(String, default="pending")  # pending, in_progress, complete
    documents_complete = Column(Boolean, default=False)
    training_complete = Column(Boolean, default=False)
    ready_for_assignment = Column(Boolean, default=False)
    assigned_coordinator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="contractor_onboarding", foreign_keys=[user_id])
    assigned_coordinator = relationship("User", foreign_keys=[assigned_coordinator_id])
