from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import List, Optional, Literal
from datetime import datetime

from database import get_db
from models.project import Project, ProjectStatus
from models.task import Task
from models.idea import Idea
from models.concept import ConceptNote
from schemas.project import ProjectCreate, ProjectUpdate, Project as ProjectSchema
from schemas.task import TaskResponse
from schemas.idea import IdeaResponse
from schemas.concept import ConceptNote as ConceptNoteSchema
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
    sort_by: Optional[Literal["created_at", "updated_at", "title", "status"]] = None,
    sort_order: Optional[Literal["asc", "desc"]] = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Project).filter(Project.owner_id == current_user.id)
    
    if status:
        query = query.filter(Project.status == status)
    
    if sort_by:
        order_func = desc if sort_order == "desc" else asc
        if hasattr(Project, sort_by):
            query = query.order_by(order_func(getattr(Project, sort_by)))
    
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

@router.get("/{project_id}/tasks", response_model=List[TaskResponse])
def get_project_tasks(
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
    
    tasks = db.query(Task).filter(
        Task.project_id == project_id
    ).order_by(Task.created_at.desc()).all()
    
    return tasks

@router.get("/{project_id}/ideas", response_model=List[IdeaResponse])
def get_project_ideas(
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
    
    return project.ideas

@router.get("/{project_id}/concepts", response_model=List[ConceptNoteSchema])
def get_project_concept_notes(
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
    
    concepts = db.query(ConceptNote).filter(
        ConceptNote.project_id == project_id
    ).order_by(ConceptNote.created_at.desc()).all()
    
    return concepts

@router.post("/{project_id}/ideas/{idea_id}")
def link_idea_to_project(
    project_id: int,
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    idea = db.query(Idea).filter(
        Idea.id == idea_id,
        Idea.user_id == current_user.id
    ).first()
    
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    if idea not in project.ideas:
        project.ideas.append(idea)
        db.commit()
    
    return {"status": "success"}

@router.delete("/{project_id}/ideas/{idea_id}")
def unlink_idea_from_project(
    project_id: int,
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    idea = db.query(Idea).filter(
        Idea.id == idea_id,
        Idea.user_id == current_user.id
    ).first()
    
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    if idea in project.ideas:
        project.ideas.remove(idea)
        db.commit()
    
    return {"status": "success"}

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
