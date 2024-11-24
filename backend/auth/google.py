from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import httpx
from datetime import datetime

from models.user import User
from config import get_settings
from .utils import create_access_token

settings = get_settings()

async def verify_google_token(token: str) -> dict:
    """Verify Google OAuth token with Google's servers."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
            )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google token"
                )
            return response.json()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Failed to verify Google token: {str(e)}"
            )

async def authenticate_google_user(db: Session, token: str) -> tuple[User, str]:
    """Authenticate user with Google OAuth token."""
    # Verify the token with Google
    google_user = await verify_google_token(token)
    
    # Check if user exists
    user = db.query(User).filter(User.email == google_user["email"]).first()
    
    if not user:
        # Create new user if they don't exist
        user = User(
            username=google_user["email"].split("@")[0],  # Use email prefix as username
            email=google_user["email"],
            full_name=google_user.get("name"),
            google_id=google_user["sub"],
            last_login=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update existing user's Google ID and last login if needed
        update_needed = False
        if not user.google_id:
            user.google_id = google_user["sub"]
            update_needed = True
        if not user.full_name and google_user.get("name"):
            user.full_name = google_user["name"]
            update_needed = True
        user.last_login = datetime.utcnow()
        update_needed = True
        
        if update_needed:
            db.commit()
            db.refresh(user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.username}
    )
    
    return user, access_token
