from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Table, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base
from .project_idea import project_ideas

# Many-to-many relationship table for ideas and tags
idea_tags = Table(
    'idea_tags',
    Base.metadata,
    Column('idea_id', Integer, ForeignKey('ideas.id', ondelete="CASCADE")),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete="CASCADE"))
)

class IdeaStatus(str, enum.Enum):
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    IMPLEMENTED = "implemented"
    ARCHIVED = "archived"

class Idea(Base):
    __tablename__ = "ideas"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    status = Column(Enum(IdeaStatus), default=IdeaStatus.DRAFT)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="ideas")
    tags = relationship("Tag", secondary=idea_tags, back_populates="ideas")
    projects = relationship("Project", secondary=project_ideas, back_populates="ideas")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    
    # Relationships
    ideas = relationship("Idea", secondary=idea_tags, back_populates="tags")
