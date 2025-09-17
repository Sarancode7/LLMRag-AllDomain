import React, { useState } from 'react';
import Header from './components/layout/Header';
import BackgroundElements from './components/layout/BackgroundElements';
import MessageList from './components/chat/MessageList';
import InputArea from './components/layout/InputArea';
import SidePanel from './components/layout/SidePanel';
import { useMessages } from './hooks/useMessages';
import { useChatApi } from './hooks/useChatApi';
import { useConnectionStatus } from './hooks/useConnectionStatus';

const RAGChatbot = () => {
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  
  const { 
    messages, 
    addMessage, 
    clearMessages,
    isLoading,
    setIsLoading 
  } = useMessages();
  
  const { 
    sendMessage,
    apiEndpoint,
    setApiEndpoint 
  } = useChatApi(addMessage, setIsLoading);
  
  const { 
    connectionStatus, 
    lastError, 
    testConnection 
  } = useConnectionStatus(apiEndpoint);

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      <BackgroundElements />
      
      {/* Side Panel */}
      <SidePanel 
        isOpen={sidePanelOpen} 
        setIsOpen={setSidePanelOpen} 
      />
      
      {/* Main Content */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${
        sidePanelOpen ? 'lg:ml-80' : 'ml-0'
      }`}>
        <Header 
          connectionStatus={connectionStatus}
          lastError={lastError}
          clearChat={clearMessages}
          apiEndpoint={apiEndpoint}
          setApiEndpoint={setApiEndpoint}
          testConnection={testConnection}
        />

        <MessageList 
          messages={messages}
          isLoading={isLoading}
        />

        <InputArea 
          onSendMessage={sendMessage}
          connectionStatus={connectionStatus}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default RAGChatbot;