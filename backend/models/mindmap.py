from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class Mindmap(Base):
    __tablename__ = "mindmaps"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    data = Column(JSON)
    project_id = Column(Integer, ForeignKey("projects.id"))
    
    project = relationship("Project", back_populates="mindmaps")
