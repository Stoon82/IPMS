from sqlalchemy import Column, Integer, ForeignKey, DateTime, Table
from database import Base
from datetime import datetime

# Association table for many-to-many relationship between projects and ideas
project_ideas = Table(
    "project_ideas",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
    Column("idea_id", Integer, ForeignKey("ideas.id"), primary_key=True),
    Column("created_at", DateTime, nullable=False, default=datetime.utcnow),
)
