import json
import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List

SAKALA_SERVICES_FILE = Path(__file__).resolve().parent.parent / "data" / "sakala_services.json"

def load_sakala_services() -> List[Dict[str, Any]]:
    if not SAKALA_SERVICES_FILE.exists():
        return []
    with open(SAKALA_SERVICES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def get_sakala_service_by_id(service_id: str) -> Optional[Dict[str, Any]]:
    for s in load_sakala_services():
        if s.get("service_id") == service_id:
            return s
    return None

def is_karnataka_govt_holiday_or_weekend(d: datetime.date) -> bool:
    """
    Checks if a given date is a Karnataka government non-working day.
    In Karnataka Govt offices:
    - Sunday is a holiday (weekday == 6 in python where Monday is 0).
    - 2nd Saturday and 4th Saturday of the month are holidays.
    """
    # 0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri, 5 = Sat, 6 = Sun
    if d.weekday() == 6:
        return True

    if d.weekday() == 5:
        # Check if it's the 2nd or 4th Saturday
        # Day of month divided by 7:
        day = d.day
        saturday_index = (day - 1) // 7 + 1
        if saturday_index in (2, 4):
            return True

    return False

def add_working_days(start_date: datetime.date, working_days: int) -> datetime.date:
    """
    Calculates the exact deadline date by adding N working days,
    skipping Sundays and 2nd/4th Saturdays.
    """
    curr = start_date
    added = 0
    while added < working_days:
        curr += datetime.timedelta(days=1)
        if not is_karnataka_govt_holiday_or_weekend(curr):
            added += 1
    return curr

def calculate_sakala_deadline(
    submission_date_str: str,
    service_id: Optional[str] = None,
    manual_timeline_days: Optional[int] = None,
    current_date_str: str = "2026-11-07"
) -> Dict[str, Any]:
    """
    Calculates expected deadline and escalation status.
    """
    service = get_sakala_service_by_id(service_id) if service_id else None

    if service:
        stipulated_days = service["stipulated_timeline_days"]
        service_name = service["service_name"]
        timeline_unit = service.get("timeline_unit", "working_days")
        designated_officer = service["designated_officer"]
        first_appellate = service["first_appellate_authority"]
    else:
        stipulated_days = manual_timeline_days or 21
        service_name = "Custom / General Sakala Service"
        timeline_unit = "working_days"
        designated_officer = "Designated Officer (Competent Authority)"
        first_appellate = "First Appellate Authority (Assistant Commissioner / Sub-Divisional Officer)"

    sub_date = datetime.date.fromisoformat(submission_date_str)
    curr_date = datetime.date.fromisoformat(current_date_str)

    deadline_date = add_working_days(sub_date, stipulated_days)
    is_overdue = curr_date > deadline_date

    if is_overdue:
        overdue_days = (curr_date - deadline_date).days
        remaining_days = 0
    else:
        remaining_days = (deadline_date - curr_date).days
        overdue_days = 0

    # Section 8 appeal window: within 30 days from expiry of stipulated timeline
    appeal_window_end = deadline_date + datetime.timedelta(days=30)
    can_escalate = is_overdue

    if is_overdue:
        if curr_date <= appeal_window_end:
            escalation_window_text = (
                f"Eligible for First Appeal under Section 8 of Karnataka Sakala Act, 2011. "
                f"You have until {appeal_window_end.isoformat()} to file an appeal before the First Appellate Authority."
            )
        else:
            escalation_window_text = (
                f"Standard 30-day appeal window expired on {appeal_window_end.isoformat()}. "
                "Condonation of delay may be requested under the proviso to Section 8(1) if sufficient cause is shown."
            )
    else:
        escalation_window_text = f"Application is currently within the statutory service delivery period of {stipulated_days} working days."

    return {
        "service_id": service_id or "CUSTOM",
        "service_name": service_name,
        "submission_date": submission_date_str,
        "stipulated_timeline_days": stipulated_days,
        "timeline_unit": timeline_unit,
        "expected_deadline": deadline_date.isoformat(),
        "is_overdue": is_overdue,
        "remaining_days": remaining_days,
        "overdue_days": overdue_days,
        "designated_officer": designated_officer,
        "first_appellate_authority": first_appellate,
        "escalation_eligible": can_escalate,
        "escalation_window_text": escalation_window_text,
        "status_source": "MANUAL_ENTRY_OR_CONFIG",
        "disclaimer": "Deadlines are calculated based on published Sakala Service schedules excluding Sundays and 2nd/4th Saturdays. Status is computed from user input and does not represent live portal integration."
    }
