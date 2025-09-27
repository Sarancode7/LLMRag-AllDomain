// App.jsx
import React, { useState } from 'react';
import Header from './components/layout/Header';
import BackgroundElements from './components/layout/BackgroundElements';
import MessageList from './components/chat/MessageList';
import InputArea from './components/layout/InputArea';
import SidePanel from './components/layout/SidePanel';
import ChatHistory from './components/chat/ChatHistory';
import AuthInterface from './components/auth/AuthInterface';
import { useMessages } from './hooks/useMessages';
import { useChatApi } from './hooks/useChatApi';
import { useConnectionStatus } from './hooks/useConnectionStatus';
import { useAuth } from './hooks/useAuth';
import { useConversations } from './hooks/useConversations';

const RAGChatbot = () => {
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  
  // Auth hook
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    chatLimits,
    logout,
    getAuthHeaders,
    updateChatLimits
  } = useAuth();

  // Conversations hook
  const {
    conversations,
    currentConversation,
    conversationMessages,
    startNewConversation,
    switchToConversation,
    addMessageToConversation,
    deleteConversation,
    isLoading: conversationsLoading
  } = useConversations(getAuthHeaders, isAuthenticated);

  const {
    messages,
    addMessage,
    clearMessages,
    isLoading,
    setIsLoading
  } = useMessages(currentConversation, conversationMessages);

  const {
    sendMessage,
    apiEndpoint,
    setApiEndpoint
  } = useChatApi(addMessage, setIsLoading, getAuthHeaders());

  const {
    connectionStatus,
    lastError,
    testConnection
  } = useConnectionStatus(apiEndpoint);

  // Enhanced send message with chat history
  const handleSendMessage = async (messageContent) => {
    if (!isAuthenticated) {
      const errorMsg = {
        id: Date.now(),
        type: 'bot',
        content: 'Please log in with Google to start chatting.',
        timestamp: new Date(),
        isError: true
      };
      addMessage(errorMsg);
      return;
    }

    if (!chatLimits.canChat) {
      const errorMsg = {
        id: Date.now(),
        type: 'bot',
        content: 'You\'ve used all 3 free chats. Upgrade to premium to continue!',
        timestamp: new Date(),
        isError: true
      };
      addMessage(errorMsg);
      return;
    }

    // If no current conversation, start a new one
    let conversationId = currentConversation?.id;
    if (!conversationId) {
      conversationId = startNewConversation();
    }

    try {
      const userMessage = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'user',
        content: messageContent,
        timestamp: new Date()
      };

      // Add to local state immediately
      addMessage(userMessage);
      
      // Add to conversation (optimistic update)
      addMessageToConversation(conversationId, {
        type: 'user',
        content: messageContent,
        timestamp: new Date().toISOString()
      });

      // Send to backend with conversation ID
      await sendMessage(messageContent, conversationId);
      
      // Update chat limits
      updateChatLimits(chatLimits.remaining - 1);
    } catch (error) {
      console.error('Message send error:', error);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = async (conversation) => {
    await switchToConversation(conversation);
  };

  // Handle new conversation
  const handleNewConversation = () => {
    const newConvId = startNewConversation();
    clearMessages(); // Reset to welcome message
  };

  // Handle conversation deletion
  const handleDeleteConversation = async (conversationId) => {
    await deleteConversation(conversationId);
    if (currentConversation?.id === conversationId) {
      clearMessages();
    }
  };

  // If not authenticated, show login interface
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
        <BackgroundElements />
        
        <div className="flex flex-col flex-1">
          <Header 
            connectionStatus={connectionStatus}
            lastError={lastError}
            clearChat={clearMessages}
            apiEndpoint={apiEndpoint}
            setApiEndpoint={setApiEndpoint}
            testConnection={testConnection}
            // Auth props
            user={user}
            isAuthenticated={isAuthenticated}
            authLoading={authLoading}
            chatLimits={chatLimits}
            onLogout={logout}
            // Chat history props
            showChatHistory={showChatHistory}
            setShowChatHistory={setShowChatHistory}
          />
          
          <div className="flex-1 flex items-center justify-center">
            <AuthInterface 
              user={user}
              isAuthenticated={isAuthenticated}
              isLoading={authLoading}
              chatLimits={chatLimits}
              onLogout={logout}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      <BackgroundElements />
      
      {/* Chat History Sidebar */}
      {showChatHistory && (
        <ChatHistory 
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          isLoading={conversationsLoading}
        />
      )}
      
      {/* Domain Panel */}
      <SidePanel 
        isOpen={sidePanelOpen}
        setIsOpen={setSidePanelOpen}
      />
      
      {/* Main Content */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${
        (sidePanelOpen ? 'lg:ml-80' : 'ml-0') + 
        (showChatHistory ? ' ml-80' : '')
      }`}>
        <Header 
          connectionStatus={connectionStatus}
          lastError={lastError}
          clearChat={handleNewConversation}
          apiEndpoint={apiEndpoint}
          setApiEndpoint={setApiEndpoint}
          testConnection={testConnection}
          // Auth props
          user={user}
          isAuthenticated={isAuthenticated}
          authLoading={authLoading}
          chatLimits={chatLimits}
          onLogout={logout}
          // Chat history props
          showChatHistory={showChatHistory}
          setShowChatHistory={setShowChatHistory}
          currentConversation={currentConversation}
        />
        
        <MessageList 
          messages={messages}
          isLoading={isLoading}
        />
        
        <InputArea 
          onSendMessage={handleSendMessage}
          connectionStatus={connectionStatus}
          isLoading={isLoading}
          // Auth props
          isAuthenticated={isAuthenticated}
          chatLimits={chatLimits}
        />
      </div>
    </div>
  );
};

export default RAGChatbot;