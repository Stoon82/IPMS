from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from datetime import datetime

class ActivityBase(BaseModel):
    type: str
    data: Dict[str, Any]

class ActivityCreate(ActivityBase):
    pass

class Activity(ActivityBase):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class JournalEntryBase(BaseModel):
    content: str
    mood: Optional[str] = None
    tags: List[str] = []

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryUpdate(BaseModel):
    content: Optional[str] = None
    mood: Optional[str] = None
    tags: Optional[List[str]] = None

class JournalEntry(JournalEntryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
