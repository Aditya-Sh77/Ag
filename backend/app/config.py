import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Enterprise AI Orchestrator"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "super-secret-jwt-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    DATABASE_URL: str = "sqlite+aiosqlite:///./enterprise_ai.db"

    # API Keys
    OPENAI_API_KEY: str = "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"
    
    GEMINI_API_KEY: str = "AIzaSyB4G4CtMbCH-qqC_m9Qs3sUonmFQ6_TSLY"
    CLAUDE_API_KEY: str = "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"
    GROQ_API_KEY: str = "xai-biOocqd8io7RWR2EfRfBJ0Z4viAL4ZXFVYvKqcQYWDHYI9Q2FJ5qRhzyv5IwIRvIsucov5pGS1ftV2mM"
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
