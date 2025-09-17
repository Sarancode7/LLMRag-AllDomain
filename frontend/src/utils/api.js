import { API_ENDPOINTS, TIMEOUTS } from './constants';

/**
 * Create fetch configuration with timeout
 * @param {number} timeout 
 * @param {object} options 
 * @returns {object}
 */
const createFetchConfig = (timeout, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  return {
    controller,
    timeoutId,
    config: {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal,
      ...options
    }
  };
};

/**
 * Test API health endpoint
 * @param {string} endpoint 
 * @returns {Promise<object>}
 */
export const testApiHealth = async (endpoint) => {
  const healthUrl = endpoint.replace('/chat', '/health');
  const { controller, timeoutId, config } = createFetchConfig(TIMEOUTS.CONNECTION_TEST);
  
  try {
    console.log('Testing connection to:', healthUrl);
    
    const response = await fetch(healthUrl, config);
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Health check response:', data);
      return data;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Send chat message to API
 * @param {string} endpoint 
 * @param {string} message 
 * @param {string} conversationId 
 * @returns {Promise<object>}
 */
export const sendChatMessage = async (endpoint, message, conversationId = 'default') => {
  const { controller, timeoutId, config } = createFetchConfig(TIMEOUTS.CHAT_REQUEST, {
    method: 'POST',
    body: JSON.stringify({
      message: message,
      conversation_id: conversationId
    })
  });
  
  try {
    console.log('Sending message to:', endpoint);
    
    const response = await fetch(endpoint, config);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Chat response:', data);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Send debug request to API
 * @param {string} endpoint 
 * @param {string} message 
 * @returns {Promise<object>}
 */
export const sendDebugMessage = async (endpoint, message) => {
  const debugUrl = endpoint.replace('/chat', '/debug');
  return sendChatMessage(debugUrl, message);
};

/**
 * Send concise request to API
 * @param {string} endpoint 
 * @param {string} message 
 * @returns {Promise<object>}
 */
export const sendConciseMessage = async (endpoint, message) => {
  const conciseUrl = endpoint.replace('/chat', '/concise');
  return sendChatMessage(conciseUrl, message);
};