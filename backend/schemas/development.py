from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from datetime import datetime

class GoalBase(BaseModel):
    title: str
    description: str
    category: str
    status: str = "active"
    target_date: Optional[datetime] = None
    metrics: Dict[str, Any] = {}

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    target_date: Optional[datetime] = None
    metrics: Optional[Dict[str, Any]] = None

class Goal(GoalBase):
    id: int
    user_id: int
    progress: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GoalProgressBase(BaseModel):
    value: float
    notes: Optional[str] = None
    data: Dict[str, Any] = {}

class GoalProgressCreate(GoalProgressBase):
    goal_id: int

class GoalProgress(GoalProgressBase):
    id: int
    goal_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class HabitBase(BaseModel):
    name: str
    description: Optional[str] = None
    frequency: str
    target_days: List[str] = Field(default_factory=list)

class HabitCreate(HabitBase):
    pass

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[str] = None
    target_days: Optional[List[str]] = None

class Habit(HabitBase):
    id: int
    user_id: int
    streak: int
    created_at: datetime

    class Config:
        from_attributes = True

class HabitTrackingBase(BaseModel):
    notes: Optional[str] = None

class HabitTrackingCreate(HabitTrackingBase):
    habit_id: int

class HabitTracking(HabitTrackingBase):
    id: int
    habit_id: int
    completed: datetime

    class Config:
        from_attributes = True
