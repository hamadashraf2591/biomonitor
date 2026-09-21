import os
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai
# ai_assistant.py
import os
import google.generativeai as genai

# ⚠️ Apni Gemini API key yahan daalo
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

genai.configure(api_key=GEMINI_API_KEY)

# Model name (working!)
MODEL_NAME = "gemini-flash-latest"

MEDICAL_CONTEXT = """
You are BioMonitor AI, a helpful medical assistant for healthcare professionals.
You help with:
- Understanding symptoms and possible conditions
- General medicine information and usage
- Analyzing medical images (X-rays, skin conditions, reports)
- Explaining vital signs and health metrics

IMPORTANT RULES:
- Always be clear, professional, and concise.
- Always add a disclaimer that this is AI guidance and a real doctor should be consulted for final diagnosis.
- If asked something non-medical, politely redirect to medical topics.
- Format answers nicely with clear points.
"""


def chat_with_ai(user_message: str) -> str:
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        prompt = f"{MEDICAL_CONTEXT}\n\nUser question: {user_message}"
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"AI service error: {str(e)}"


def analyze_image_with_ai(image_bytes: bytes, user_message: str = "") -> str:
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

        image_part = {
            "mime_type": "image/jpeg",
            "data": image_bytes
        }

        response = model.generate_content([prompt, image_part])
        return response.text
    except Exception as e:
        return f"Image analysis error: {str(e)}"