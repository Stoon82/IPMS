from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import httpx
from datetime import datetime

from models.user import User
from config import get_settings
from .utils import create_tokens

settings = get_settings()

async def exchange_code_for_token(code: str, redirect_uri: str) -> dict:
    """Exchange authorization code for access token."""
    async with httpx.AsyncClient() as client:
        try:
            # Log request details for debugging
            print(f"Exchanging code for token with redirect_uri: {redirect_uri}")
            print(f"Using client_id: {settings.GOOGLE_CLIENT_ID}")
            
            token_url = "https://oauth2.googleapis.com/token"
            data = {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "code": code,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code"
            }
            
            # Log full request data (except client secret)
            debug_data = data.copy()
            debug_data["client_secret"] = "REDACTED"
            print(f"Token request data: {debug_data}")
            
            response = await client.post(token_url, data=data)
            
            # Log response for debugging
            print(f"Token exchange response status: {response.status_code}")
            if response.status_code != 200:
                print(f"Token exchange error response: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Failed to exchange code for token. Status: {response.status_code}, Response: {response.text}"
                )
            
            token_data = response.json()
            print("Successfully exchanged code for token")
            return token_data
            
        except Exception as e:
            print(f"Token exchange error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Failed to exchange code for token: {str(e)}"
            )

async def get_google_user_info(access_token: str) -> dict:
    """Get user info from Google using access token."""
    async with httpx.AsyncClient() as client:
        try:
            print(f"Fetching user info with access token")
            response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            print(f"User info response status: {response.status_code}")
            if response.status_code != 200:
                print(f"User info error response: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Failed to get user info. Status: {response.status_code}, Response: {response.text}"
                )
            
            user_info = response.json()
            print(f"Successfully retrieved user info for email: {user_info.get('email')}")
            return user_info
            
        except Exception as e:
            print(f"User info error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Failed to get user info: {str(e)}"
            )

async def authenticate_google_user(db: Session, code: str, redirect_uri: Optional[str] = None) -> tuple[User, str, str]:
    """Authenticate user with Google OAuth code."""
    # Use the default redirect URI if none provided
    redirect_uri = redirect_uri or settings.GOOGLE_REDIRECT_URI
    
    # Exchange code for token
    token_data = await exchange_code_for_token(code, redirect_uri)
    
    # Get user info using access token
    google_user = await get_google_user_info(token_data["access_token"])
    
    # Check if user exists
    user = db.query(User).filter(User.email == google_user["email"]).first()
    
    if not user:
        # Create new user if they don't exist
        user = User(
            username=google_user["email"].split("@")[0],  # Use email prefix as username
            email=google_user["email"],
            full_name=google_user.get("name"),
            google_id=google_user["id"],
            last_login=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update existing user's information
        update_needed = False
        if not user.google_id:
            user.google_id = google_user["id"]
            update_needed = True
        if not user.full_name and google_user.get("name"):
            user.full_name = google_user["name"]
            update_needed = True
        user.last_login = datetime.utcnow()
        update_needed = True
        
        if update_needed:
            db.commit()
            db.refresh(user)
    
    # Create tokens
    access_token, refresh_token, _ = create_tokens(user, db)
    
    return user, access_token, refresh_token
