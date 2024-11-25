from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from models.task import TaskStatus, TaskPriority

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    project_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    project_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
