// utils/constants.js
export const API_ENDPOINTS = {
  CHAT: 'http://localhost:8000/chat',
  HEALTH: 'http://localhost:8000/health',
  DEBUG: 'http://localhost:8000/debug',
  CONCISE: 'http://localhost:8000/concise',
  // New auth endpoints
  GOOGLE_LOGIN: 'http://localhost:8000/auth/google',
  USER_ME: 'http://localhost:8000/auth/me',
  CHAT_LIMITS: 'http://localhost:8000/auth/limits',
  UPGRADE: 'http://localhost:8000/auth/upgrade',
  // Chat history endpoints
  CHAT_HISTORY: 'http://localhost:8000/history',
  CONVERSATION_MESSAGES: 'http://localhost:8000/conversation',
  DELETE_CONVERSATION: 'http://localhost:8000/conversation'
};

export const CONNECTION_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  CONNECTING: 'connecting'
};

export const MESSAGE_TYPES = {
  USER: 'user',
  BOT: 'bot'
};

export const TIMEOUTS = {
  CONNECTION_TEST: 10000, // 10 seconds
  CHAT_REQUEST: 60000,    // 60 seconds
  AUTO_RETRY: 30000       // 30 seconds
};

export const LIMITS = {
  MESSAGE_MAX_LENGTH: 1000,
  TEXTAREA_MAX_HEIGHT: '120px',
  TEXTAREA_MIN_HEIGHT: '56px',
  FREE_CHAT_LIMIT: 3
};

// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  CLIENT_ID: '2574307330-5adorlgn33m7imegppok04bjdp9dkn4e.apps.googleusercontent.com',
  REDIRECT_URI: window.location.origin,
  SCOPE: 'openid email profile'
};