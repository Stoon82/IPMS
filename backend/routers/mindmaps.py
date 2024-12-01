from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.mindmap import Mindmap
from pydantic import BaseModel

router = APIRouter()

class MindmapBase(BaseModel):
    title: str
    data: dict

class MindmapCreate(MindmapBase):
    project_id: int

class MindmapResponse(MindmapBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

@router.post("/", response_model=MindmapResponse)
def create_mindmap(mindmap: MindmapCreate, db: Session = Depends(get_db)):
    db_mindmap = Mindmap(**mindmap.dict())
    db.add(db_mindmap)
    db.commit()
    db.refresh(db_mindmap)
    return db_mindmap

@router.get("/{mindmap_id}", response_model=MindmapResponse)
def get_mindmap(mindmap_id: int, db: Session = Depends(get_db)):
    mindmap = db.query(Mindmap).filter(Mindmap.id == mindmap_id).first()
    if not mindmap:
        raise HTTPException(status_code=404, detail="Mindmap not found")
    return mindmap

@router.get("/projects/{project_id}/mindmaps/", response_model=List[MindmapResponse])
def get_project_mindmaps(project_id: int, db: Session = Depends(get_db)):
    mindmaps = db.query(Mindmap).filter(Mindmap.project_id == project_id).all()
    return mindmaps

@router.put("/{mindmap_id}", response_model=MindmapResponse)
def update_mindmap(mindmap_id: int, mindmap: MindmapBase, db: Session = Depends(get_db)):
    db_mindmap = db.query(Mindmap).filter(Mindmap.id == mindmap_id).first()
    if not db_mindmap:
        raise HTTPException(status_code=404, detail="Mindmap not found")
    
    for key, value in mindmap.dict().items():
        setattr(db_mindmap, key, value)
    
    db.commit()
    db.refresh(db_mindmap)
    return db_mindmap

@router.delete("/{mindmap_id}")
def delete_mindmap(mindmap_id: int, db: Session = Depends(get_db)):
    mindmap = db.query(Mindmap).filter(Mindmap.id == mindmap_id).first()
    if not mindmap:
        raise HTTPException(status_code=404, detail="Mindmap not found")
    
    db.delete(mindmap)
    db.commit()
    return {"message": "Mindmap deleted successfully"}
