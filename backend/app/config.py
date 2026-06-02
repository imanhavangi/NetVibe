import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    All sensitive credentials MUST be provided via environment variables.
    No hardcoded defaults for security purposes.
    """
    DATABASE_URL: str = Field(
        ...,
        description="PostgreSQL connection URL (required)",
        env="DATABASE_URL"
    )
    REDIS_URL: str = Field(
        default="redis://redis_cache:6379/0",
        description="Redis connection URL",
        env="REDIS_URL"
    )
    SUBMISSION_RATE_LIMIT: int = Field(
        default=600,
        description="Rate limit duration in seconds (default: 10 minutes)",
        env="SUBMISSION_RATE_LIMIT"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
