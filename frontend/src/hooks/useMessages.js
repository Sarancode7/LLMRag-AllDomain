// Fix for useMessages.js - ensure unique message IDs

import { useState, useEffect, useCallback } from 'react';

export const useMessages = (currentConversation, conversationMessages) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate unique ID for messages
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Load messages from current conversation
  useEffect(() => {
    if (currentConversation && conversationMessages[currentConversation.id]) {
      // Convert Firebase messages to UI format with unique IDs
      const formattedMessages = conversationMessages[currentConversation.id].map((msg, index) => ({
        id: msg.id || `${msg.timestamp}_${index}` || generateMessageId(),
        type: msg.type,
        content: msg.content,
        sources: msg.sources || [],
        timestamp: new Date(msg.timestamp || msg.created_at)
      }));

      setMessages(formattedMessages);
    } else {
      // Default welcome message for new conversations
      setMessages([{
        id: 'welcome_message',
        type: 'bot',
        content: 'Hello! I\'m your AI-powered RAG chatbot. Ask me anything about your documents and I\'ll provide intelligent answers! ✨',
        timestamp: new Date()
      }]);
    }
  }, [currentConversation, conversationMessages, generateMessageId]);

  const addMessage = useCallback((message) => {
    // Ensure message has unique ID
    const messageWithId = {
      ...message,
      id: message.id || generateMessageId()
    };
    setMessages(prev => [...prev, messageWithId]);
  }, [generateMessageId]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 'welcome_message_new',
        type: 'bot',
        content: 'Hello! I\'m your AI-powered RAG chatbot. Ask me anything about your documents and I\'ll provide intelligent answers! ✨',
        timestamp: new Date()
      }
    ]);
  }, []);

  return {
    messages,
    addMessage,
    clearMessages,
    isLoading,
    setIsLoading
  };
};