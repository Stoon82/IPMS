from pydantic_settings import BaseSettings
from typing import Literal
import os
import secrets

class AIProviderSettings(BaseSettings):
    provider: Literal['openai', 'local', 'huggingface', 'anthropic', 'ollama'] = 'openai'
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    huggingface_api_key: str = os.getenv("HUGGINGFACE_API_KEY", "")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    local_model_path: str = os.getenv("LOCAL_MODEL_PATH", "")
    ollama_host: str = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    model_name: str = os.getenv("MODEL_NAME", "gpt-3.5-turbo")

    class Config:
        model_config = {
            'protected_namespaces': ('settings_',)
        }

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "IPMS"
    VERSION: str = "1.0.0"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_hex(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ipms.db")
    
    # Frontend URL
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Google OAuth Settings
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/auth/google/callback")
    
    # Validate required settings
    @property
    def validate_google_oauth(self) -> bool:
        if not self.GOOGLE_CLIENT_ID:
            raise ValueError("GOOGLE_CLIENT_ID must be set")
        if not self.GOOGLE_CLIENT_SECRET:
            raise ValueError("GOOGLE_CLIENT_SECRET must be set")
        if not self.GOOGLE_REDIRECT_URI:
            raise ValueError("GOOGLE_REDIRECT_URI must be set")
        return True
    
    # CORS settings
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "https://localhost:3000",
        "http://127.0.0.1:3000",
        "https://127.0.0.1:3000",
        "http://localhost:8000",
        "https://localhost:8000",
        "http://127.0.0.1:8000",
        "https://127.0.0.1:8000",
    ]
    CORS_HEADERS: list = [
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
    ]
    CORS_METHODS: list = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list = ["*"]
    CORS_ALLOW_HEADERS: list = ["*"]
    
    # AI Settings
    ai: AIProviderSettings = AIProviderSettings()

    class Config:
        env_file = ".env"
        env_nested_delimiter = '__'
        case_sensitive = True
        env_file_encoding = "utf-8"

settings = Settings()

def get_settings() -> Settings:
    return settings
