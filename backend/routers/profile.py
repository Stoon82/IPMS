from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import profile, user
from schemas import profile as profile_schema
from auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["profile"])

@router.get("", response_model=profile_schema.Profile)
async def get_profile(current_user: user.User = Depends(get_current_user),
                     db: Session = Depends(get_db)):
    db_profile = db.query(profile.Profile).filter(
        profile.Profile.user_id == current_user.id).first()
    
    if not db_profile:
        # Create default profile if it doesn't exist
        db_profile = profile.Profile(user_id=current_user.id)
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
    
    return db_profile

@router.put("", response_model=profile_schema.Profile)
async def update_profile(
    profile_update: profile_schema.ProfileUpdate,
    current_user: user.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_profile = db.query(profile.Profile).filter(
        profile.Profile.user_id == current_user.id).first()
    
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    for field, value in profile_update.dict(exclude_unset=True).items():
        setattr(db_profile, field, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile
