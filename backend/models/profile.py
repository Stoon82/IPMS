from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Profile(Base):
    __tablename__ = "profiles"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    theme_preference = Column(String, default="light")
    notification_preferences = Column(String, default="all")  # all, important, none
    timezone = Column(String, default="UTC")

    user = relationship("User", back_populates="profile")
