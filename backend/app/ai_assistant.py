import os
from dotenv import load_dotenv
load_dotenv()

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    genai = None
    GEMINI_AVAILABLE = False

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

if GEMINI_AVAILABLE and GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-flash-latest"

MEDICAL_CONTEXT = """
You are BioMonitor AI, a helpful medical assistant for healthcare professionals.
You help with symptoms, medicine information, medical image analysis, and vitals.
Always add a disclaimer to consult a real doctor. Be concise and professional.
"""

AI_OFFLINE_MSG = "⚠️ AI Assistant is currently unavailable on this server (free hosting). Please run BioMonitor locally to use the AI features, or contact the administrator."


def chat_with_ai(user_message: str) -> str:
    if not (GEMINI_AVAILABLE and GEMINI_API_KEY):
        return AI_OFFLINE_MSG
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        prompt = f"{MEDICAL_CONTEXT}\n\nUser question: {user_message}"
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"AI service error: {str(e)}"


def analyze_image_with_ai(image_bytes: bytes, user_message: str = "") -> str:
    if not (GEMINI_AVAILABLE and GEMINI_API_KEY):
        return AI_OFFLINE_MSG
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        prompt = f"""{MEDICAL_CONTEXT}

The user has uploaded a medical image. Analyze it carefully.
User's note: {user_message if user_message else "Please analyze this medical image."}

Provide:
1. What you observe in the image
2. Possible findings or conditions
3. Recommendations
4. Disclaimer to consult a doctor
"""
        image_part = {"mime_type": "image/jpeg", "data": image_bytes}
        response = model.generate_content([prompt, image_part])
        return response.text
    except Exception as e:
        return f"Image analysis error: {str(e)}"