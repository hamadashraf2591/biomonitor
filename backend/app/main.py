import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import uvicorn
from app.ai_assistant import chat_with_ai, analyze_image_with_ai
from app.pdf_report import generate_patient_pdf

app = FastAPI(title="BioMonitor API")

# ✅ CORS - Sab URLs allow karo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


class ReportRequest(BaseModel):
    patient: dict
    vitals: dict


@app.get("/")
def home():
    return {"message": "BioMonitor API is running"}


@app.get("/health")
def health():
    return {"status": "online", "system": "BioMonitor"}


@app.post("/ai/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        response = chat_with_ai(request.message)
        return JSONResponse(content={"response": response, "status": "success"})
    except Exception as e:
        return JSONResponse(content={"error": str(e), "status": "error"}, status_code=500)


@app.post("/ai/analyze-image")
async def analyze_image_endpoint(file: UploadFile = File(...), message: str = ""):
    try:
        image_bytes = await file.read()
        response = analyze_image_with_ai(image_bytes, message)
        return JSONResponse(content={"response": response, "status": "success"})
    except Exception as e:
        return JSONResponse(content={"error": str(e), "status": "error"}, status_code=500)


@app.post("/api/download-report")
async def download_report(request: ReportRequest):
    try:
        pdf_buffer = generate_patient_pdf(patient_data=request.patient, vitals_data=request.vitals)
        filename = "Report_" + str(request.patient.get("name", "Patient")).replace(" ", "_") + ".pdf"
        return StreamingResponse(iter([pdf_buffer.getvalue()]), media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=" + filename})
    except Exception as e:
        return JSONResponse(content={"error": str(e), "status": "error"}, status_code=500)


@app.get("/api/status")
def api_status():
    return {"api_status": "connected", "gemini_api": "active"}


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)