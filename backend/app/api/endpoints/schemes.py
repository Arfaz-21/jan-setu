import json
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from backend.app.schemas.scheme import SchemeItem, SchemeReadinessRequest, SchemeReadinessResponse
from backend.app.api.endpoints.documents import DOCUMENTS_STORE, get_synthetic_samples
from backend.app.services.rule_engine import load_versioned_rules, validate_single_document
from backend.app.services.name_matching import cross_check_document_names

router = APIRouter(prefix="/schemes", tags=["Schemes"])

SCHEMES_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "schemes.json"

def load_schemes_data() -> List[Dict[str, Any]]:
    if not SCHEMES_FILE.exists():
        return []
    with open(SCHEMES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("", response_model=List[Dict[str, Any]])
def list_schemes(
    scheme_type: Optional[str] = Query(None, description="student or welfare"),
    category: Optional[str] = Query(None),
    max_income: Optional[int] = Query(None),
    search: Optional[str] = Query(None)
):
    """
    Lists Karnataka scholarship and welfare schemes with filter criteria.
    Never fabricates rules or deadlines.
    """
    schemes = load_schemes_data()
    rules = load_versioned_rules()

    # Attach relevant rules to each scheme
    for s in schemes:
        s_rules = [r for r in rules if r.get("scheme_id") in (s["id"], "ALL_SCHEMES")]
        s["rules"] = s_rules

    filtered = schemes
    if scheme_type:
        filtered = [s for s in filtered if s.get("type") == scheme_type]
    if category:
        filtered = [s for s in filtered if category.lower() in s.get("target_audience", "").lower() or category.lower() in s.get("category", "").lower()]
    if max_income:
        filtered = [s for s in filtered if s.get("income_limit", 0) == 0 or s.get("income_limit", 0) >= max_income]
    if search:
        q = search.lower()
        filtered = [
            s for s in filtered
            if q in s.get("name", "").lower() or q in s.get("description", "").lower() or q in s.get("department", "").lower() or q in (s.get("kannada_name") or "").lower()
        ]

    return filtered

@router.get("/{scheme_id}")
def get_scheme_detail(scheme_id: str):
    schemes = load_schemes_data()
    for s in schemes:
        if s["id"] == scheme_id:
            rules = [r for r in load_versioned_rules() if r.get("scheme_id") in (scheme_id, "ALL_SCHEMES")]
            s["rules"] = rules
            return s
    raise HTTPException(status_code=404, detail=f"Scheme with ID '{scheme_id}' not found.")

@router.post("/{scheme_id}/check-readiness")
def check_scheme_readiness(scheme_id: str, payload: SchemeReadinessRequest):
    """
    Evaluates current documents specifically against the selected scheme requirements.
    Calculates specific score and identifies missing or invalid certificates.
    """
    schemes = load_schemes_data()
    scheme = next((s for s in schemes if s["id"] == scheme_id), None)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    if not DOCUMENTS_STORE:
        get_synthetic_samples()

    active_docs = [DOCUMENTS_STORE[did] for did in payload.uploaded_document_ids if did in DOCUMENTS_STORE]
    if not active_docs:
        active_docs = list(DOCUMENTS_STORE.values())

    uploaded_doc_types = [d.get("document_type") for d in active_docs]
    required_docs = scheme.get("required_documents", [])

    missing_docs = []
    valid_docs = []
    document_issues = []

    # Map required docs to uploaded docs
    for req in required_docs:
        matched = False
        for utype in uploaded_doc_types:
            if utype and (req.lower() in utype.lower() or utype.lower() in req.lower()):
                matched = True
                valid_docs.append(req)
                break
        if not matched:
            missing_docs.append(req)

    # Validate uploaded documents
    rules = load_versioned_rules()
    for d in active_docs:
        val_res = validate_single_document(
            doc_id=d["id"],
            document_type=d.get("document_type", ""),
            extracted_data=d.get("extracted_data", {}),
            rules=rules
        )
        for vr in val_res:
            if vr["status"] != "VERIFIED":
                document_issues.append({
                    "document_type": d.get("document_type"),
                    "issue": vr["reason"],
                    "kannada_issue": vr.get("kannada_reason"),
                    "severity": "CRITICAL" if vr.get("category") == "EXPIRY" else "WARNING"
                })

    # Income check
    if scheme.get("income_limit", 0) > 0 and payload.annual_income:
        if payload.annual_income > scheme["income_limit"]:
            document_issues.append({
                "document_type": "Income Certificate",
                "issue": f"Annual income of Rs. {payload.annual_income:,} exceeds the scheme limit of Rs. {scheme['income_limit']:,}.",
                "kannada_issue": "ನಿಮ್ಮ ಕುಟುಂಬದ ವಾರ್ಷಿಕ ಆದಾಯವು ನಿಗದಿಪಡಿಸಿದ ಮಿತಿಗಿಂತ ಹೆಚ್ಚಾಗಿದೆ.",
                "severity": "CRITICAL"
            })

    # Name check
    name_check = cross_check_document_names(active_docs)
    if name_check["status"] != "VERIFIED":
        document_issues.append({
            "document_type": "Identity / Caste",
            "issue": name_check.get("message", "Potential name variation across documents"),
            "kannada_issue": "ದಾಖಲೆಗಳಲ್ಲಿ ಹೆಸರಿನ ಅಕ್ಷರ ವ್ಯತ್ಯಾಸ ಕಂಡುಬಂದಿದೆ.",
            "severity": "WARNING"
        })

    # Calculate scheme readiness score
    doc_completion_pct = (len(valid_docs) / max(1, len(required_docs))) * 45
    critical_issues = sum(1 for iss in document_issues if iss["severity"] == "CRITICAL")
    warning_issues = sum(1 for iss in document_issues if iss["severity"] == "WARNING")

    penalty = (critical_issues * 25) + (warning_issues * 10)
    final_score = max(10, min(100, round(doc_completion_pct + 55 - penalty)))

    status = "READY" if final_score >= 85 and not critical_issues else ("NEEDS_ATTENTION" if final_score >= 50 else "NOT_READY")

    return {
        "scheme_id": scheme["id"],
        "scheme_name": scheme["name"],
        "readiness_score": final_score,
        "readiness_status": status,
        "missing_documents": missing_docs,
        "valid_documents": valid_docs,
        "document_issues": document_issues,
        "name_consistency_status": name_check["status"],
        "score_breakdown": {
            "required_docs_match": f"{len(valid_docs)}/{len(required_docs)} documents verified",
            "critical_blockers": critical_issues,
            "minor_warnings": warning_issues
        },
        "disclaimer": "Readiness assessment is based on uploaded demonstration certificates and published scheme rules. Official approval is subject to competent departmental verification on the government portal."
    }
