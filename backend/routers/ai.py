from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import task, user
from ..services.ai_service import AIService
from ..auth import get_current_user

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/analyze-task")
async def analyze_task(
    task_data: dict,
    current_user: user.User = Depends(get_current_user)
):
    """Analyze a task before creation to get AI suggestions."""
    analysis = await AIService.analyze_task(
        task_data.get("title", ""),
        task_data.get("description", "")
    )
    return analysis

@router.get("/task-summary")
async def get_task_summary(
    current_user: user.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get an AI-generated summary of all tasks."""
    tasks = db.query(task.Task).filter(
        task.Task.user_id == current_user.id
    ).all()
    
    summary = await AIService.generate_task_summary(tasks)
    return summary

@router.get("/optimize-task/{task_id}")
async def get_task_optimization(
    task_id: int,
    current_user: user.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get optimization suggestions for a specific task."""
    target_task = db.query(task.Task).filter(
        task.Task.id == task_id,
        task.Task.user_id == current_user.id
    ).first()
    
    if not target_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    all_tasks = db.query(task.Task).filter(
        task.Task.user_id == current_user.id
    ).all()
    
    optimization = await AIService.suggest_task_optimization(target_task, all_tasks)
    return optimization
