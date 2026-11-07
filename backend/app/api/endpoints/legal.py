import json
from pathlib import Path
from fastapi import APIRouter
from backend.app.schemas.legal import LegalProvisionItem

router = APIRouter(prefix="/legal-provisions", tags=["Legal Provisions"])

LEGAL_PROVISIONS_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "legal_provisions.json"

@router.get("")
def list_legal_provisions():
    """
    Returns verified statutory provisions of the Karnataka Guarantee of Services to Citizens Act, 2011.
    Strictly distinguishes between VERIFIED and UNVERIFIED provisions.
    """
    if not LEGAL_PROVISIONS_FILE.exists():
        return []
    with open(LEGAL_PROVISIONS_FILE, "r", encoding="utf-8") as f:
        provisions = json.load(f)
    return provisions
