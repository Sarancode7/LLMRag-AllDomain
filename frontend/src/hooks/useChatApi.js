import { useState } from 'react';
import { API_ENDPOINTS } from '../utils/constants';

export const useChatApi = (addMessage, setIsLoading) => {
  const [apiEndpoint, setApiEndpoint] = useState(API_ENDPOINTS.CHAT);

  const sendMessage = async (messageContent) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    addMessage(userMessage);
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for chat
      
      console.log('Sending message to:', apiEndpoint);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
        body: JSON.stringify({
          message: messageContent,
          conversation_id: 'default'
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Chat response:', data);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.response || data.answer || 'Sorry, I couldn\'t process your request.',
        sources: data.sources || [],
        timestamp: new Date()
      };

      addMessage(botMessage);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = '🚫 Sorry, I\'m having trouble connecting to the server.';
      
      if (error.name === 'AbortError') {
        errorMessage = '🕐 Request timed out. The server might be processing or down.';
      } else if (error.message.includes('CORS')) {
        errorMessage = '🚫 CORS error. Please check if the server is running with proper CORS settings.';
      } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        errorMessage = '🌐 Network error. Please check if the server is running on port 8000.';
      } else {
        errorMessage = `🚫 Error: ${error.message}`;
      }
      
      const errorMsg = {
        id: Date.now() + 1,
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