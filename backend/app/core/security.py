import re
from fastapi import HTTPException
from backend.app.core.config import settings

AADHAAR_REGEX = re.compile(r"\b[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}\b")

def mask_aadhaar_number(text: str) -> str:
    """
    Masks 12-digit Aadhaar numbers, keeping only the last 4 digits (e.g. XXXX-XXXX-1234).
    Prevents storage or display of complete Aadhaar data.
    """
    if not text:
        return text

    def _mask_match(match):
        raw = match.group(0).replace(" ", "").replace("-", "")
        if len(raw) == 12:
            return f"XXXX-XXXX-{raw[-4:]}"
        return match.group(0)

    return AADHAAR_REGEX.sub(_mask_match, text)

def validate_uploaded_file(filename: str, content_length: int) -> None:
    """
    Validates file extension and size according to strict GovTech safety guidelines.
    """
    if not filename:
        raise HTTPException(status_code=400, detail="Empty filename provided")

    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if content_length > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
        )
