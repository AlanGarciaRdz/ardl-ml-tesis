import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env.production or .env
env_file = ".env.production" if os.path.exists(".env.production") else ".env"
load_dotenv(env_file)

class Settings(BaseSettings):
    API_V1_STR: str
    PROJECT_NAME: str
    VERSION: str
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # PostgreSQL Configuration
    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    
    # Database URL
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # Environment
    ENVIRONMENT: str
    DEBUG: bool = True

    class Config:
        # Try .env.production first (for production), then .env (for development)
        env_file = ".env.production" if os.path.exists(".env.production") else ".env"
        case_sensitive = True

settings = Settings()
