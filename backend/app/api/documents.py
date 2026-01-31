from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user, get_current_admin_user
from app.models.user import User
from app.models.document import Document, DocumentStatus
from app.schemas.document import (
    DocumentCreate, DocumentReview, DocumentResponse, DocumentListResponse
)

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.get("/", response_model=List[DocumentListResponse])
def list_documents(
    skip: int = 0,
    limit: int = 50,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List documents (students see their own, admins see all)"""
    query = db.query(Document)

    if current_user.role == "student":
        query = query.filter(Document.student_id == current_user.id)

    if status:
        query = query.filter(Document.status == status)

    documents = query.order_by(Document.uploaded_at.desc()).offset(skip).limit(limit).all()
    return documents


@router.get("/pending", response_model=List[DocumentResponse])
def list_pending_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List pending documents for review (admin only)"""
    documents = db.query(Document).filter(
        Document.status == DocumentStatus.pending.value
    ).order_by(Document.uploaded_at.asc()).all()
    return documents


@router.post("/", response_model=DocumentResponse)
def upload_document(
    document_data: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Upload a document"""
    db_document = Document(
        student_id=current_user.id,
        document_type=document_data.document_type,
        file_name=document_data.file_name,
        file_url=document_data.file_url,
        file_size=document_data.file_size,
        mime_type=document_data.mime_type,
        status=DocumentStatus.pending.value
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific document"""
    document = db.query(Document).filter(Document.id == document_id).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # Students can only view their own documents
    if current_user.role == "student" and document.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this document"
        )

    return document


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a document (only if pending)"""
    document = db.query(Document).filter(Document.id == document_id).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # Students can only delete their own documents
    if current_user.role == "student" and document.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this document"
        )

    if document.status != DocumentStatus.pending.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete approved or rejected documents"
        )

    db.delete(document)
    db.commit()
    return {"message": "Document deleted"}


@router.post("/{document_id}/review", response_model=DocumentResponse)
def review_document(
    document_id: int,
    review: DocumentReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Approve or reject a document (admin only)"""
    document = db.query(Document).filter(Document.id == document_id).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    if document.status != DocumentStatus.pending.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document is not pending review"
        )

    document.reviewed_at = datetime.utcnow()
    document.reviewed_by = current_user.id

    if review.approved:
        document.status = DocumentStatus.approved.value
    else:
        document.status = DocumentStatus.rejected.value
        document.rejection_reason = review.rejection_reason

    db.commit()
    db.refresh(document)
    return document
