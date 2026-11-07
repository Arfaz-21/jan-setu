import os
import pytest
from backend.app.services.appeal_generator import build_appeal_draft, MANDATORY_DISCLAIMER

def test_appeal_draft_generation():
    mock_payload = {
        "gsc_number": "REV/2026/0482910",
        "service_id": "SAK-REV-01",
        "service_name": "Issue of Income Certificate (Form 7/F)",
        "applicant_name": "Mohammed Arfaz",
        "applicant_address": "RT Nagar, Bengaluru North",
        "submission_date": "2026-09-10",
        "deadline_date": "2026-10-06",
        "designated_officer": "Tahsildar, Bengaluru North",
        "first_appellate_authority": "Assistant Commissioner, Bengaluru North Sub-Division",
        "citizen_facts": "Submitted form on 10th Sept. Over 21 working days passed without issuance.",
        "compensation_claimed": True,
        "disclaimer_ack": True
    }
    draft = build_appeal_draft(mock_payload)
    assert draft["pdf_filename"].endswith(".pdf")
    assert "/api/appeals/download/" in draft["download_url"]
    assert "Section 8" in draft["markdown_preview"]
    assert MANDATORY_DISCLAIMER in draft["disclaimer"]
    # Check that PDF file actually exists on disk
    from backend.app.services.appeal_generator import APPEALS_OUTPUT_DIR
    pdf_path = APPEALS_OUTPUT_DIR / draft["pdf_filename"]
    assert pdf_path.exists()
    assert pdf_path.stat().st_size > 1000  # valid PDF bytes
