from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Habit(Base):
    __tablename__ = "habits"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    description = Column(String, nullable=True)
    frequency = Column(String)  # daily, weekly, monthly
    target_days = Column(ARRAY(String), default=[])  # For weekly habits: ["monday", "wednesday", "friday"]
    streak = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="habits")
    tracking = relationship("HabitTracking", back_populates="habit", cascade="all, delete-orphan")


class HabitTracking(Base):
    __tablename__ = "habit_tracking"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"))
    completed = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String, nullable=True)

    habit = relationship("Habit", back_populates="tracking")
