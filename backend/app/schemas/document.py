from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class ExtractedData(BaseModel):
    full_name: Optional[str] = None
    certificate_number: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    issuing_authority: Optional[str] = None
    annual_income: Optional[int] = None
    applicant_category: Optional[str] = None
    document_type: Optional[str] = None
    raw_text: Optional[str] = None

class DocumentItem(BaseModel):
    id: str
    filename: str
    document_type: str
    extracted_data: ExtractedData
    ocr_confidence: Dict[str, float] = Field(default_factory=dict)
    manual_overrides: Dict[str, Any] = Field(default_factory=dict)
    is_synthetic: bool = False

class ManualCorrectionRequest(BaseModel):
    document_id: str
    field_name: str
    corrected_value: Any

class ValidationItem(BaseModel):
    rule_id: str
    document_id: str
    status: str  # VERIFIED | ATTENTION_REQUIRED | UNABLE_TO_VERIFY
    category: str
    reason: str
    extracted_value: Optional[str] = None
    expected_value: Optional[str] = None
    kannada_reason: Optional[str] = None
    rule_provenance: Optional[Dict[str, Any]] = None

class DocumentValidationResponse(BaseModel):
    overall_status: str  # VERIFIED | ATTENTION_REQUIRED | UNABLE_TO_VERIFY
    total_checks: int
    passed_checks: int
    warning_checks: int
    failed_checks: int
    results: List[ValidationItem]
    name_similarity_analysis: Optional[Dict[str, Any]] = None
    readiness_score: int
    score_breakdown: Dict[str, Any]
    disclaimer: str
