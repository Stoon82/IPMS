from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Goal(Base):
    __tablename__ = "goals"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(String)
    category = Column(String)
    status = Column(String, default="active")  # active, completed, abandoned
    target_date = Column(DateTime(timezone=True), nullable=True)
    progress = Column(Float, default=0.0)
    metrics = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="goals")
    progress_updates = relationship("GoalProgress", back_populates="goal", cascade="all, delete-orphan")


class GoalProgress(Base):
    __tablename__ = "goal_progress"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"))
    value = Column(Float)
    notes = Column(String, nullable=True)
    data = Column(JSON, default={})
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    goal = relationship("Goal", back_populates="progress_updates")
