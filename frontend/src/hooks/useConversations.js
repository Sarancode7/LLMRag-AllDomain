// hooks/useConversations.js
import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../utils/constants';

export const useConversations = (authHeaders, isAuthenticated) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Generate new conversation ID
  const generateConversationId = () => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Fetch user's conversation history
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.CHAT_HISTORY, {
        headers: authHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        console.error('Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, authHeaders]);

  // Fetch messages for a specific conversation
  const fetchConversationMessages = useCallback(async (conversationId) => {
    if (!isAuthenticated || !conversationId) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.CONVERSATION_MESSAGES}/${conversationId}`,
        {
          headers: authHeaders()
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConversationMessages(prev => ({
          ...prev,
          [conversationId]: data.messages || []
        }));
        return data.messages || [];
      }
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
    }
    return [];
  }, [isAuthenticated, authHeaders]);

  // Start a new conversation
  const startNewConversation = useCallback(() => {
    const newConversationId = generateConversationId();
    const newConversation = {
      id: newConversationId,
      title: 'New Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      message_count: 0
    };
    
    setCurrentConversation(newConversation);
    
    // Clear any cached messages for this conversation
    setConversationMessages(prev => ({
      ...prev,
      [newConversationId]: []
    }));
    
    return newConversationId;
  }, [generateConversationId]);

  // Switch to an existing conversation
  const switchToConversation = useCallback(async (conversation) => {
    setCurrentConversation(conversation);
    
    // Fetch messages if not already cached
    if (!conversationMessages[conversation.id]) {
      await fetchConversationMessages(conversation.id);
    }
  }, [conversationMessages, fetchConversationMessages]);

  // Add a message to the current conversation (optimistic update)
  const addMessageToConversation = useCallback((conversationId, message) => {
    setConversationMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), message]
    }));

    // Update conversation in list
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            updated_at: new Date().toISOString(),
            last_message: message.content.substring(0, 100),
            message_count: (conv.message_count || 0) + 1
          }
        : conv
    ));
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.DELETE_CONVERSATION}/${conversationId}`,
        {
          method: 'DELETE',
          headers: authHeaders()
        }
      );

      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        delete conversationMessages[conversationId];
        
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null);
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [authHeaders, conversationMessages, currentConversation]);

  // Get messages for current conversation
  const getCurrentMessages = useCallback(() => {
    if (!currentConversation) return [];
    return conversationMessages[currentConversation.id] || [];
  }, [currentConversation, conversationMessages]);

  // Load conversations when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    } else {
      // Clear data when user logs out
      setConversations([]);
      setCurrentConversation(null);
      setConversationMessages({});
    }
  }, [isAuthenticated, fetchConversations]);

  return {
    // State
    conversations,
    currentConversation,
    conversationMessages,
    isLoading,

    // Actions
    fetchConversations,
    fetchConversationMessages,
    startNewConversation,
    switchToConversation,
    addMessageToConversation,
    deleteConversation,
    getCurrentMessages,

    // Utils
    generateConversationId
  };
};