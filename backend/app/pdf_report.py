import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle,
    Paragraph, Spacer
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from io import BytesIO
from datetime import datetime


def generate_patient_pdf(patient_data, vitals_data):
    """
    patient_data: dict with keys - id, name, age, gender, phone, email,
                  condition, notes, date
    vitals_data: dict with keys - heartRate, bp, temp, oxygen, weight
    Return: BytesIO buffer
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    elements = []

    # ---- HEADER ----
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        fontSize=24,
        textColor=colors.HexColor("#1e3a8a"),
        spaceAfter=4,
    )
    elements.append(Paragraph("BioMonitor", title_style))

    sub_style = ParagraphStyle(
        "SubStyle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=8,
    )
    elements.append(Paragraph(
        "Clinical Intelligence — Patient Medical Report", sub_style
    ))

    # Separator line
    line_style = ParagraphStyle(
        "Line",
        parent=styles["Normal"],
        fontSize=14,
        textColor=colors.HexColor("#3b82f6"),
        spaceAfter=12,
    )
    elements.append(Paragraph(
        "━" * 60, line_style
    ))

    # Generated date
    gen_style = ParagraphStyle(
        "GenStyle",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#94a3b8"),
        spaceAfter=20,
    )
    elements.append(Paragraph(
        "<b>Generated:</b> " + datetime.now().strftime("%d %B %Y, %I:%M %p"),
        gen_style
    ))

    # ---- PATIENT INFO TABLE ----
    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=colors.HexColor("#1e3a8a"),
        spaceBefore=10,
        spaceAfter=10,
    )
    elements.append(Paragraph("Patient Information", heading_style))

    pid = patient_data.get("id", "")
    p_name = patient_data.get("name", "")
    p_age = patient_data.get("age", "")
    p_gender = patient_data.get("gender", "")
    p_phone = patient_data.get("phone", "")
    p_email = patient_data.get("email", "")
    p_condition = patient_data.get("condition", "General")
    p_notes = patient_data.get("notes", "No notes")
    p_date = patient_data.get("date", "")

    patient_rows = [
        ["Field", "Value"],
        ["Patient ID", "P-" + str(pid).zfill(4)],
        ["Full Name", str(p_name)],
        ["Age", str(p_age) + " years"],
        ["Gender", str(p_gender).capitalize()],
        ["Phone", str(p_phone)],
        ["Email", str(p_email) if p_email else "N/A"],
        ["Condition", str(p_condition) if p_condition else "General"],
        ["Date Added", str(p_date)],
    ]

    p_table = Table(patient_rows, colWidths=[5 * cm, 11 * cm])
    p_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BACKGROUND", (0, 1), (0, -1), colors.HexColor("#eff6ff")),
        ("TEXTCOLOR", (0, 1), (0, -1), colors.HexColor("#1e3a8a")),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dbeafe")),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [
            colors.white,
            colors.HexColor("#f8fafc"),
        ]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(p_table)
    elements.append(Spacer(1, 25))

    # ---- VITALS TABLE ----
    elements.append(Paragraph("Recorded Vital Signs", heading_style))

    hr = vitals_data.get("heartRate", "-")
    bp = vitals_data.get("bp", "-")
    temp = vitals_data.get("temp", "-")
    oxygen = vitals_data.get("oxygen", "-")
    weight = vitals_data.get("weight", "-")

    # Parse BP
    bp_parts = str(bp).split("/")
    sys_bp = bp_parts[0] if len(bp_parts) > 0 else "-"
    dia_bp = bp_parts[1] if len(bp_parts) > 1 else "-"

    vital_rows = [
        ["Vital Sign", "Value", "Unit", "Status"],
        ["Heart Rate", str(hr), "bpm", _hr_status(hr)],
        ["Systolic BP", str(sys_bp), "mmHg", _bp_sys_status(sys_bp)],
        ["Diastolic BP", str(dia_bp), "mmHg", _bp_dia_status(dia_bp)],
        ["Temperature", str(temp), "°F", _temp_status(temp)],
        ["Blood Oxygen (SpO₂)", str(oxygen), "%", _o2_status(oxygen)],
        ["Weight", str(weight), "kg", "Normal"],
    ]

    v_table = Table(vital_rows, colWidths=[5 * cm, 3 * cm, 3 * cm, 3 * cm])
    v_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#059669")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1fae5")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [
            colors.white,
            colors.HexColor("#f0fdf4"),
        ]),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(v_table)
    elements.append(Spacer(1, 25))

    # ---- CLINICAL NOTES ----
    if p_notes and str(p_notes).strip():
        elements.append(Paragraph("Clinical Notes", heading_style))
        note_style = ParagraphStyle(
            "NoteStyle",
            parent=styles["Normal"],
            fontSize=10,
            textColor=colors.HexColor("#475569"),
            leading=16,
            spaceBefore=6,
            spaceAfter=10,
        )
        elements.append(Paragraph(str(p_notes), note_style))
        elements.append(Spacer(1, 15))

    # ---- DISCLAIMER ----
    elements.append(Paragraph(
        "━" * 60, line_style
    ))

    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#f59e0b"),
        spaceBefore=8,
        spaceAfter=8,
    )
    elements.append(Paragraph(
        "<b>Disclaimer:</b> This report is AI-assisted and for informational "
        "purposes only. Always consult a qualified healthcare professional "
        "for final diagnosis and treatment decisions.",
        disclaimer_style
    ))

    # ---- FOOTER ----
    footer_style = ParagraphStyle(
        "Footer",
        parent=styles["Normal"],
        fontSize=8,
        textColor=colors.HexColor("#94a3b8"),
        alignment=1,
        spaceBefore=20,
    )
    elements.append(Paragraph(
        "BioMonitor v1.0 — Real-Time Biomedical Patient Monitoring & Analytics Platform",
        footer_style
    ))
    elements.append(Paragraph(
        "Developed by Muhammad Hamad Ashraf",
        footer_style
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer


# ─── STATUS HELPER FUNCTIONS ───
def _hr_status(hr):
    try:
        val = int(hr)
        if val > 100:
            return "HIGH"
        elif val < 50:
            return "LOW"
        return "NORMAL"
    except (ValueError, TypeError):
        return "-"


def _bp_sys_status(sys):
    try:
        val = int(sys)
        if val > 140:
            return "HIGH"
        elif val < 90:
            return "LOW"
        return "NORMAL"
    except (ValueError, TypeError):
        return "-"


def _bp_dia_status(dia):
    try:
        val = int(dia)
        if val > 90:
            return "HIGH"
        elif val < 60:
            return "LOW"
        return "NORMAL"
    except (ValueError, TypeError):
        return "-"


def _temp_status(temp):
    try:
        val = float(temp)
        if val > 100.4:
            return "HIGH"
        elif val < 96:
            return "LOW"
        return "NORMAL"
    except (ValueError, TypeError):
        return "-"


def _o2_status(o2):
    try:
        val = int(o2)
        if val < 93:
            return "LOW"
        elif val < 95:
            return "WARNING"
        return "NORMAL"
    except (ValueError, TypeError):
        return "-"