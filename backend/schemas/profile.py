from pydantic import BaseModel
from typing import Optional

class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    theme_preference: Optional[str] = "light"
    notification_preferences: Optional[str] = "all"
    timezone: Optional[str] = "UTC"

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
