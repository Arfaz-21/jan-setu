import json
import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from backend.app.services.name_matching import cross_check_document_names, compare_names

RULES_FILE = Path(__file__).resolve().parent.parent / "data" / "scheme_rules.json"

def load_versioned_rules() -> List[Dict[str, Any]]:
    """Loads all versioned validation rules from JSON configuration."""
    if not RULES_FILE.exists():
        return []
    with open(RULES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def get_rule_by_id(rule_id: str) -> Optional[Dict[str, Any]]:
    rules = load_versioned_rules()
    for r in rules:
        if r.get("rule_id") == rule_id:
            return r
    return None

def validate_single_document(
    doc_id: str,
    document_type: str,
    extracted_data: Dict[str, Any],
    rules: List[Dict[str, Any]],
    current_date_str: str = "2026-11-07"
) -> List[Dict[str, Any]]:
    """
    Validates a single document against applicable versioned rules.
    Outputs status: VERIFIED | ATTENTION_REQUIRED | UNABLE_TO_VERIFY.
    """
    results = []
    curr_date = datetime.date.fromisoformat(current_date_str)

    # 1. Mandatory field checks
    name = extracted_data.get("full_name")
    cert_no = extracted_data.get("certificate_number")
    issue_date = extracted_data.get("issue_date")
    expiry_date = extracted_data.get("expiry_date")

    # Check 1: Mandatory Fields
    if not cert_no or not name:
        results.append({
            "rule_id": "RULE-MANDATORY-00",
            "document_id": doc_id,
            "status": "ATTENTION_REQUIRED",
            "category": "MANDATORY_FIELDS",
            "reason": f"Mandatory fields missing: {'Name ' if not name else ''}{'Certificate Number' if not cert_no else ''}.",
            "kannada_reason": "ಅಗತ್ಯವಿರುವ ಪ್ರಮಾಣಪತ್ರ ಸಂಖ್ಯೆ ಅಥವಾ ಹೆಸರು ಪತ್ತೆಯಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.",
            "extracted_value": f"Name: {name or 'Missing'}, Cert: {cert_no or 'Missing'}",
            "expected_value": "Complete Name and Valid Registration Number",
            "rule_provenance": {
                "rule_id": "RULE-MANDATORY-00",
                "government_order_or_notification": "Govt of Karnataka E-Governance Circular 2022",
                "relevant_clause": "Standard Form Data Validation Protocol",
                "verification_status": "DEMO_VERIFIED"
            }
        })
    else:
        results.append({
            "rule_id": "RULE-MANDATORY-00",
            "document_id": doc_id,
            "status": "VERIFIED",
            "category": "MANDATORY_FIELDS",
            "reason": "All critical identity fields (Name, Certificate Number) successfully extracted.",
            "kannada_reason": "ಎಲ್ಲಾ ಅಗತ್ಯ ವಿವರಗಳು ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟಿವೆ.",
            "extracted_value": f"{name} ({cert_no})",
            "expected_value": "Valid Record",
            "rule_provenance": {
                "rule_id": "RULE-MANDATORY-00",
                "government_order_or_notification": "Govt of Karnataka E-Governance Circular 2022",
                "relevant_clause": "Standard Form Data Validation Protocol",
                "verification_status": "DEMO_VERIFIED"
            }
        })

    # Check 2: Expiry & Validity Rules
    if document_type == "Income Certificate":
        inc_rule = get_rule_by_id("RULE-INC-VAL-01") or {}
        if expiry_date:
            try:
                exp_dt = datetime.date.fromisoformat(expiry_date)
                if exp_dt < curr_date:
                    days_expired = (curr_date - exp_dt).days
                    results.append({
                        "rule_id": "RULE-INC-VAL-01",
                        "document_id": doc_id,
                        "status": "ATTENTION_REQUIRED",
                        "category": "EXPIRY",
                        "reason": f"Income Certificate expired on {expiry_date} (approx {days_expired} days ago). Karnataka Form 7/F certificates are valid for 5 years.",
                        "kannada_reason": "ನಿಮ್ಮ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರದ ಅವಧಿ ಮುಗಿದಿರಬಹುದು. ದಯವಿಟ್ಟು ನಾಡಕಚೇರಿಯಲ್ಲಿ ಹೊಸ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಪರಿಶೀಲಿಸಿ.",
                        "extracted_value": expiry_date,
                        "expected_value": f"Valid beyond {current_date_str}",
                        "rule_provenance": inc_rule
                    })
                else:
                    results.append({
                        "rule_id": "RULE-INC-VAL-01",
                        "document_id": doc_id,
                        "status": "VERIFIED",
                        "category": "EXPIRY",
                        "reason": f"Income Certificate is active and valid until {expiry_date}.",
                        "kannada_reason": "ನಿಮ್ಮ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರವು ಚಾಲ್ತಿಯಲ್ಲಿದೆ.",
                        "extracted_value": expiry_date,
                        "expected_value": f"Valid beyond {current_date_str}",
                        "rule_provenance": inc_rule
                    })
            except ValueError:
                results.append({
                    "rule_id": "RULE-INC-VAL-01",
                    "document_id": doc_id,
                    "status": "UNABLE_TO_VERIFY",
                    "category": "EXPIRY",
                    "reason": f"Could not parse expiry date '{expiry_date}'.",
                    "kannada_reason": "ಪ್ರಮಾಣಪತ್ರದ ಅವಧಿ ದಿನಾಂಕವನ್ನು ಖಚಿತಪಡಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ.",
                    "extracted_value": expiry_date,
                    "expected_value": "YYYY-MM-DD",
                    "rule_provenance": inc_rule
                })
        elif issue_date:
            try:
                iss_dt = datetime.date.fromisoformat(issue_date)
                approx_exp = iss_dt.replace(year=iss_dt.year + 5)
                if approx_exp < curr_date:
                    results.append({
                        "rule_id": "RULE-INC-VAL-01",
                        "document_id": doc_id,
                        "status": "ATTENTION_REQUIRED",
                        "category": "EXPIRY",
                        "reason": f"Issued on {issue_date}. Income certificates in Karnataka are valid for 5 years and expired around {approx_exp.isoformat()}.",
                        "kannada_reason": "ನಿಮ್ಮ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರದ ೫ ವರ್ಷಗಳ ಅವಧಿ ಮುಗಿದಿದೆ.",
                        "extracted_value": issue_date,
                        "expected_value": f"Issued after {curr_date.replace(year=curr_date.year - 5).isoformat()}",
                        "rule_provenance": inc_rule
                    })
                else:
                    results.append({
                        "rule_id": "RULE-INC-VAL-01",
                        "document_id": doc_id,
                        "status": "VERIFIED",
                        "category": "EXPIRY",
                        "reason": f"Certificate issued on {issue_date} is within its 5-year validity window (valid till ~{approx_exp.isoformat()}).",
                        "kannada_reason": "ಪ್ರಮಾಣಪತ್ರವು ೫ ವರ್ಷಗಳ ಮಾನ್ಯತೆಯ ಅವಧಿಯಲ್ಲಿದೆ.",
                        "extracted_value": issue_date,
                        "expected_value": "Within 5 years",
                        "rule_provenance": inc_rule
                    })
            except Exception:
                pass

    elif document_type == "Caste Certificate":
        scst_rule = get_rule_by_id("RULE-SCST-VAL-06") or {}
        # Nadakacheri barcode check
        cst_bar_rule = get_rule_by_id("RULE-CST-RD-03") or {}
        if cert_no and cert_no.startswith("RD"):
            results.append({
                "rule_id": "RULE-CST-RD-03",
                "document_id": doc_id,
                "status": "VERIFIED",
                "category": "FORMAT",
                "reason": f"Valid Karnataka Nadakacheri RD barcode format detected ({cert_no}).",
                "kannada_reason": "ಮಾನ್ಯವಾದ ನಾಡಕಚೇರಿ ಆರ್.ಡಿ ಸಂಖ್ಯೆ ಪತ್ತೆಯಾಗಿದೆ.",
                "extracted_value": cert_no,
                "expected_value": "RDxxxxxxxxxxx",
                "rule_provenance": cst_bar_rule
            })
        else:
            results.append({
                "rule_id": "RULE-CST-RD-03",
                "document_id": doc_id,
                "status": "ATTENTION_REQUIRED",
                "category": "FORMAT",
                "reason": "Certificate number does not appear to follow standard Nadakacheri RD format (e.g., RD00382910293).",
                "kannada_reason": "ಪ್ರಮಾಣಪತ್ರ ಸಂಖ್ಯೆ ನಾಡಕಚೇರಿ ಆರ್.ಡಿ ಮಾದರಿಯೊಂದಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.",
                "extracted_value": cert_no or "None",
                "expected_value": "RDxxxxxxxxxxx",
                "rule_provenance": cst_bar_rule
            })

    elif document_type == "Aadhaar Card":
        adh_rule = get_rule_by_id("RULE-ADH-MSK-05") or {}
        if cert_no and ("XXXX" in cert_no or "xxxx" in cert_no):
            results.append({
                "rule_id": "RULE-ADH-MSK-05",
                "document_id": doc_id,
                "status": "VERIFIED",
                "category": "PRIVACY",
                "reason": f"Aadhaar number is properly masked ({cert_no}) in accordance with UIDAI privacy guidelines.",
                "kannada_reason": "ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ನಿಯಮಾನುಸಾರ ರಕ್ಷಿಸಲಾಗಿದೆ.",
                "extracted_value": cert_no,
                "expected_value": "XXXX-XXXX-NNNN",
                "rule_provenance": adh_rule
            })

    return results

def calculate_readiness_score(
    validation_results: List[Dict[str, Any]],
    documents: List[Dict[str, Any]],
    required_docs_count: int = 3
) -> Dict[str, Any]:
    """
    Calculates the composite Application Readiness Score (0 - 100%)
    from actual deterministic checks:
    - Required documents uploaded (max 35 pts)
    - Certificate validity (not expired) (max 30 pts)
    - Name consistency (max 20 pts)
    - Mandatory fields & format checks (max 15 pts)

    Clearly explains what each component contributes.
    """
    # 1. Document Coverage
    doc_count = len(documents)
    coverage_ratio = min(1.0, doc_count / max(1, required_docs_count))
    coverage_score = round(coverage_ratio * 35)

    # 2. Validity (Expiry)
    expiry_checks = [r for r in validation_results if r.get("category") == "EXPIRY"]
    if not expiry_checks:
        validity_score = 30  # No expiry warnings
    else:
        passed_exp = sum(1 for r in expiry_checks if r.get("status") == "VERIFIED")
        validity_score = round((passed_exp / len(expiry_checks)) * 30)

    # 3. Name Consistency
    name_check = cross_check_document_names(documents)
    if name_check["status"] == "VERIFIED":
        name_score = 20
    elif name_check["status"] == "ATTENTION_REQUIRED":
        # Check minimum score among comparisons
        min_comp_score = 75
        if name_check.get("comparisons"):
            min_comp_score = min([c.get("score", 75) for c in name_check["comparisons"]])
        name_score = round((min_comp_score / 100) * 20)
    else:
        name_score = 10

    # 4. Mandatory Fields & Format
    format_checks = [r for r in validation_results if r.get("category") in ("MANDATORY_FIELDS", "FORMAT", "PRIVACY")]
    if not format_checks:
        format_score = 15
    else:
        passed_fmt = sum(1 for r in format_checks if r.get("status") == "VERIFIED")
        format_score = round((passed_fmt / len(format_checks)) * 15)

    total_score = max(0, min(100, coverage_score + validity_score + name_score + format_score))

    return {
        "score": total_score,
        "breakdown": {
            "document_coverage": {
                "score": coverage_score,
                "max": 35,
                "detail": f"{doc_count} of {required_docs_count} key documents uploaded"
            },
            "certificate_validity": {
                "score": validity_score,
                "max": 30,
                "detail": "Verified active vs expired government certificates"
            },
            "name_consistency": {
                "score": name_score,
                "max": 20,
                "detail": name_check.get("message", "Name matching verification")
            },
            "format_and_integrity": {
                "score": format_score,
                "max": 15,
                "detail": "Nadakacheri barcode, masked Aadhaar, and essential metadata"
            }
        },
        "name_check_details": name_check,
        "disclaimer": "The Application Readiness Score reflects automated checks of document completeness, validity dates, and name consistency. It does NOT guarantee scheme eligibility or approval by the competent government authority."
    }
