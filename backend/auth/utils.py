from datetime import datetime, timedelta
from typing import Optional, Tuple
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import secrets

from config import get_settings
from database import get_db
from models.user import User
from models.refresh_token import RefreshToken

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def create_access_token(data: dict) -> str:
    """Create a new access token."""
    to_encode = data.copy()
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(user_id: int) -> str:
    """Create a new refresh token."""
    return secrets.token_urlsafe(32)

def store_refresh_token(db: Session, user_id: int, refresh_token: str) -> None:
    """Store a refresh token in the database."""
    refresh_token_expires = datetime.utcnow() + timedelta(days=30)  # 30 days
    db_refresh_token = RefreshToken(
        token=refresh_token,
        expires_at=refresh_token_expires,
        user_id=user_id
    )
    db.add(db_refresh_token)
    db.commit()

def create_tokens(user: User, db: Session) -> Tuple[str, str, datetime]:
    """Create both access and refresh tokens."""
    # Create access token
    access_token_data = {
        "sub": user.username,
    }
    access_token = create_access_token(access_token_data)
    access_token_expires = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Create refresh token
    refresh_token = create_refresh_token(user.id)
    store_refresh_token(db, user.id, refresh_token)
    
    return access_token, refresh_token, access_token_expires

def verify_refresh_token(refresh_token: str, db: Session) -> Optional[User]:
    """Verify refresh token and return associated user."""
    db_refresh_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token,
        RefreshToken.revoked == False,
        RefreshToken.expires_at > datetime.utcnow()
    ).first()
    
    if not db_refresh_token:
        return None
    
    return db_refresh_token.user

def revoke_refresh_token(refresh_token: str, db: Session) -> bool:
    """Revoke a refresh token."""
    db_refresh_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token
    ).first()
    
    if db_refresh_token:
        db_refresh_token.revoked = True
        db.commit()
        return True
    return False

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user
