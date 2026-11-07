from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class AppealGenerateRequest(BaseModel):
    gsc_number: str
    service_id: str
    service_name: str
    applicant_name: str
    applicant_address: Optional[str] = "Bengaluru, Karnataka"
    submission_date: str
    deadline_date: str
    designated_officer: str
    first_appellate_authority: str
    appeal_type: str = "FIRST_APPEAL"  # FIRST_APPEAL | SECOND_APPEAL
    citizen_facts: str
    compensation_claimed: bool = True
    disclaimer_ack: bool = True

class AppealGenerateResponse(BaseModel):
    appeal_id: int
    draft_pdf_url: str
    gsc_number: str
    applicant_name: str
    target_authority: str
    statutory_citations: List[Dict[str, str]]
    preview_markdown: str
    disclaimer: str
    instructions: List[str]
