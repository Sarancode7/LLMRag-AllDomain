export const API_ENDPOINTS = {
  CHAT: 'http://localhost:8000/chat',
  HEALTH: 'http://localhost:8000/health',
  DEBUG: 'http://localhost:8000/debug',
  CONCISE: 'http://localhost:8000/concise'
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
  TEXTAREA_MIN_HEIGHT: '56px'
};