import { useState } from 'react';

export const useMessages = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI-powered RAG chatbot. Ask me anything about your documents and I\'ll provide intelligent answers! ✨',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const clearMessages = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: 'Hello! I\'m your AI-powered RAG chatbot. Ask me anything about your documents and I\'ll provide intelligent answers! ✨',
        timestamp: new Date()
      }
    ]);
  };

  return {
    messages,
    addMessage,
    clearMessages,
    isLoading,
    setIsLoading
  };
};