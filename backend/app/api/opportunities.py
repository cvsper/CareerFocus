from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_active_user, get_current_admin_user
from app.models.user import User
from app.models.opportunity import Opportunity
from app.schemas.opportunity import (
    OpportunityCreate, OpportunityUpdate, OpportunityResponse
)

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])


@router.get("/", response_model=List[OpportunityResponse])
def list_opportunities(
    skip: int = 0,
    limit: int = 50,
    opportunity_type: str = None,
    featured_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List job opportunities"""
    query = db.query(Opportunity).filter(Opportunity.is_active == True)

    if opportunity_type:
        query = query.filter(Opportunity.opportunity_type == opportunity_type)

    if featured_only:
        query = query.filter(Opportunity.is_featured == True)

    opportunities = query.order_by(
        Opportunity.is_featured.desc(),
        Opportunity.created_at.desc()
    ).offset(skip).limit(limit).all()
    return opportunities


@router.get("/featured", response_model=List[OpportunityResponse])
def list_featured_opportunities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List featured opportunities"""
    opportunities = db.query(Opportunity).filter(
        Opportunity.is_active == True,
        Opportunity.is_featured == True
    ).order_by(Opportunity.created_at.desc()).all()
    return opportunities


@router.post("/", response_model=OpportunityResponse)
def create_opportunity(
    opportunity_data: OpportunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new opportunity (admin only)"""
    db_opportunity = Opportunity(**opportunity_data.model_dump())
    db.add(db_opportunity)
    db.commit()
    db.refresh(db_opportunity)
    return db_opportunity


@router.get("/{opportunity_id}", response_model=OpportunityResponse)
def get_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific opportunity"""
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )
    return opportunity


@router.put("/{opportunity_id}", response_model=OpportunityResponse)
def update_opportunity(
    opportunity_id: int,
    opportunity_update: OpportunityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update an opportunity (admin only)"""
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )

    update_data = opportunity_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(opportunity, field, value)

    db.commit()
    db.refresh(opportunity)
    return opportunity


@router.delete("/{opportunity_id}")
def delete_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete an opportunity (admin only)"""
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )

    db.delete(opportunity)
    db.commit()
    return {"message": "Opportunity deleted"}
