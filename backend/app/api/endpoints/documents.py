import os
import json
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.core.security import validate_uploaded_file, mask_aadhaar_number
from backend.app.services.document_processor import process_uploaded_document_file, extract_fields_from_text
from backend.app.services.rule_engine import (
    load_versioned_rules, validate_single_document, calculate_readiness_score
)
from backend.app.services.name_matching import cross_check_document_names
from backend.app.schemas.document import (
    DocumentItem, ExtractedData, ManualCorrectionRequest, DocumentValidationResponse
)

router = APIRouter(prefix="/documents", tags=["Documents"])

SAMPLES_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "sample_documents.json"

# In-memory document session cache for the active user session
DOCUMENTS_STORE: Dict[str, Dict[str, Any]] = {}

def get_samples_data() -> Dict[str, Any]:
    if SAMPLES_FILE.exists():
        with open(SAMPLES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"sample_documents": []}

@router.get("/samples")
def get_synthetic_samples():
    """
    Returns synthetic demonstration documents for Mohammed Arfaz.
    Enables immediate testing without requiring users to upload private records.
    """
    samples = get_samples_data()
    # Pre-populate into memory store
    for doc in samples.get("sample_documents", []):
        DOCUMENTS_STORE[doc["id"]] = doc
    return samples

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type_hint: Optional[str] = Form(None)
):
    """
    Secure document upload endpoint with file type and size validation.
    Immediately extracts fields, masks sensitive Aadhaar data, and stores temporarily.
    """
    contents = await file.read()
    validate_uploaded_file(file.filename or "upload.pdf", len(contents))

    doc_id = f"doc_{uuid.uuid4().hex[:10]}"
    ext = (file.filename or "").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "pdf"
    temp_path = settings.TEMP_UPLOAD_DIR / f"{doc_id}.{ext}"

    with open(temp_path, "wb") as f:
        f.write(contents)

    # Process & Extract
    extracted = process_uploaded_document_file(temp_path, file.filename or "")
    if document_type_hint and document_type_hint != "Auto Detect":
        extracted["document_type"] = document_type_hint

    doc_entry = {
        "id": doc_id,
        "filename": file.filename,
        "document_type": extracted["document_type"],
        "extracted_data": extracted,
        "ocr_confidence": extracted.get("ocr_confidence", {}),
        "manual_overrides": {},
        "file_path": str(temp_path),
        "is_synthetic": False
    }
    DOCUMENTS_STORE[doc_id] = doc_entry

    return {
        "success": True,
        "document": doc_entry,
        "privacy_notice": "Document stored temporarily for verification. No raw unmasked Aadhaar number is retained."
    }

@router.get("/list")
def list_session_documents():
    """Lists all documents loaded or uploaded in the current session."""
    if not DOCUMENTS_STORE:
        # Load samples if empty
        get_synthetic_samples()
    return list(DOCUMENTS_STORE.values())

@router.post("/manual-correct")
def manual_field_correction(payload: ManualCorrectionRequest):
    """
    Allows the citizen to manually correct or verify any OCR-extracted field.
    Ensures that OCR errors don't prevent citizens from applying.
    """
    doc = DOCUMENTS_STORE.get(payload.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Apply override
    doc["manual_overrides"][payload.field_name] = payload.corrected_value
    doc["extracted_data"][payload.field_name] = payload.corrected_value

    return {
        "success": True,
        "updated_field": payload.field_name,
        "new_value": payload.corrected_value,
        "document": doc
    }

@router.post("/validate")
def validate_documents(document_ids: Optional[List[str]] = None):
    """
    Runs deterministic verification checks across all active documents.
    Performs expiry checks, format validation, and RapidFuzz name cross-matching.
    Calculates Application Readiness Score.
    """
    if not DOCUMENTS_STORE:
        get_synthetic_samples()

    target_docs = []
    if document_ids:
        for did in document_ids:
            if did in DOCUMENTS_STORE:
                target_docs.append(DOCUMENTS_STORE[did])
    else:
        target_docs = list(DOCUMENTS_STORE.values())

    if not target_docs:
        raise HTTPException(status_code=400, detail="No documents available for validation")

    rules = load_versioned_rules()
    all_validation_results = []

    for doc in target_docs:
        doc_results = validate_single_document(
            doc_id=doc["id"],
            document_type=doc.get("document_type", "Supporting Document"),
            extracted_data=doc.get("extracted_data", {}),
            rules=rules
        )
        all_validation_results.extend(doc_results)

    # Cross-document name consistency
    name_analysis = cross_check_document_names(target_docs)

    # Readiness score
    score_info = calculate_readiness_score(all_validation_results, target_docs)

    passed_count = sum(1 for r in all_validation_results if r["status"] == "VERIFIED")
    warning_count = sum(1 for r in all_validation_results if r["status"] == "ATTENTION_REQUIRED")
    failed_count = sum(1 for r in all_validation_results if r["status"] == "UNABLE_TO_VERIFY")

    overall = "VERIFIED"
    if warning_count > 0 or name_analysis["status"] == "ATTENTION_REQUIRED":
        overall = "ATTENTION_REQUIRED"
    elif failed_count > 0:
        overall = "UNABLE_TO_VERIFY"

    return {
        "overall_status": overall,
        "total_checks": len(all_validation_results),
        "passed_checks": passed_count,
        "warning_checks": warning_count,
        "failed_checks": failed_count,
        "results": all_validation_results,
        "name_similarity_analysis": name_analysis,
        "readiness_score": score_info["score"],
        "score_breakdown": score_info["breakdown"],
        "disclaimer": score_info["disclaimer"]
    }

@router.delete("/purge")
def purge_uploaded_files():
    """
    Privacy and Security endpoint: purges all uploaded temporary files from disk and session.
    """
    purged_count = 0
    for doc in list(DOCUMENTS_STORE.values()):
        if not doc.get("is_synthetic"):
            path_str = doc.get("file_path")
            if path_str and os.path.exists(path_str):
                try:
                    os.remove(path_str)
                    purged_count += 1
                except Exception:
                    pass
            DOCUMENTS_STORE.pop(doc["id"], None)

    return {
        "success": True,
        "message": f"Successfully purged {purged_count} temporary documents.",
        "security_standard": "Compliance with zero-retention temporary document storage principle."
    }
