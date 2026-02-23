from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class DocumentStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class DocumentType(str, enum.Enum):
    # Universal documents
    w4 = "W-4 Form"
    i9 = "I-9 Form"
    photo_id = "Photo ID"
    direct_deposit = "Direct Deposit Form"

    # WBLE/TTW participant documents
    work_permit = "Work Permit"
    emergency_contact = "Emergency Contact Form"

    # Contractor-specific documents
    w9 = "W-9 Form"
    contractor_agreement = "Independent Contractor Agreement"
    background_check = "Background Check"
    drivers_license = "Driver's License"
    ssn_card = "SSN Card"
    cpr_certification = "CPR Certification"
    zero_tolerance = "Zero Tolerance Certificate"
    hipaa_training = "HIPAA Training Certificate"

    # TTW-specific documents
    ssdi_award_letter = "SSDI/SSI Award Letter"
    benefits_counseling = "Benefits Counseling Certificate"
    vr_referral = "VR Referral Letter"

    other = "Other"


# Role-specific required documents
REQUIRED_DOCUMENTS = {
    "wble_participant": [
        DocumentType.photo_id,
        DocumentType.w4,
        DocumentType.i9,
        DocumentType.direct_deposit,
        DocumentType.emergency_contact,
    ],
    "ttw_participant": [
        DocumentType.photo_id,
        DocumentType.w4,
        DocumentType.i9,
        DocumentType.direct_deposit,
        DocumentType.emergency_contact,
        DocumentType.ssdi_award_letter,
        DocumentType.benefits_counseling,
        DocumentType.vr_referral,
    ],
    "contractor": [
        DocumentType.w9,
        DocumentType.contractor_agreement,
        DocumentType.background_check,
        DocumentType.drivers_license,
        DocumentType.ssn_card,
        DocumentType.cpr_certification,
        DocumentType.zero_tolerance,
        DocumentType.hipaa_training,
        DocumentType.direct_deposit,
    ],
    "employee": [
        DocumentType.photo_id,
        DocumentType.w4,
        DocumentType.i9,
        DocumentType.direct_deposit,
    ],
}


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_type = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)  # S3 or storage URL
    file_size = Column(Integer, nullable=True)  # in bytes
    mime_type = Column(String, nullable=True)
    status = Column(String, default=DocumentStatus.pending.value)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)  # For certs that expire

    # Relationships
    student = relationship("User", back_populates="documents", foreign_keys=[student_id])
