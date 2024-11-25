from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class ProjectLog(Base):
    __tablename__ = "project_logs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    log_type = Column(String(50), nullable=False)  # 'progress', 'issue', 'decision', etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="logs")
