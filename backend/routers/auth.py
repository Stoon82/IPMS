from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import secrets

from database import get_db
from models.user import User
from models.password_reset import PasswordReset
from schemas.auth import (
    UserCreate,
    User as UserSchema,
    Token,
    PasswordResetRequest,
    PasswordResetVerify
)
from auth.utils import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_current_user,
)
from config import get_settings

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=UserSchema)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if username exists
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/token", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_user)):
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
