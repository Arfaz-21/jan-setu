import pytest
from backend.app.services.document_processor import extract_fields_from_text, parse_date_string
from backend.app.core.security import mask_aadhaar_number

def test_aadhaar_masking():
    raw = "My Aadhaar number is 5482 9102 8921."
    masked = mask_aadhaar_number(raw)
    assert "XXXX-XXXX-8921" in masked
    assert "5482" not in masked

def test_date_parser():
    assert parse_date_string("10/01/2019") == "2019-01-10"
    assert parse_date_string("2024-01-09") == "2024-01-09"
    assert parse_date_string("invalid-date") is None

def test_extract_fields_income_cert():
    sample_text = """
    GOVERNMENT OF KARNATAKA
    REVENUE DEPARTMENT - ATALJI JANASNEHI KENDRA (NADAKACHERI)
    INCOME CERTIFICATE (FORM NO. 7/F)
    Certificate Number: RD00382910293
    This is to certify that Sri/Kum MOHAMMED ARFAZ son of Abdul Raheem has an annual family income of Rs. 1,20,000.
    Date of Issue: 10/01/2019
    Valid up to: 09/01/2024
    Issuing Authority: Tahsildar, Bengaluru North Taluk
    """
    fields = extract_fields_from_text(sample_text, "Income_Cert.pdf")
    assert fields["document_type"] == "Income Certificate"
    assert fields["certificate_number"] == "RD00382910293"
    assert "Mohammed" in fields["full_name"]
    assert fields["annual_income"] == 120000
    assert fields["issue_date"] == "2019-01-10"
    assert fields["expiry_date"] == "2024-01-09"
    assert "Tahsildar" in fields["issuing_authority"]
