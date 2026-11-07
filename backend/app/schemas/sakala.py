from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class SakalaServiceItem(BaseModel):
    service_id: str
    service_name: str
    kannada_name: Optional[str] = None
    department: str
    stipulated_timeline_days: int
    timeline_unit: str
    designated_officer: str
    first_appellate_authority: str
    second_appellate_authority: str
    source_reference: str
    last_verified_date: str
    verification_status: str

class DeadlineCalculateRequest(BaseModel):
    service_id: str
    submission_date: str  # YYYY-MM-DD
    gsc_number: Optional[str] = None
    manual_timeline_days: Optional[int] = None

class DeadlineCalculateResponse(BaseModel):
    service_id: str
    service_name: str
    submission_date: str
    stipulated_timeline_days: int
    timeline_unit: str
    expected_deadline: str
    is_overdue: bool
    remaining_days: int
    overdue_days: int
    designated_officer: str
    first_appellate_authority: str
    escalation_eligible: bool
    escalation_window_text: str
    status_source: str
    disclaimer: str

class ApplicationCreateRequest(BaseModel):
    gsc_number: str
    service_id: str
    service_name: str
    applicant_name: str
    submission_date: str
    office_name: Optional[str] = None
    status: Optional[str] = "PENDING"
    status_source: Optional[str] = "MANUAL_ENTRY"

class ApplicationItem(BaseModel):
    id: int
    gsc_number: str
    service_id: str
    service_name: str
    applicant_name: str
    submission_date: str
    stipulated_days: int
    expected_deadline: str
    is_overdue: bool
    days_remaining_or_overdue: int
    status: str
    status_source: str
    office_name: Optional[str] = None
