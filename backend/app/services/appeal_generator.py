import os
import json
import uuid
import datetime
from pathlib import Path
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from backend.app.core.config import settings

LEGAL_PROVISIONS_FILE = Path(__file__).resolve().parent.parent / "data" / "legal_provisions.json"
APPEALS_OUTPUT_DIR = settings.TEMP_UPLOAD_DIR / "appeal_drafts"
APPEALS_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

MANDATORY_DISCLAIMER = (
    "This is a draft for informational purposes, not legal advice. "
    "Please verify the applicable provision, competent authority and filing deadline before submission."
)

def load_verified_provisions() -> List[Dict[str, Any]]:
    if not LEGAL_PROVISIONS_FILE.exists():
        return []
    with open(LEGAL_PROVISIONS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def generate_appeal_markdown(data: Dict[str, Any], provisions: List[Dict[str, Any]]) -> str:
    """Generates clean readable markdown representation of the statutory appeal."""
    verified_citations = "\n".join([
        f"- **{p['provision_number']}** ({p['act_name']}): *{p['title']}* [{p['verification_status']}]\n  \"{p['exact_verified_text']}\""
        for p in provisions if p.get("verification_status") == "VERIFIED"
    ])

    return f"""# MEMORANDUM OF FIRST APPEAL
**Under Section 8 of The Karnataka Guarantee of Services to Citizens Act, 2011 (Karnataka Act No. 01 of 2012)**

---

### BEFORE THE COMPETENT OFFICER / FIRST APPELLATE AUTHORITY
**To:** {data.get('first_appellate_authority', 'Assistant Commissioner')}  
**Department:** Government of Karnataka  

---

### 1. APPELLANT PARTICULARS
- **Name of Appellant:** {data.get('applicant_name')}
- **Address for Communication:** {data.get('applicant_address', 'Bengaluru, Karnataka')}
- **Contact:** Mobile / Digital ID on record

---

### 2. PARTICULARS OF THE DEFAULTING DESIGNATED OFFICER
- **Designated Officer:** {data.get('designated_officer', 'Tahsildar / Competent Designated Officer')}
- **Office / Jurisdiction:** Nadakacheri / Taluk Administrative Center

---

### 3. PARTICULARS OF SAKALA APPLICATION
- **GSC (Guarantee of Services Citizen) Number:** `{data.get('gsc_number')}`
- **Name of Citizen Service:** {data.get('service_name')}
- **Date of Application Submission:** {data.get('submission_date')}
- **Stipulated Statutory Deadline:** {data.get('deadline_date')}
- **Current Action / Status:** Overdue without statutory disposal

---

### 4. STATEMENT OF RELEVANT FACTS
{data.get('citizen_facts', 'The applicant duly submitted all prescribed documentation and complied with requisite portal procedures. Despite the expiry of the stipulated period, the Designated Officer has failed to deliver the service.')}

---

### 5. RELEVANT STATUTORY PROVISIONS
{verified_citations}

---

### 6. GROUNDS OF APPEAL
1. **Statutory Default:** Under Section 5(2) of the Act, the Designated Officer is bound to either provide the service or communicate an order of rejection within the stipulated time limit.
2. **Right to Time-Bound Service:** The applicant holds a legal entitlement under Section 5(1) to receive citizen services without arbitrary delay.
3. **Absence of Reasonable Cause:** The delay is not attributable to any omission or non-compliance by the appellant.

---

### 7. RELIEF PRAYED FOR
The Appellant respectfully prays that this Appellate Authority may be pleased to:
a) Direct the Designated Officer to immediately sanction and deliver the requested service: **{data.get('service_name')}**;
b) Award compensatory costs to the appellant under Section 13(1) of the Act at Rs. 20/- per day of delay up to statutory ceiling;
c) Initiate appropriate disciplinary proceedings if delay was willful and without reasonable cause.

---

### 8. VERIFICATION
I, **{data.get('applicant_name')}**, do hereby state and verify that the contents stated in paragraphs 1 to 7 are true and correct to the best of my knowledge and belief.

**Date:** {datetime.date.today().isoformat()}  
**Place:** Karnataka  
*(Signature / Digital Authentication of Appellant)*

---

> **STATUTORY DISCLAIMER:**  
> {MANDATORY_DISCLAIMER}
"""

def generate_appeal_pdf(data: Dict[str, Any], provisions: List[Dict[str, Any]]) -> str:
    """
    Generates a formal, printable PDF document using ReportLab.
    """
    filename = f"Sakala_Appeal_{data.get('gsc_number', 'draft').replace('/', '_')}_{uuid.uuid4().hex[:6]}.pdf"
    pdf_path = APPEALS_OUTPUT_DIR / filename

    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom GovTech styles
    title_style = ParagraphStyle(
        'GovTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor('#0f2942'),
        alignment=1, # Center
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'GovSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#334155'),
        alignment=1,
        spaceAfter=12
    )

    heading_style = ParagraphStyle(
        'GovSection',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0f2942'),
        spaceBefore=10,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'GovBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#1e293b')
    )

    disclaimer_style = ParagraphStyle(
        'GovDisclaimer',
        parent=styles['Italic'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#b91c1c'),
        alignment=1
    )

    story = []

    # Header
    story.append(Paragraph("MEMORANDUM OF FIRST APPEAL", title_style))
    story.append(Paragraph("Under Section 8 of The Karnataka Guarantee of Services to Citizens Act, 2011", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceBefore=2, spaceAfter=8))

    # Addressed To
    to_text = f"<b>TO:</b><br/>The First Appellate Authority / {data.get('first_appellate_authority', 'Assistant Commissioner')}<br/>Sub-Division, Government of Karnataka"
    story.append(Paragraph(to_text, body_style))
    story.append(Spacer(1, 10))

    # Application particulars table
    table_data = [
        [Paragraph("<b>GSC Number:</b>", body_style), Paragraph(str(data.get('gsc_number')), body_style)],
        [Paragraph("<b>Service Applied For:</b>", body_style), Paragraph(str(data.get('service_name')), body_style)],
        [Paragraph("<b>Appellant Name:</b>", body_style), Paragraph(str(data.get('applicant_name')), body_style)],
        [Paragraph("<b>Designated Officer:</b>", body_style), Paragraph(str(data.get('designated_officer')), body_style)],
        [Paragraph("<b>Submission Date:</b>", body_style), Paragraph(str(data.get('submission_date')), body_style)],
        [Paragraph("<b>Statutory Deadline:</b>", body_style), Paragraph(str(data.get('deadline_date')), body_style)],
    ]
    t = Table(table_data, colWidths=[1.8 * inch, 4.8 * inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    # Facts
    story.append(Paragraph("<b>1. STATEMENT OF FACTS</b>", heading_style))
    facts = data.get('citizen_facts', 'The applicant submitted the application along with all prescribed documentation. No response or service has been received within the stipulated period.')
    story.append(Paragraph(facts, body_style))
    story.append(Spacer(1, 6))

    # Statutory Provisions
    story.append(Paragraph("<b>2. STATUTORY PROVISIONS RELIED UPON</b>", heading_style))
    for p in provisions:
        if p.get("verification_status") == "VERIFIED":
            p_text = f"• <b>{p['provision_number']} ({p['title']}):</b> {p['exact_verified_text']}"
            story.append(Paragraph(p_text, body_style))
            story.append(Spacer(1, 3))

    # Reliefs
    story.append(Paragraph("<b>3. RELIEF PRAYED FOR</b>", heading_style))
    relief_items = (
        "1. Immediate direction to the Designated Officer to complete and deliver the requested service.<br/>"
        "2. Award of compensatory cost under Section 13(1) of the Act for each day of unjustified delay.<br/>"
        "3. Any other relief deemed fit in the interest of citizen rights and administrative transparency."
    )
    story.append(Paragraph(relief_items, body_style))
    story.append(Spacer(1, 10))

    # Verification & Signature
    verif_text = (
        f"I, <b>{data.get('applicant_name')}</b>, hereby verify that the facts stated above are true to my knowledge.<br/><br/>"
        f"<b>Date:</b> {datetime.date.today().isoformat()}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Signature / Verification:</b> _____________________"
    )
    story.append(Paragraph(verif_text, body_style))
    story.append(Spacer(1, 14))

    # Mandatory Disclaimer Box
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#f87171'), spaceBefore=4, spaceAfter=4))
    story.append(Paragraph(f"<b>IMPORTANT NOTICE:</b> {MANDATORY_DISCLAIMER}", disclaimer_style))

    doc.build(story)
    return filename

def build_appeal_draft(data: Dict[str, Any]) -> Dict[str, Any]:
    provisions = load_verified_provisions()
    # Filter out UNVERIFIED provisions from primary legal citation body
    verified_only = [p for p in provisions if p.get("verification_status") == "VERIFIED"]

    md_content = generate_appeal_markdown(data, verified_only)
    pdf_filename = generate_appeal_pdf(data, verified_only)

    return {
        "pdf_filename": pdf_filename,
        "download_url": f"/api/appeals/download/{pdf_filename}",
        "markdown_preview": md_content,
        "statutory_citations": [
            {
                "provision": p["provision_number"],
                "title": p["title"],
                "status": p["verification_status"],
                "amendment": p["amendment_reference"]
            }
            for p in verified_only
        ],
        "disclaimer": MANDATORY_DISCLAIMER,
        "instructions": [
            "Review the generated draft and verify that the facts and dates accurately reflect your application.",
            "Download and print the appeal document, sign it, and attach your original GSC acknowledgement receipt.",
            "Submit the appeal to the office of the First Appellate Authority (e.g. Assistant Commissioner) in person or through the Karnataka Seva Sindhu / Sakala Appeals portal.",
            "Obtain an official dated acknowledgement of receipt for your appeal."
        ]
    }
