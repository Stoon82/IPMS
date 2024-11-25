from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from auth import get_current_user
from models.user import User
from models.project import Project
from models.idea import Idea
from models.project_idea import project_ideas
from schemas.idea import IdeaResponse

router = APIRouter(
    prefix="/api/projects/{project_id}/ideas",
    tags=["project_ideas"]
)

@router.post("/{idea_id}", response_model=IdeaResponse)
def link_idea_to_project(
    project_id: int,
    idea_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if project exists and user has access
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this project"
        )

    # Check if idea exists
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found"
        )

    # Check if association already exists
    existing = db.query(project_ideas).filter_by(
        project_id=project_id,
        idea_id=idea_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Idea is already linked to this project"
        )

    # Create association
    stmt = project_ideas.insert().values(
        project_id=project_id,
        idea_id=idea_id,
        created_at=datetime.utcnow()
    )
    db.execute(stmt)
    db.commit()

    return idea

@router.get("", response_model=List[IdeaResponse])
def get_project_ideas(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project.ideas

@router.delete("/{idea_id}", status_code=status.HTTP_204_NO_CONTENT)
def unlink_idea_from_project(
    project_id: int,
    idea_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if project exists and user has access
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this project"
        )

    # Delete association
    stmt = project_ideas.delete().where(
        project_ideas.c.project_id == project_id,
        project_ideas.c.idea_id == idea_id
    )
    result = db.execute(stmt)
    db.commit()

    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea is not linked to this project"
        )

    return None
