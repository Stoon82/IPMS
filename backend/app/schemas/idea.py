from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: int

    class Config:
        orm_mode = True

class IdeaBase(BaseModel):
    title: str
    description: str
    status: str = "draft"
    tags: List[str]

class IdeaCreate(IdeaBase):
    pass

class IdeaUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None

class IdeaResponse(IdeaBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    tags: List[TagResponse]

    class Config:
        orm_mode = True
