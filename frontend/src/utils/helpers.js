/**
 * Format timestamp to display time
 * @param {Date} timestamp 
 * @returns {string}
 */
export const formatTimestamp = (timestamp) => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Generate unique message ID
 * @returns {number}
 */
export const generateMessageId = () => {
  return Date.now();
};

/**
 * Check if connection status is healthy
 * @param {string} status 
 * @returns {boolean}
 */
export const isConnected = (status) => {
  return status === 'connected';
};

/**
 * Get error message based on error type
 * @param {Error} error 
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  if (error.name === 'AbortError') {
    return '🕐 Request timed out. The server might be processing or down.';
  } else if (error.message.includes('CORS')) {
    return '🚫 CORS error. Please check if the server is running with proper CORS settings.';
  } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
    return '🌐 Network error. Please check if the server is running on port 8000.';
  } else {
    return `🚫 Error: ${error.message}`;
  }
};

/**
 * Validate message content
 * @param {string} message 
 * @returns {boolean}
 */
export const isValidMessage = (message) => {
  return message && message.trim().length > 0;
};

/**
 * Create initial welcome message
 * @returns {object}
 */
export const createWelcomeMessage = () => {
  return {
    id: 1,
    type: 'bot',
    content: 'Hello! I\'m your AI-powered RAG chatbot. Ask me anything about your documents and I\'ll provide intelligent answers! ✨',
    timestamp: new Date()
  };
};