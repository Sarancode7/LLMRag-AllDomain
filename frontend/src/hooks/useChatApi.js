// hooks/useChatApi.js
import { useState } from 'react';
import { API_ENDPOINTS } from '../utils/constants';

export const useChatApi = (addMessage, setIsLoading, authHeaders = {}) => {
  const [apiEndpoint, setApiEndpoint] = useState(API_ENDPOINTS.CHAT);

  const sendMessage = async (messageContent, conversationId = 'default') => {
    // Don't add user message here - it's already added in App.jsx
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      console.log('Sending message to:', apiEndpoint);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
        body: JSON.stringify({
          message: messageContent,
          conversation_id: conversationId
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in.');
        } else if (response.status === 403) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.detail && errorData.detail.upgrade_required) {
            throw new Error('You\'ve used all free chats. Upgrade to premium to continue.');
          }
          throw new Error('Access denied. You may have reached your chat limit.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Chat response:', data);
      
      // Only add bot response
      const botMessage = {
        id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'bot',
        content: data.response || data.answer || 'Sorry, I couldn\'t process your request.',
        sources: data.sources || [],
        timestamp: new Date()
      };

      addMessage(botMessage);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Sorry, I\'m having trouble connecting to the server.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. The server might be processing or down.';
      } else if (error.message.includes('Authentication required')) {
        errorMessage = 'Please log in with Google to start chatting.';
      } else if (error.message.includes('used all free chats')) {
        errorMessage = 'You\'ve used all 3 free chats. Upgrade to premium to continue chatting!';
      } else if (error.message.includes('chat limit')) {
        errorMessage = 'You\'ve reached your chat limit. Please upgrade to continue.';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error. Please check if the server is running with proper CORS settings.';
      } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check if the server is running on port 8000.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      const errorMsg = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'bot',
        content: errorMessage,
        timestamp: new Date(),
        isError: true
      };

      addMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    apiEndpoint,
    setApiEndpoint
  };
};