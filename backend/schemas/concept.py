from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ConceptNoteBase(BaseModel):
    title: str
    content: str

class ConceptNoteCreate(ConceptNoteBase):
    project_id: int

class ConceptNoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None

class ConceptNote(ConceptNoteBase):
    id: int
    project_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
