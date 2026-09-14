# 🩺 BioMonitor — Real-Time Biomedical Patient Monitoring & Analytics Platform

> A full-stack clinical intelligence platform for real-time patient vital monitoring, AI-powered anomaly detection, advanced analytics, and automated PDF reporting.

![Status](https://img.shields.io/badge/status-active-success)
![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-teal)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📖 Overview

**BioMonitor** is a modern healthcare monitoring system that allows medical staff to register patients, record their vital signs, and monitor them in real time. The platform uses **Machine Learning (Isolation Forest)** and **rule-based logic** to automatically detect health anomalies, generates **downloadable PDF medical reports**, and provides **interactive analytics dashboards** — all secured with **JWT authentication**.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Login (JWT)** | Token-based authentication with password hashing (bcrypt) |
| 👥 **Patient Management** | Add, view, and manage patient records |
| 📊 **Real-Time Vitals** | Record & monitor Heart Rate, Temperature, SpO₂, Blood Pressure |
| 🧠 **AI Anomaly Detection** | Isolation Forest ML model + rule-based clinical thresholds |
| 📈 **Advanced Analytics** | Interactive trend charts (Recharts) for all vital signs |
| 🚨 **Smart Alerts** | Automatic severity-based alerts (Normal / Warning / Critical) |
| 📄 **PDF Reports** | One-click professional patient report generation (ReportLab) |
| 🎨 **Modern UI** | Responsive, professional clinical dashboard |

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** — High-performance Python web framework
- **PostgreSQL** — Relational database
- **SQLAlchemy** — ORM
- **Scikit-Learn** — Machine Learning (Isolation Forest)
- **ReportLab** — PDF generation
- **python-jose + bcrypt** — JWT authentication & password hashing

### Frontend
- **React 18** — UI library
- **Vite** — Build tool
- **Recharts** — Data visualization

---

## 📁 Project Structure