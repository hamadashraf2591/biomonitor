# pdf_report.py
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


def generate_patient_pdf(patient, vitals):
    """
    Patient aur uske vitals ka PDF banata hai.
    Return: BytesIO buffer
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=2 * cm,
        bottomMargin=2 * cm
    )

    styles = getSampleStyleSheet()
    elements = []

    # ---- HEADER ----
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        fontSize=22,
        textColor=colors.HexColor("#1e3a8a"),
        spaceAfter=6
    )
    elements.append(Paragraph("BioMonitor", title_style))

    sub_style = ParagraphStyle(
        "SubStyle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.grey,
        spaceAfter=20
    )
    elements.append(Paragraph(
        "Clinical Intelligence — Patient Medical Report", sub_style
    ))

    # Generated date
    elements.append(Paragraph(
        f"<b>Generated:</b> {datetime.now().strftime('%d %B %Y, %I:%M %p')}",
        styles["Normal"]
    ))
    elements.append(Spacer(1, 20))

    # ---- PATIENT INFO ----
    elements.append(Paragraph("<b>Patient Information</b>", styles["Heading2"]))
    elements.append(Spacer(1, 8))

    patient_data = [
        ["Patient ID", str(patient.id)],
        ["Name", patient.name],
        ["Age", str(patient.age)],
        ["Gender", patient.gender],
        ["Condition", patient.medical_condition or "N/A"],
    ]

    p_table = Table(patient_data, colWidths=[5 * cm, 10 * cm])
    p_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#eff6ff")),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#1e3a8a")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dbeafe")),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(p_table)
    elements.append(Spacer(1, 25))

    # ---- VITALS TABLE ----
    elements.append(Paragraph("<b>Recorded Vital Signs</b>", styles["Heading2"]))
    elements.append(Spacer(1, 8))

    if vitals:
        vital_data = [[
            "Date", "HR (bpm)", "Temp (°C)",
            "SpO₂ (%)", "Sys BP", "Dia BP"
        ]]

        for v in vitals:
            date_str = v.recorded_at.strftime("%d/%m %H:%M") if v.recorded_at else "-"
            vital_data.append([
                date_str,
                str(v.heart_rate or "-"),
                str(v.temperature or "-"),
                str(v.oxygen_level or "-"),
                str(v.systolic_bp or "-"),
                str(v.diastolic_bp or "-"),
            ])

        v_table = Table(vital_data, colWidths=[3*cm, 2.4*cm, 2.4*cm, 2.4*cm, 2*cm, 2*cm])
        v_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ]))
        elements.append(v_table)
    else:
        elements.append(Paragraph("No vitals recorded.", styles["Normal"]))

    elements.append(Spacer(1, 30))

    # ---- FOOTER ----
    footer_style = ParagraphStyle(
        "Footer",
        parent=styles["Normal"],
        fontSize=8,
        textColor=colors.grey,
        alignment=1
    )
    elements.append(Paragraph(
        "BioMonitor — Real-Time Biomedical Patient Monitoring & Analytics Platform | v1.0",
        footer_style
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer