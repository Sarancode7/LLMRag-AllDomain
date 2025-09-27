// components/layout/Header.jsx
import React, { useState } from 'react';
import { Bot, Settings, Sparkles, History, Plus } from 'lucide-react';
import ConnectionStatus from '../settings/ConnectionStatus';
import SettingsPanel from '../settings/SettingsPanel';
import AuthInterface from '../auth/AuthInterface';

const Header = ({
  connectionStatus,
  lastError,
  clearChat,
  apiEndpoint,
  setApiEndpoint,
  testConnection,
  // Auth props
  user,
  isAuthenticated,
  authLoading,
  chatLimits,
  onLogout,
  // Chat history props
  showChatHistory,
  setShowChatHistory,
  currentConversation
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-xl">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-spin" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                RAG Chatbot
              </h1>
              {currentConversation && (
                <div className="text-sm text-white/70 mt-1">
                  {currentConversation.title}
                </div>
              )}
              <ConnectionStatus 
                connectionStatus={connectionStatus}
                lastError={lastError}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Auth Interface - Show login/logout and chat limits */}
            <AuthInterface 
              user={user}
              isAuthenticated={isAuthenticated}
              isLoading={authLoading}
              chatLimits={chatLimits}
              onLogout={onLogout}
            />
            
            {/* Chat History and Controls - only show when authenticated */}
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setShowChatHistory(!showChatHistory)}
                  className={`p-2 rounded-lg border transition-all duration-200 ${
                    showChatHistory 
                      ? 'bg-purple-500/30 border-purple-500/50 text-purple-200' 
                      : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:border-white/30 hover:text-white'
                  }`}
                  title="Toggle Chat History"
                >
                  <History className="w-5 h-5" />
                </button>
                
                <button
                  onClick={clearChat}
                  className="px-4 py-2 text-white/80 hover:text-white bg-green-500/20 hover:bg-green-500/30 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-all duration-200 text-sm font-medium flex items-center space-x-2"
                  title="New Conversation"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Chat</span>
                </button>
                
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Settings Panel - only show when authenticated */}
        {isAuthenticated && (
          <SettingsPanel 
            showSettings={showSettings}
            apiEndpoint={apiEndpoint}
            setApiEndpoint={setApiEndpoint}
            testConnection={testConnection}
            connectionStatus={connectionStatus}
          />
        )}
      </div>
    </div>
  );
};

export default Header;