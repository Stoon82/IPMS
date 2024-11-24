from pydantic_settings import BaseSettings
from typing import Literal

class AIProviderSettings(BaseSettings):
    provider: Literal['openai', 'local', 'huggingface', 'anthropic', 'ollama'] = 'openai'
    openai_api_key: str = ""
    huggingface_api_key: str = ""
    anthropic_api_key: str = ""
    local_model_path: str = ""  # Path to local model if using local provider
    ollama_host: str = "http://localhost:11434"  # Default Ollama host
    model_name: str = "gpt-3.5-turbo"  # Default model name for the selected provider

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "IPMS"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change this in production!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = "sqlite:///./ipms.db"
    
    # AI Settings
    ai: AIProviderSettings = AIProviderSettings()

    class Config:
        env_file = ".env"
        env_nested_delimiter = '__'
        case_sensitive = True

settings = Settings()
