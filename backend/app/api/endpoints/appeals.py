import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from backend.app.schemas.appeal import AppealGenerateRequest
from backend.app.services.appeal_generator import build_appeal_draft, APPEALS_OUTPUT_DIR

router = APIRouter(prefix="/appeals", tags=["Appeals"])

@router.post("/generate")
def generate_appeal(payload: AppealGenerateRequest):
    """
    Generates a formal First Appeal draft document under Section 8 of the Karnataka Sakala Act.
    Embeds verified statutory clauses, claims compensation under Section 13, and provides
    both printable PDF and markdown preview.
    """
    draft = build_appeal_draft(payload.model_dump())
    return {
        "success": True,
        "appeal_data": draft
    }

@router.get("/download/{filename}")
def download_appeal_pdf(filename: str):
    """Downloads the generated formal appeal draft PDF."""
    safe_name = os.path.basename(filename)
    file_path = APPEALS_OUTPUT_DIR / safe_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Requested appeal draft PDF not found or has expired.")

    return FileResponse(
        path=str(file_path),
        filename=safe_name,
        media_type="application/pdf"
    )
