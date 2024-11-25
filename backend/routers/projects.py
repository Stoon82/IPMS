from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from models.project import Project, ProjectStatus
from schemas.project import ProjectCreate, ProjectUpdate, Project as ProjectSchema
from auth.utils import get_current_user
from models.user import User

router = APIRouter()

@router.post("/", response_model=ProjectSchema)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_project = Project(
        **project.dict(),
        owner_id=current_user.id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/", response_model=List[ProjectSchema])
def get_projects(
    status: Optional[ProjectStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Project).filter(Project.owner_id == current_user.id)
    
    if status:
        query = query.filter(Project.status == status)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{project_id}", response_model=ProjectSchema)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return project

@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    for field, value in project_update.dict(exclude_unset=True).items():
        setattr(db_project, field, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted successfully"}
