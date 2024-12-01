from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.idea import Idea, Tag
from schemas.idea import IdeaCreate, IdeaUpdate, IdeaResponse, TagCreate, TagResponse
from auth.utils import get_current_user

router = APIRouter(tags=["ideas"])

@router.post("/", response_model=IdeaResponse)
def create_idea(
    idea_data: IdeaCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Create or get tags
    tags = []
    for tag_name in idea_data.tags:
        tag = db.query(Tag).filter(Tag.name == tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.add(tag)
        tags.append(tag)
    
    # Create idea
    idea = Idea(
        title=idea_data.title,
        description=idea_data.description,
        status=idea_data.status,
        user_id=current_user.id,
        tags=tags
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return idea

@router.get("/", response_model=List[IdeaResponse])
def get_ideas(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    status: str = None,
    tag: str = None
):
    query = db.query(Idea).filter(Idea.user_id == current_user.id)
    
    if status:
        query = query.filter(Idea.status == status)
    if tag:
        query = query.join(Idea.tags).filter(Tag.name == tag)
    
    ideas = query.all()
    return ideas

@router.put("/{idea_id}", response_model=IdeaResponse)
def update_idea(
    idea_id: int,
    idea_data: IdeaUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    idea = db.query(Idea).filter(
        Idea.id == idea_id,
        Idea.user_id == current_user.id
    ).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    # Update tags if provided
    if idea_data.tags is not None:
        tags = []
        for tag_name in idea_data.tags:
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag)
            tags.append(tag)
        idea.tags = tags
    
    # Update other fields
    for key, value in idea_data.dict(exclude={'tags'}, exclude_unset=True).items():
        setattr(idea, key, value)
    
    db.commit()
    db.refresh(idea)
    return idea

@router.delete("/{idea_id}")
def delete_idea(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    idea = db.query(Idea).filter(
        Idea.id == idea_id,
        Idea.user_id == current_user.id
    ).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    db.delete(idea)
    db.commit()
    return {"message": "Idea deleted successfully"}

@router.get("/tags", response_model=List[TagResponse])
def get_tags(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    tags = db.query(Tag).all()
    return tags

@router.get("/available", response_model=List[IdeaResponse])
def get_available_ideas(
    project_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    ideas = db.query(Idea).filter(
        Idea.user_id == current_user.id,
        ~Idea.projects.contains(project)
    ).all()
    
    return ideas
