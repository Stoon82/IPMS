from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    mood = Column(String, nullable=True)
    tags = Column(ARRAY(String), default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="journal_entries")
