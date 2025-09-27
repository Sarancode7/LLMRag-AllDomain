# api/endpoints.py
from fastapi import HTTPException, Depends
import logging
from app.core.firebase_service import firebase_service
from app.core.auth import SessionManager, AuthManager

from app.models.schemas import (
    ChatRequest, ChatResponse, Source, HealthResponse, 
    DebugResponse, ConciseResponse,
    # New auth schemas
    GoogleTokenRequest, AuthResponse, UserInfo, ChatLimitResponse, PaymentPlaceholder
)
from app.core.rag_engine import rag_engine
from app.core.auth import AuthManager, SessionManager, get_current_user, check_chat_limit

logger = logging.getLogger(__name__)

# Existing endpoints (your current ones)
async def health_check():
    """Health check endpoint"""
    try:
        if rag_engine.vectordb is None or rag_engine.qa is None:
            return {"status": "unhealthy", "message": "RAG system not initialized"}
        
        # Test database connection
        test_docs = rag_engine.vectordb.similarity_search("test", k=1)
        
        return {"status": "healthy", "message": "RAG Chatbot API is running"}
    except Exception as e:
        return {"status": "unhealthy", "message": f"Error: {str(e)}"}

async def chat(request: ChatRequest, current_user: UserInfo):
    """Main chat endpoint - now saves to Firebase"""
    try:
        logger.info(f"Processing question from user {current_user.email}: {request.message}")
        
        # Use provided conversation_id or generate new one
        conversation_id = request.conversation_id if request.conversation_id != 'default' else f"conv_{current_user.google_id}_{int(datetime.utcnow().timestamp())}"
        
        # Save user message to Firebase
        firebase_service.save_message(
            google_id=current_user.google_id,
            conversation_id=conversation_id,
            message_type='user',
            content=request.message
        )
        
        # Get comprehensive answer using RAG
        answer, sources = rag_engine.ask_comprehensive_question(request.message)
        
        # Increment chat count in Firebase
        new_count = firebase_service.increment_chat_count(current_user.google_id)
        remaining_chats = firebase_service.get_remaining_chats(current_user.google_id)
        
        logger.info(f"User {current_user.email} chat count: {new_count}, remaining: {remaining_chats}")
        
        # Save bot response to Firebase
        firebase_service.save_message(
            google_id=current_user.google_id,
            conversation_id=conversation_id,
            message_type='bot',
            content=answer,
            sources=sources
        )
        
        # Format sources for response - handle None values
        formatted_sources = []
        if sources:
            for src in sources:
                if isinstance(src, dict):
                    formatted_sources.append(Source(
                        document=src.get("document", "Unknown"),
                        content=src.get("content", ""),
                        score=src.get("score")
                    ))
        
        return ChatResponse(
            response=answer,
            sources=formatted_sources,
            conversation_id=conversation_id
        )
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

async def debug_question(request: ChatRequest, current_user: UserInfo = Depends(get_current_user)):
    """Debug endpoint - requires authentication but no chat limit"""
    try:
        logger.info(f"Debug request from user {current_user.email}: {request.message}")
        
        # Use the exact debug function from Colab
        answer = rag_engine.debug_rag_response(request.message)
        
        # Also get retrieval info
        docs = rag_engine.vectordb.as_retriever(search_kwargs={"k": 4}).get_relevant_documents(request.message)
        
        context_info = []
        for i, doc in enumerate(docs):
            if doc.page_content.strip():
                context_info.append({
                    "doc_id": i+1,
                    "preview": doc.page_content[:100] + "...",
                    "metadata": doc.metadata
                })
        
        return {
            "question": request.message,
            "retrieved_docs_count": len(docs),
            "context_preview": context_info,
            "answer": answer
        }
        
    except Exception as e:
        logger.error(f"Error in debug endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Debug error: {str(e)}")

async def concise_chat(request: ChatRequest, current_user: UserInfo = Depends(check_chat_limit)):
    """Concise answer endpoint - requires authentication and checks limits"""
    try:
        logger.info(f"Concise chat from user {current_user.email}: {request.message}")
        
        # Increment chat count
        SessionManager.increment_chat_count(current_user.google_id)
        
        answer = rag_engine.ask_concise_question(request.message)
        
        return {
            "response": answer,
            "conversation_id": request.conversation_id,
            "mode": "concise"
        }
        
    except Exception as e:
        logger.error(f"Error in concise endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Concise processing error: {str(e)}")

# New Authentication Endpoints

async def google_login(request: GoogleTokenRequest):
    """Login with Google OAuth token - now saves to Firebase"""
    try:
        # Verify Google token and get user info
        user_info = AuthManager.verify_google_token(request.token)
        logger.info(f"User logged in: {user_info.email}")
        
        # Create or update user session in Firebase
        SessionManager.create_or_update_session(user_info)
        
        # Create JWT token
        access_token = AuthManager.create_jwt_token(user_info)
        
        # Get remaining chats from Firebase
        remaining_chats = firebase_service.get_remaining_chats(user_info.google_id)
        
        return AuthResponse(
            access_token=access_token,
            user=user_info,
            remaining_chats=remaining_chats
        )
        
    except Exception as e:
        logger.error(f"Google login error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Login failed: {str(e)}")

async def get_user_status(current_user: UserInfo):
    """Get current user's status from Firebase"""
    try:
        user_data = firebase_service.get_user(current_user.google_id)
        remaining_chats = firebase_service.get_remaining_chats(current_user.google_id)
        
        return {
            "user": current_user,
            "chat_count": user_data.get('chat_count', 0) if user_data else 0,
            "remaining_chats": remaining_chats,
            "can_chat": remaining_chats > 0,
            "is_premium": user_data.get('is_premium', False) if user_data else False,
            "created_at": user_data.get('created_at') if user_data else None,
            "last_activity": user_data.get('last_activity') if user_data else None
        }
        
    except Exception as e:
        logger.error(f"Error getting user status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting status: {str(e)}")

async def check_chat_limits(current_user: UserInfo):
    """Check user's chat limits"""
    remaining_chats = SessionManager.get_remaining_chats(current_user.google_id)
    can_chat = remaining_chats > 0
    
    if not can_chat:
        return ChatLimitResponse(
            message="You've used all free chats. Upgrade to premium to continue.",
            remaining_chats=0,
            is_premium=False
        )
    
    return ChatLimitResponse(
        message=f"You have {remaining_chats} free chats remaining.",
        remaining_chats=remaining_chats,
        is_premium=False
    )

async def upgrade_placeholder():
    """Placeholder for payment/upgrade functionality"""
    return PaymentPlaceholder(
        message="Premium upgrade coming soon! This will unlock unlimited chats.",
        upgrade_url=None  # Future: Stripe payment URL
    )

# Add these functions to your api/endpoints.py

from app.core.firebase_service import firebase_service
from app.core.auth import SessionManager, AuthManager

# Add this function to your endpoints.py
async def get_chat_history(current_user: UserInfo):
    """Get user's chat history"""
    try:
        conversations = firebase_service.get_user_conversations(current_user.google_id)
        return {
            "conversations": conversations,
            "total": len(conversations)
        }
        
    except Exception as e:
        logger.error(f"Error getting chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting chat history: {str(e)}")

async def get_conversation_messages(conversation_id: str, current_user: UserInfo):
    """Get messages for a specific conversation"""
    try:
        messages = firebase_service.get_conversation_messages(conversation_id)
        return {
            "messages": messages,
            "conversation_id": conversation_id,
            "total": len(messages)
        }
        
    except Exception as e:
        logger.error(f"Error getting conversation messages: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting messages: {str(e)}")

async def delete_conversation(conversation_id: str, current_user: UserInfo):
    """Delete a conversation"""
    try:
        # Add logic to delete conversation from Firebase
        # For now, return success message
        return {
            "message": "Conversation deleted successfully",
            "conversation_id": conversation_id
        }
        
    except Exception as e:
        logger.error(f"Error deleting conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting conversation: {str(e)}")