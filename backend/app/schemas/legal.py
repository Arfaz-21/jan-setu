from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class LegalProvisionItem(BaseModel):
    provision_key: str
    provision_number: str
    act_name: str
    title: str
    exact_verified_text: str
    source_document: str
    amendment_reference: str
    verification_date: str
    verification_status: str  # VERIFIED | UNVERIFIED
    applies_to: List[str]
