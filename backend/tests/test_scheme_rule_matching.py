import pytest
from backend.app.services.rule_engine import calculate_readiness_score

def test_readiness_score_calculation():
    sample_docs = [
        {
            "id": "doc-1",
            "document_type": "Income Certificate",
            "extracted_data": {
                "full_name": "Mohammed Arfaz",
                "certificate_number": "RD00382910293",
                "issue_date": "2019-01-10",
                "expiry_date": "2024-01-09"
            }
        },
        {
            "id": "doc-2",
            "document_type": "Caste Certificate",
            "extracted_data": {
                "full_name": "Mohd Arfaz",
                "certificate_number": "RD00192847291"
            }
        },
        {
            "id": "doc-3",
            "document_type": "Aadhaar Card",
            "extracted_data": {
                "full_name": "Mohammed Arfaz",
                "certificate_number": "XXXX-XXXX-8921"
            }
        }
    ]

    mock_validations = [
        {"category": "MANDATORY_FIELDS", "status": "VERIFIED"},
        {"category": "EXPIRY", "status": "ATTENTION_REQUIRED"},  # Expired income certificate
        {"category": "FORMAT", "status": "VERIFIED"},
        {"category": "PRIVACY", "status": "VERIFIED"}
    ]

    score_result = calculate_readiness_score(mock_validations, sample_docs, required_docs_count=3)
    score = score_result["score"]
    # Should reflect penalties for expired cert and slight name variation, falling in realistic 60-80% zone
    assert 55 <= score <= 85
    assert "breakdown" in score_result
    assert score_result["breakdown"]["document_coverage"]["score"] == 35
    assert "disclaimer" in score_result
