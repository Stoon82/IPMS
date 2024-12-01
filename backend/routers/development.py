from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db
from models.development import Goal, GoalProgress, Habit, HabitTracking
from models.user import User
from schemas.development import (
    Goal as GoalSchema,
    GoalCreate,
    GoalUpdate,
    GoalProgress as GoalProgressSchema,
    GoalProgressCreate,
    Habit as HabitSchema,
    HabitCreate,
    HabitUpdate,
    HabitTracking as HabitTrackingSchema,
    HabitTrackingCreate
)
from auth.utils import get_current_user

router = APIRouter(tags=["development"])

# Goal endpoints
@router.post("/goals", response_model=GoalSchema)
async def create_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_goal = Goal(**goal.dict(), user_id=current_user.id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("/goals", response_model=List[GoalSchema])
async def get_goals(
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Goal).filter(Goal.user_id == current_user.id)
    
    if category:
        query = query.filter(Goal.category == category)
    if status:
        query = query.filter(Goal.status == status)
    
    return query.order_by(desc(Goal.created_at)).all()

@router.get("/goals/{goal_id}", response_model=GoalSchema)
async def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal

@router.put("/goals/{goal_id}", response_model=GoalSchema)
async def update_goal(
    goal_id: int,
    goal_update: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_data = goal_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_goal, field, value)
    
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.delete("/goals/{goal_id}")
async def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted successfully"}

# Goal Progress endpoints
@router.post("/goals/{goal_id}/progress", response_model=GoalProgressSchema)
async def create_goal_progress(
    goal_id: int,
    progress: GoalProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify goal exists and belongs to user
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db_progress = GoalProgress(**progress.dict())
    db.add(db_progress)
    
    # Update goal progress
    goal.progress = progress.value
    
    db.commit()
    db.refresh(db_progress)
    return db_progress

# Habit endpoints
@router.post("/habits", response_model=HabitSchema)
async def create_habit(
    habit: HabitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_habit = Habit(**habit.dict(), user_id=current_user.id)
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

@router.get("/habits", response_model=List[HabitSchema])
async def get_habits(
    frequency: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Habit).filter(Habit.user_id == current_user.id)
    
    if frequency:
        query = query.filter(Habit.frequency == frequency)
    
    return query.order_by(Habit.created_at).all()

@router.put("/habits/{habit_id}", response_model=HabitSchema)
async def update_habit(
    habit_id: int,
    habit_update: HabitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not db_habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    update_data = habit_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_habit, field, value)
    
    db.commit()
    db.refresh(db_habit)
    return db_habit

@router.post("/habits/{habit_id}/track", response_model=HabitTrackingSchema)
async def track_habit(
    habit_id: int,
    tracking: HabitTrackingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify habit exists and belongs to user
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Create tracking entry
    db_tracking = HabitTracking(**tracking.dict())
    db.add(db_tracking)
    
    # Update habit streak
    # TODO: Implement streak calculation based on frequency and target_days
    habit.streak += 1
    
    db.commit()
    db.refresh(db_tracking)
    return db_tracking

@router.delete("/habits/{habit_id}")
async def delete_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    db.delete(habit)
    db.commit()
    return {"message": "Habit deleted successfully"}
