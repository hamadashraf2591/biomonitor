from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from .models import Patient, Vital
from .schemas import (
    PatientCreate,
    PatientResponse,
    VitalCreate,
    VitalResponse
)
from .anomaly import rule_based_check, ml_detect_anomalies
from .pdf_report import generate_patient_pdf
from .auth import authenticate_user, create_access_token, get_current_user

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BioMonitor API",
    description="Real-Time Biomedical Patient Monitoring & Analytics Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "BioMonitor API is running", "status": "online"}


@app.get("/health")
def health_check():
    try:
        with engine.connect():
            database_status = "connected"
    except Exception:
        database_status = "disconnected"
    return {"status": "healthy", "database": database_status}


# ============================================
# LOGIN / JWT (STEP 18)
# ============================================

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password"
        )
    token = create_access_token(data={"sub": user["username"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "full_name": user["full_name"]
    }


@app.get("/me")
def read_me(current_user: dict = Depends(get_current_user)):
    return current_user


# ============================================
# PATIENTS
# ============================================

@app.post("/patients", response_model=PatientResponse)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    new_patient = Patient(
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        medical_condition=patient.medical_condition
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient


@app.get("/patients", response_model=list[PatientResponse])
def get_patients(db: Session = Depends(get_db)):
    return db.query(Patient).all()


# ============================================
# VITALS
# ============================================

@app.post("/vitals", response_model=VitalResponse)
def create_vital(vital: VitalCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == vital.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    new_vital = Vital(
        patient_id=vital.patient_id,
        heart_rate=vital.heart_rate,
        temperature=vital.temperature,
        oxygen_level=vital.oxygen_level,
        systolic_bp=vital.systolic_bp,
        diastolic_bp=vital.diastolic_bp
    )
    db.add(new_vital)
    db.commit()
    db.refresh(new_vital)
    return new_vital


@app.get("/vitals", response_model=list[VitalResponse])
def get_vitals(db: Session = Depends(get_db)):
    return db.query(Vital).all()


# ============================================
# ANOMALY DETECTION (STEP 16)
# ============================================

@app.get("/analyze/vital/{vital_id}")
def analyze_single_vital(vital_id: int, db: Session = Depends(get_db)):
    vital = db.query(Vital).filter(Vital.id == vital_id).first()
    if not vital:
        raise HTTPException(status_code=404, detail="Vital not found")
    result = rule_based_check(vital)
    result["vital_id"] = vital_id
    result["patient_id"] = vital.patient_id
    return result


@app.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    all_vitals = db.query(Vital).all()
    ml_results = ml_detect_anomalies(all_vitals)
    alerts = []

    for vital in all_vitals:
        rule_result = rule_based_check(vital)
        ml_flag = ml_results.get(vital.id, False)

        if rule_result["is_anomaly"] or ml_flag:
            patient = db.query(Patient).filter(
                Patient.id == vital.patient_id
            ).first()

            alerts.append({
                "vital_id": vital.id,
                "patient_id": vital.patient_id,
                "patient_name": patient.name if patient else "Unknown",
                "severity": rule_result["severity"],
                "issues": rule_result["issues"],
                "ml_anomaly": ml_flag,
                "recorded_at": vital.recorded_at,
                "vitals": {
                    "heart_rate": vital.heart_rate,
                    "temperature": vital.temperature,
                    "oxygen_level": vital.oxygen_level,
                    "systolic_bp": vital.systolic_bp,
                    "diastolic_bp": vital.diastolic_bp,
                }
            })
    return alerts


# ============================================
# PDF REPORT (STEP 17)
# ============================================

@app.get("/report/patient/{patient_id}")
def download_patient_report(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    vitals = db.query(Vital).filter(
        Vital.patient_id == patient_id
    ).order_by(Vital.recorded_at.desc()).all()

    pdf_buffer = generate_patient_pdf(patient, vitals)
    filename = f"patient_{patient_id}_report.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )