from app.config import get_settings
import os
from dotenv import load_dotenv

# Force reload of env vars
load_dotenv(override=True)

settings = get_settings()
print(f"DEBUG CHECK:")
print(f"API Key present: {bool(settings.GEMINI_API_KEY)}")
if settings.GEMINI_API_KEY:
    print(f"Key length: {len(settings.GEMINI_API_KEY)}")
    print(f"Key start: {settings.GEMINI_API_KEY[:4]}...")
else:
    print("KEY IS EMPTY OR MISSING")
