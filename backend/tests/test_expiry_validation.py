import pytest
from backend.app.services.rule_engine import validate_single_document, load_versioned_rules

def test_expired_income_certificate():
    rules = load_versioned_rules()
    data = {
        "full_name": "Mohammed Arfaz",
        "certificate_number": "RD00382910293",
        "issue_date": "2019-01-10",
        "expiry_date": "2024-01-09",
        "issuing_authority": "Tahsildar"
    }
    # Validate against November 2026
    results = validate_single_document("doc-1", "Income Certificate", data, rules, current_date_str="2026-11-07")
    expiry_check = next((r for r in results if r["category"] == "EXPIRY"), None)
    assert expiry_check is not None
    assert expiry_check["status"] == "ATTENTION_REQUIRED"
    assert "expired" in expiry_check["reason"].lower()

def test_valid_income_certificate():
    rules = load_versioned_rules()
    data = {
        "full_name": "Suresh Gowda",
        "certificate_number": "RD00492817290",
        "issue_date": "2024-05-01",
        "expiry_date": "2029-04-30",
        "issuing_authority": "Tahsildar"
    }
    results = validate_single_document("doc-2", "Income Certificate", data, rules, current_date_str="2026-11-07")
    expiry_check = next((r for r in results if r["category"] == "EXPIRY"), None)
    assert expiry_check is not None
    assert expiry_check["status"] == "VERIFIED"
