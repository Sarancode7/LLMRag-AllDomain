import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
from typing import Optional, Dict, List
import logging
import os

from ..models.schemas import UserInfo, UserSession

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        self.db = None
        self.initialized = False
    
    def initialize(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Path to your service account key
            cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-credentials.json")
            
            if not os.path.exists(cred_path):
                logger.error(f"Firebase credentials file not found at {cred_path}")
                return False
            
            # Initialize Firebase Admin SDK
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            
            # Get Firestore client
            self.db = firestore.client()
            self.initialized = True
            
            logger.info("Firebase initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Firebase initialization error: {e}")
            return False
    
    def get_user(self, google_id: str) -> Optional[Dict]:
        """Get user from Firestore"""
        if not self.initialized:
            return None
            
        try:
            user_ref = self.db.collection('users').document(google_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                return user_doc.to_dict()
            return None
            
        except Exception as e:
            logger.error(f"Error getting user {google_id}: {e}")
            return None
    
    def create_or_update_user(self, user_info: UserInfo) -> bool:
        """Create or update user in Firestore"""
        if not self.initialized:
            return False
            
        try:
            user_ref = self.db.collection('users').document(user_info.google_id)
            user_doc = user_ref.get()
            
            now = datetime.utcnow()
            
            if user_doc.exists:
                # Update existing user
                user_ref.update({
                    'email': user_info.email,
                    'name': user_info.name,
                    'picture': user_info.picture,
                    'last_login': now,
                    'updated_at': now
                })
                logger.info(f"Updated user: {user_info.email}")
            else:
                # Create new user
                user_ref.set({
                    'google_id': user_info.google_id,
                    'email': user_info.email,
                    'name': user_info.name,
                    'picture': user_info.picture,
                    'chat_count': 0,
                    'plan_type': 'free',
                    'is_premium': False,
                    'created_at': now,
                    'last_login': now,
                    'updated_at': now
                })
                logger.info(f"Created new user: {user_info.email}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error creating/updating user {user_info.google_id}: {e}")
            return False
    
    def get_user_chat_count(self, google_id: str) -> int:
        """Get user's current chat count"""
        if not self.initialized:
            return 0
            
        try:
            user_data = self.get_user(google_id)
            if user_data:
                return user_data.get('chat_count', 0)
            return 0
            
        except Exception as e:
            logger.error(f"Error getting chat count for {google_id}: {e}")
            return 0
    
    def increment_chat_count(self, google_id: str) -> int:
        """Increment user's chat count and return new count"""
        if not self.initialized:
            return 0
            
        try:
            user_ref = self.db.collection('users').document(google_id)
            
            # Use transaction to safely increment
            @firestore.transactional
            def update_chat_count(transaction):
                user_doc = user_ref.get(transaction=transaction)
                if user_doc.exists:
                    current_count = user_doc.get('chat_count') or 0
                    new_count = current_count + 1
                    transaction.update(user_ref, {
                        'chat_count': new_count,
                        'last_activity': datetime.utcnow()
                    })
                    return new_count
                return 0
            
            transaction = self.db.transaction()
            new_count = update_chat_count(transaction)
            
            logger.info(f"Incremented chat count for {google_id} to {new_count}")
            return new_count
            
        except Exception as e:
            logger.error(f"Error incrementing chat count for {google_id}: {e}")
            return 0
    
    def save_message(self, google_id: str, conversation_id: str, message_type: str, 
                     content: str, sources: List[Dict] = None) -> bool:
        """Save a message to Firestore"""
        if not self.initialized:
            return False
            
        try:
            now = datetime.utcnow()
            
            # Save message
            message_ref = self.db.collection('messages').document()
            message_ref.set({
                'user_id': google_id,
                'conversation_id': conversation_id,
                'type': message_type,  # 'user' or 'bot'
                'content': content,
                'sources': sources or [],
                'timestamp': now,
                'created_at': now
            })
            
            # Update conversation
            conversation_ref = self.db.collection('conversations').document(conversation_id)
            conversation_doc = conversation_ref.get()
            
            if conversation_doc.exists:
                # Update existing conversation
                conversation_ref.update({
                    'updated_at': now,
                    'last_message': content[:100] + ('...' if len(content) > 100 else ''),
                    'message_count': firestore.Increment(1)
                })
            else:
                # Create new conversation
                conversation_ref.set({
                    'user_id': google_id,
                    'title': content[:50] + ('...' if len(content) > 50 else ''),
                    'created_at': now,
                    'updated_at': now,
                    'message_count': 1,
                    'last_message': content[:100] + ('...' if len(content) > 100 else '')
                })
            
            return True
            
        except Exception as e:
            logger.error(f"Error saving message: {e}")
            return False
    
    def get_user_conversations(self, google_id: str, limit: int = 20) -> List[Dict]:
        """Get user's conversation history"""
        if not self.initialized:
            return []
            
        try:
            conversations_ref = self.db.collection('conversations')
            query = conversations_ref.where('user_id', '==', google_id)\
                                   .order_by('updated_at', direction=firestore.Query.DESCENDING)\
                                   .limit(limit)
            
            conversations = []
            for doc in query.stream():
                conversation_data = doc.to_dict()
                conversation_data['id'] = doc.id
                conversations.append(conversation_data)
            
            return conversations
            
        except Exception as e:
            logger.error(f"Error getting conversations for {google_id}: {e}")
            return []
    
    def get_conversation_messages(self, conversation_id: str, limit: int = 50) -> List[Dict]:
        """Get messages for a specific conversation"""
        if not self.initialized:
            return []
            
        try:
            messages_ref = self.db.collection('messages')
            query = messages_ref.where('conversation_id', '==', conversation_id)\
                               .order_by('timestamp')\
                               .limit(limit)
            
            messages = []
            for doc in query.stream():
                message_data = doc.to_dict()
                message_data['id'] = doc.id
                messages.append(message_data)
            
            return messages
            
        except Exception as e:
            logger.error(f"Error getting messages for conversation {conversation_id}: {e}")
            return []
    
    def can_user_chat(self, google_id: str) -> bool:
        """Check if user can send more chats"""
        try:
            user_data = self.get_user(google_id)
            if not user_data:
                return True  # New user gets free chats
            
            if user_data.get('is_premium', False):
                return True  # Premium users have unlimited chats
            
            chat_count = user_data.get('chat_count', 0)
            return chat_count < 3  # Free users get 3 chats
            
        except Exception as e:
            logger.error(f"Error checking chat limits for {google_id}: {e}")
            return False
    
    def get_remaining_chats(self, google_id: str) -> int:
        """Get remaining free chats for user"""
        try:
            user_data = self.get_user(google_id)
            if not user_data:
                return 3  # New user gets 3 free chats
            
            if user_data.get('is_premium', False):
                return 999  # Premium users have "unlimited"
            
            chat_count = user_data.get('chat_count', 0)
            return max(0, 3 - chat_count)
            
        except Exception as e:
            logger.error(f"Error getting remaining chats for {google_id}: {e}")
            return 0
    
# Global Firebase service instance
firebase_service = FirebaseService()