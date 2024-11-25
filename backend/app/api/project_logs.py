from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.project_log import ProjectLog
from ..schemas.project_log import ProjectLogCreate, ProjectLogUpdate, ProjectLogResponse
from ..auth import get_current_user

router = APIRouter()

@router.post("/projects/{project_id}/logs", response_model=ProjectLogResponse)
def create_project_log(
    project_id: int,
    log_data: ProjectLogCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    log = ProjectLog(**log_data.dict(), project_id=project_id)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.get("/projects/{project_id}/logs", response_model=List[ProjectLogResponse])
def get_project_logs(
    project_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    logs = db.query(ProjectLog).filter(ProjectLog.project_id == project_id).all()
    return logs

@router.put("/projects/{project_id}/logs/{log_id}", response_model=ProjectLogResponse)
def update_project_log(
    project_id: int,
    log_id: int,
    log_data: ProjectLogUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    log = db.query(ProjectLog).filter(
        ProjectLog.id == log_id,
        ProjectLog.project_id == project_id
    ).first()
    
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    for key, value in log_data.dict(exclude_unset=True).items():
        setattr(log, key, value)
    
    db.commit()
    db.refresh(log)
    return log

@router.delete("/projects/{project_id}/logs/{log_id}")
def delete_project_log(
    project_id: int,
    log_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    log = db.query(ProjectLog).filter(
        ProjectLog.id == log_id,
        ProjectLog.project_id == project_id
    ).first()
    
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    db.delete(log)
    db.commit()
    return {"message": "Log deleted successfully"}
