from functools import lru_cache

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    app_name: str = "Anvaya Market Intelligence API"
    app_version: str = "0.1.0"
    app_environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    port: int = 5001

    database_url: str | None = None

    supabase_url: str | None = None
    supabase_anon_key: SecretStr | None = None
    supabase_service_role_key: SecretStr | None = None

    gemini_api_key: SecretStr | None = None
    gemini_model: str = "gemini-3.6-flash"
    kalimati_retention_days: int = 7

    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
