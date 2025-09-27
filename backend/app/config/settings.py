# config/settings.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # API Configuration
    TITLE = "RAG Chatbot API"
    VERSION = "1.0.0"
    HOST = "0.0.0.0"
    PORT = 8000
    
    # RAG Configuration
    DB_PATH = "./chroma_db"
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    
    # Model Configuration
    EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    LLM_MODEL = "llama-3.1-8b-instant"
    LLM_TEMPERATURE = 0
    
    # Retrieval Configuration
    RETRIEVAL_K = 4
    MAX_CONTEXT_TOKENS = 2500
    MAX_TOKENS = 300
    
    # Google OAuth Configuration
    GOOGLE_CLIENT_ID = "2574307330-5adorlgn33m7imegppok04bjdp9dkn4e.apps.googleusercontent.com"
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")  # Add this to your .env file
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-change-in-production")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION_HOURS = 24
    
    # Chat Limits
    FREE_CHAT_LIMIT = 3
    
    # Frontend URL (for CORS and redirects)
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # Firebase Configuration
    FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-credentials.json")

settings = Settings()