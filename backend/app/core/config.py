import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    APP_NAME: str = "JAN SETU"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "127.0.0.1"

    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/jan_setu.db"

    # Privacy & Document upload limits
    MAX_FILE_SIZE_MB: int = 5
    ALLOWED_EXTENSIONS: list[str] = ["pdf", "png", "jpg", "jpeg"]
    AUTO_PURGE_TEMP_UPLOADS: bool = True
    MASK_AADHAAR: bool = True
    TEMP_UPLOAD_DIR: Path = BASE_DIR / "temp_uploads"

    # Bhashini / Kannada TTS
    BHASHINI_USER_ID: str = ""
    BHASHINI_API_KEY: str = ""
    BHASHINI_PIPELINE_ID: str = ""

    # Optional read-only LLM explainer (Never used for eligibility)
    OPENAI_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
settings.TEMP_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
