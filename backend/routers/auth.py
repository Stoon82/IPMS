from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import secrets
import logging
import os
import urllib.parse
from dotenv import load_dotenv
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
import requests
from google.auth.transport import requests as google_requests

load_dotenv()

from database import get_db
from models.user import User
from models.refresh_token import RefreshToken
from schemas.auth import (
    Token,
    UserCreate,
    PasswordResetRequest,
    PasswordResetVerify,
    RefreshToken as RefreshTokenSchema,
    LoginRequest
)
from auth.utils import (
    get_password_hash,
    authenticate_user,
    create_tokens,
    get_current_user,
    verify_refresh_token,
    revoke_refresh_token,
    create_access_token,
    create_refresh_token,
    store_refresh_token
)
from config import get_settings

settings = get_settings()
# Create routers
router = APIRouter(tags=["auth"])  # Remove the /auth prefix since it's added in main.py
logger = logging.getLogger(__name__)

@router.post("/register", response_model=Token)
def register(user: UserCreate, response: Response, db: Session = Depends(get_db)):
    try:
        logger.info(f"Starting registration process for user: {user.username}")
        logger.debug(f"Registration request data: {user.dict(exclude={'password'})}")
        
        # Check if username exists
        existing_username = db.query(User).filter(User.username == user.username).first()
        if existing_username:
            logger.warning(f"Registration failed: Username {user.username} already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email exists
        existing_email = db.query(User).filter(User.email == user.email).first()
        if existing_email:
            logger.warning(f"Registration failed: Email {user.email} already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        try:
            logger.debug("Hashing password...")
            hashed_password = get_password_hash(user.password)
            
            logger.debug("Creating user object...")
            db_user = User(
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                hashed_password=hashed_password,
                created_at=datetime.utcnow(),
                tasks=[],
                password_resets=[],
                refresh_tokens=[],
                activities=[],
                journal_entries=[],
                goals=[],
                habits=[],
                projects=[],
                ideas=[],
                concept_notes=[]
            )
            
            logger.debug("Adding user to database...")
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            logger.info(f"Successfully created user: {user.username}")
            
            # Create tokens
            logger.debug("Generating authentication tokens...")
            access_token, refresh_token, expires_at = create_tokens(db_user, db)
            
            # Set cookie for client-side storage
            logger.debug("Setting authentication cookie...")
            response.set_cookie(
                key="access_token",
                value=f"Bearer {access_token}",
                httponly=True,
                secure=True,
                samesite="lax",
                max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            )
            
            logger.info(f"Successfully completed registration for user: {user.username}")
            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_at": expires_at
            }
            
        except Exception as e:
            db.rollback()
            logger.error(f"Database error during user creation: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
            
    except HTTPException as he:
        logger.error(f"HTTP error during registration: {he.detail}", exc_info=True)
        raise he
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )

@router.post("/token", response_model=Token)
@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    try:
        logger.info(f"Login attempt for user: {login_data.username}")
        
        user = authenticate_user(db, login_data.username, login_data.password)
        if not user:
            logger.warning(f"Failed login attempt for user: {login_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create access and refresh tokens
        access_token, refresh_token, expires_at = create_tokens(user, db)

        # Set the access token as an HTTP-only cookie
        response.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            secure=True,
            samesite="lax",
            path="/"
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "refresh_token": refresh_token,
            "expires_at": expires_at
        }

    except HTTPException as he:
        # Re-raise HTTP exceptions (like 401) without wrapping them
        raise he
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )

@router.post("/refresh", response_model=Token)
def refresh_access_token(
    refresh_token_data: RefreshTokenSchema,
    response: Response,
    db: Session = Depends(get_db)
):
    user = verify_refresh_token(refresh_token_data.refresh_token, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    # Revoke old refresh token
    revoke_refresh_token(refresh_token_data.refresh_token, db)
    
    # Create new tokens
    access_token, refresh_token, expires_at = create_tokens(user, db)
    
    # Set cookie for client-side storage
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_at": expires_at
    }

@router.post("/logout")
async def logout(
    refresh_token_data: RefreshTokenSchema,
    response: Response,
    db: Session = Depends(get_db)
):
    """Logout user and revoke refresh token."""
    try:
        # Revoke the refresh token
        revoked = revoke_refresh_token(refresh_token_data.refresh_token, db)
        
        # Clear the refresh token cookie
        response.delete_cookie(
            key="refresh_token",
            httponly=True,
            samesite="lax",
            secure=False  # Set to True in production with HTTPS
        )
        
        if not revoked:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid refresh token"
            )
        
        return {"message": "Successfully logged out"}
    except Exception as e:
        print(f"Logout error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to logout"
        )

@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get the profile of the currently authenticated user."""
    return current_user

@router.post("/password-reset/request")
def request_password_reset(
    reset_request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == reset_request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found"
        )
    
    # Generate reset token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    # Save reset token
    reset = PasswordReset(
        user_id=user.id,
        reset_token=token,
        expires_at=expires_at
    )
    db.add(reset)
    db.commit()
    
    # In a real application, you would send this token via email
    # For development, we'll return it in the response
    return {
        "message": "Password reset token generated",
        "token": token,  # In production, remove this and send via email
        "expires_at": expires_at
    }

@router.post("/password-reset/verify")
def verify_password_reset(
    verify_data: PasswordResetVerify,
    db: Session = Depends(get_db)
):
    reset = db.query(PasswordReset).filter(
        PasswordReset.reset_token == verify_data.token,
        PasswordReset.used_at.is_(None),
        PasswordReset.expires_at > datetime.utcnow()
    ).first()
    
    if not reset:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Update user's password
    user = db.query(User).filter(User.id == reset.user_id).first()
    user.hashed_password = get_password_hash(verify_data.new_password)
    
    # Mark reset token as used
    reset.used_at = datetime.utcnow()
    
    db.commit()
    return {"message": "Password reset successful"}
