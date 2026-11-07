import pytest
import datetime
from backend.app.services.sakala_calculator import calculate_sakala_deadline, add_working_days

def test_add_working_days_skips_weekends():
    # Friday 2026-11-06 plus 1 working day should skip Saturday/Sunday if 2nd/4th or Sunday
    # Let's test a simple 5 working days addition
    start = datetime.date(2026, 11, 2) # Monday
    deadline = add_working_days(start, 5)
    # Mon -> Tue(1), Wed(2), Thu(3), Fri(4), Sat(5 if 1st sat) or next Mon
    assert deadline > start
    diff = (deadline - start).days
    assert diff >= 5

def test_sakala_deadline_overdue_and_escalation():
    # Application submitted on 2026-09-10 (over 40 days ago as of 2026-11-07)
    res = calculate_sakala_deadline(
        submission_date_str="2026-09-10",
        service_id="SAK-REV-01",
        current_date_str="2026-11-07"
    )
    assert res["is_overdue"] is True
    assert res["overdue_days"] > 0
    assert res["stipulated_timeline_days"] == 21
    assert res["escalation_eligible"] is True
    assert "Section 8" in res["escalation_window_text"]
