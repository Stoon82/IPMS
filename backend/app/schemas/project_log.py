from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ProjectLogBase(BaseModel):
    title: str
    content: str
    log_type: str

class ProjectLogCreate(ProjectLogBase):
    pass

class ProjectLogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    log_type: Optional[str] = None

class ProjectLogResponse(ProjectLogBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
