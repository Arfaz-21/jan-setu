from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class SchemeRuleProvenance(BaseModel):
    rule_id: str
    scheme_id: str
    document_type: str
    rule_description: str
    source_url: Optional[str] = None
    government_order_or_notification: str
    relevant_clause: str
    validity_years: Optional[int] = None
    last_verified_date: str
    verification_status: str
    severity: str

class SchemeItem(BaseModel):
    id: str
    name: str
    kannada_name: Optional[str] = None
    department: str
    category: str
    target_audience: Optional[str] = None
    description: str
    kannada_description: Optional[str] = None
    income_limit: int
    income_limit_display: Optional[str] = None
    required_documents: List[str]
    application_deadline: Optional[str] = None
    deadline_verified: bool
    official_portal_url: str
    source_of_information: str
    verification_status: str
    type: str
    tags: List[str]
    rules: Optional[List[SchemeRuleProvenance]] = None

class SchemeReadinessRequest(BaseModel):
    scheme_id: str
    uploaded_document_ids: List[str]
    applicant_name: Optional[str] = None
    applicant_category: Optional[str] = None
    annual_income: Optional[int] = None

class SchemeReadinessResponse(BaseModel):
    scheme_id: str
    scheme_name: str
    readiness_score: int
    readiness_status: str
    missing_documents: List[str]
    valid_documents: List[str]
    document_issues: List[Dict[str, Any]]
    name_consistency_status: str
    score_breakdown: Dict[str, Any]
    disclaimer: str
