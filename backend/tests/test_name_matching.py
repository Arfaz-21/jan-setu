import pytest
from backend.app.services.name_matching import compare_names, normalize_name, cross_check_document_names

def test_exact_name_match():
    res = compare_names("Mohammed Arfaz", "Mohammed Arfaz")
    assert res["is_exact"] is True
    assert res["score"] == 100.0
    assert res["status"] == "VERIFIED"

def test_abbreviation_name_variation():
    # Mohd vs Mohammed
    res = compare_names("Mohammed Arfaz", "Mohd Arfaz")
    assert res["is_acceptable_match"] is True
    assert res["status"] in ("VERIFIED", "ATTENTION_REQUIRED")
    assert "Mohammed" in res["explanation"] or "Mohd" in res["explanation"]

def test_different_names():
    res = compare_names("Mohammed Arfaz", "Suresh Kumar")
    assert res["is_acceptable_match"] is False
    assert res["status"] == "ATTENTION_REQUIRED"
    assert res["score"] < 50

def test_cross_check_multiple_docs():
    docs = [
        {"document_type": "Income Certificate", "full_name": "Mohammed Arfaz"},
        {"document_type": "Caste Certificate", "full_name": "Mohd Arfaz"},
        {"document_type": "Aadhaar Card", "full_name": "Mohammed Arfaz"}
    ]
    check = cross_check_document_names(docs)
    assert len(check["comparisons"]) == 3
    # Attention required flagged because Mohd vs Mohammed
    assert check["status"] in ("VERIFIED", "ATTENTION_REQUIRED")
