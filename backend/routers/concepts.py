from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from auth import get_current_user
from models.user import User
from models.concept import ConceptNote
from schemas.concept import ConceptNoteCreate, ConceptNoteUpdate, ConceptNote as ConceptNoteSchema

router = APIRouter(
    tags=["concepts"]
)

@router.post("/", response_model=ConceptNoteSchema)
def create_concept_note(
    concept: ConceptNoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_concept = ConceptNote(
        title=concept.title,
        content=concept.content,
        project_id=concept.project_id,
        user_id=current_user.id
    )
    db.add(db_concept)
    db.commit()
    db.refresh(db_concept)
    return db_concept

@router.get("/project/{project_id}", response_model=List[ConceptNoteSchema])
def get_project_concepts(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    concepts = db.query(ConceptNote).filter(
        ConceptNote.project_id == project_id
    ).order_by(ConceptNote.created_at.desc()).all()
    return concepts

@router.get("/{concept_id}", response_model=ConceptNoteSchema)
def get_concept_note(
    concept_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    concept = db.query(ConceptNote).filter(ConceptNote.id == concept_id).first()
    if not concept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Concept note not found"
        )
    return concept

@router.put("/{concept_id}", response_model=ConceptNoteSchema)
def update_concept_note(
    concept_id: int,
    concept_update: ConceptNoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_concept = db.query(ConceptNote).filter(ConceptNote.id == concept_id).first()
    if not db_concept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Concept note not found"
        )
    
    if db_concept.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this concept note"
        )

    for field, value in concept_update.model_dump(exclude_unset=True).items():
        setattr(db_concept, field, value)
    
    db_concept.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_concept)
    return db_concept

@router.delete("/{concept_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_concept_note(
    concept_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_concept = db.query(ConceptNote).filter(ConceptNote.id == concept_id).first()
    if not db_concept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Concept note not found"
        )
    
    if db_concept.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this concept note"
        )

    db.delete(db_concept)
    db.commit()
    return None
