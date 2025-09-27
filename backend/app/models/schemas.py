# models/schemas.py
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# Existing schemas (your current ones)
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = "default"

class Source(BaseModel):
    document: str
    content: str
    score: Optional[float] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[Source] = []
    conversation_id: str

class HealthResponse(BaseModel):
    status: str
    message: str

class DebugResponse(BaseModel):
    question: str
    retrieved_docs_count: int
    context_preview: List[dict]
    answer: str

class ConciseResponse(BaseModel):
    response: str
    conversation_id: str
    mode: str

# New Authentication Schemas
class GoogleTokenRequest(BaseModel):
    token: str

class UserInfo(BaseModel):
    google_id: str
    email: EmailStr
    name: str
    picture: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo
    remaining_chats: int

class UserSession(BaseModel):
    google_id: str
    email: str
    name: str
    picture: Optional[str]
    chat_count: int = 0
    created_at: datetime
    last_activity: datetime

class ChatLimitResponse(BaseModel):
    message: str
    remaining_chats: int
    is_premium: bool = False

class PaymentPlaceholder(BaseModel):
    message: str
    upgrade_url: Optional[str] = None
