from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    medical_condition = Column(String, nullable=True)

    vitals = relationship("Vital", back_populates="patient")


class Vital(Base):
    __tablename__ = "vitals"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    heart_rate = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    oxygen_level = Column(Float, nullable=True)
    systolic_bp = Column(Float, nullable=True)
    diastolic_bp = Column(Float, nullable=True)

    recorded_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="vitals")