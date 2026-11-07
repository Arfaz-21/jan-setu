import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from backend.app.services.sakala_calculator import (
    load_sakala_services, calculate_sakala_deadline, get_sakala_service_by_id
)
from backend.app.schemas.sakala import (
    SakalaServiceItem, DeadlineCalculateRequest, DeadlineCalculateResponse,
    ApplicationCreateRequest, ApplicationItem
)

router = APIRouter(prefix="/sakala", tags=["Sakala"])

SAMPLES_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "sample_documents.json"

# In-memory application tracking cache
APPLICATIONS_STORE: List[Dict[str, Any]] = []

def init_sample_applications():
    if not APPLICATIONS_STORE and SAMPLES_FILE.exists():
        with open(SAMPLES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            sample_app = data.get("sample_sakala_application")
            if sample_app:
                calc = calculate_sakala_deadline(
                    submission_date_str=sample_app["submission_date"],
                    service_id=sample_app["service_id"]
                )
                APPLICATIONS_STORE.append({
                    "id": 1,
                    "gsc_number": sample_app["gsc_number"],
                    "service_id": sample_app["service_id"],
                    "service_name": sample_app["service_name"],
                    "applicant_name": sample_app["applicant_name"],
                    "submission_date": sample_app["submission_date"],
                    "stipulated_days": calc["stipulated_timeline_days"],
                    "expected_deadline": calc["expected_deadline"],
                    "is_overdue": calc["is_overdue"],
                    "days_remaining_or_overdue": calc["overdue_days"] if calc["is_overdue"] else calc["remaining_days"],
                    "status": sample_app["status"],
                    "status_source": "MANUAL_ENTRY",
                    "office_name": sample_app["office_name"],
                    "designated_officer": calc["designated_officer"],
                    "first_appellate_authority": calc["first_appellate_authority"]
                })

@router.get("/services")
def list_sakala_services():
    """Lists configured Karnataka Sakala services with verified timelines and legal sources."""
    return load_sakala_services()

@router.post("/calculate-deadline", response_model=DeadlineCalculateResponse)
def calculate_deadline(payload: DeadlineCalculateRequest):
    """
    Computes statutory deadline skipping non-working days (Sundays and 2nd/4th Saturdays).
    Calculates overdue days and Section 8 appeal window.
    """
    res = calculate_sakala_deadline(
        submission_date_str=payload.submission_date,
        service_id=payload.service_id,
        manual_timeline_days=payload.manual_timeline_days
    )
    return res

@router.get("/applications")
def list_applications():
    """Lists tracked citizen Sakala applications."""
    init_sample_applications()
    return APPLICATIONS_STORE

@router.post("/applications")
def add_application(payload: ApplicationCreateRequest):
    """
    Registers a new Sakala application for timeline tracking and escalation readiness.
    Clearly marks status as manual citizen entry.
    """
    init_sample_applications()
    calc = calculate_sakala_deadline(
        submission_date_str=payload.submission_date,
        service_id=payload.service_id
    )

    new_app = {
        "id": len(APPLICATIONS_STORE) + 1,
        "gsc_number": payload.gsc_number.strip().upper(),
        "service_id": payload.service_id,
        "service_name": payload.service_name,
        "applicant_name": payload.applicant_name,
        "submission_date": payload.submission_date,
        "stipulated_days": calc["stipulated_timeline_days"],
        "expected_deadline": calc["expected_deadline"],
        "is_overdue": calc["is_overdue"],
        "days_remaining_or_overdue": calc["overdue_days"] if calc["is_overdue"] else calc["remaining_days"],
        "status": payload.status or "PENDING",
        "status_source": payload.status_source or "MANUAL_ENTRY",
        "office_name": payload.office_name or "Taluk Office / Nadakacheri",
        "designated_officer": calc["designated_officer"],
        "first_appellate_authority": calc["first_appellate_authority"]
    }

    # Upsert by GSC number
    for idx, existing in enumerate(APPLICATIONS_STORE):
        if existing["gsc_number"] == new_app["gsc_number"]:
            APPLICATIONS_STORE[idx] = new_app
            return {"success": True, "application": new_app, "updated": True}

    APPLICATIONS_STORE.append(new_app)
    return {"success": True, "application": new_app, "updated": False}
