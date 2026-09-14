from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    medical_condition: Optional[str] = None


class PatientResponse(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    medical_condition: Optional[str] = None

    class Config:
        from_attributes = True


class VitalCreate(BaseModel):
    patient_id: int
    heart_rate: Optional[float] = None
    temperature: Optional[float] = None
    oxygen_level: Optional[float] = None
    systolic_bp: Optional[float] = None
    diastolic_bp: Optional[float] = None


class VitalResponse(BaseModel):
    id: int
    patient_id: int
    heart_rate: Optional[float] = None
    temperature: Optional[float] = None
    oxygen_level: Optional[float] = None
    systolic_bp: Optional[float] = None
    diastolic_bp: Optional[float] = None
    recorded_at: datetime

    class Config:
        from_attributes = True