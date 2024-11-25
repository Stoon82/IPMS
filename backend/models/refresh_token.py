from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    # Relationships
    user = relationship("User", back_populates="refresh_tokens")

    def __repr__(self):
        return f"<RefreshToken {self.id}>"
