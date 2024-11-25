from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db
from models.activity import Activity, JournalEntry
from models.user import User
from schemas.activity import (
    Activity as ActivitySchema,
    ActivityCreate,
    JournalEntry as JournalEntrySchema,
    JournalEntryCreate,
    JournalEntryUpdate
)
from auth.utils import get_current_user

router = APIRouter(tags=["activities"])

# Activity endpoints
@router.post("/activities", response_model=ActivitySchema)
async def create_activity(
    activity: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_activity = Activity(**activity.dict(), user_id=current_user.id)
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.get("/activities", response_model=List[ActivitySchema])
async def get_activities(
    type: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Activity).filter(Activity.user_id == current_user.id)
    
    if type:
        query = query.filter(Activity.type == type)
    if from_date:
        query = query.filter(Activity.timestamp >= from_date)
    if to_date:
        query = query.filter(Activity.timestamp <= to_date)
    
    return query.order_by(desc(Activity.timestamp)).limit(limit).all()

# Journal endpoints
@router.post("/journal", response_model=JournalEntrySchema)
async def create_journal_entry(
    entry: JournalEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_entry = JournalEntry(**entry.dict(), user_id=current_user.id)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.get("/journal", response_model=List[JournalEntrySchema])
async def get_journal_entries(
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    mood: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id)
    
    if from_date:
        query = query.filter(JournalEntry.created_at >= from_date)
    if to_date:
        query = query.filter(JournalEntry.created_at <= to_date)
    if mood:
        query = query.filter(JournalEntry.mood == mood)
    if tags:
        # Filter entries that contain any of the specified tags
        query = query.filter(JournalEntry.tags.contains(tags))
    
    return query.order_by(desc(JournalEntry.created_at)).limit(limit).all()

@router.get("/journal/{entry_id}", response_model=JournalEntrySchema)
async def get_journal_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry

@router.put("/journal/{entry_id}", response_model=JournalEntrySchema)
async def update_journal_entry(
    entry_id: int,
    entry_update: JournalEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id
    ).first()
    
    if not db_entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    update_data = entry_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_entry, field, value)
    
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.delete("/journal/{entry_id}")
async def delete_journal_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    db.delete(entry)
    db.commit()
    return {"message": "Journal entry deleted successfully"}
