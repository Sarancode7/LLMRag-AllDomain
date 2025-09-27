// components/layout/InputArea.jsx
import React, { useState, useRef } from 'react';
import { Send, Loader2, AlertCircle, Lock, Crown } from 'lucide-react';

const InputArea = ({ 
  onSendMessage, 
  connectionStatus, 
  isLoading,
  // Auth props
  isAuthenticated,
  chatLimits
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const inputRef = useRef(null);

  const canSend = () => {
    return inputMessage.trim() && 
           !isLoading && 
           connectionStatus === 'connected' && 
           isAuthenticated && 
           chatLimits.canChat;
  };

  const getPlaceholderText = () => {
    if (!isAuthenticated) {
      return "Please log in with Google to start chatting...";
    } else if (!chatLimits.canChat) {
      return "You've used all free chats. Upgrade to continue...";
    } else if (connectionStatus !== 'connected') {
      return "Please check server connection...";
    } else {
      return "Ask me anything about your documents...";
    }
  };

  const handleSendMessage = () => {
    if (!canSend()) return;
    
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusWarning = () => {
    if (!isAuthenticated) {
      return (
        <span className="text-yellow-300 flex items-center">
          <Lock className="w-3 h-3 mr-1" />
          Login required
        </span>
      );
    } else if (!chatLimits.canChat) {
      return (
        <span className="text-red-300 flex items-center">
          <Crown className="w-3 h-3 mr-1" />
          Upgrade needed
        </span>
      );
    } else if (connectionStatus !== 'connected') {
      return (
        <span className="text-red-300 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" />
          Server disconnected
        </span>
      );
    }
    return null;
  };

  const getChatLimitInfo = () => {
    if (!isAuthenticated || !chatLimits.canChat) return null;
    
    const remaining = chatLimits.remaining;
    let textColor = 'text-green-300';
    
    if (remaining <= 1) {
      textColor = 'text-red-300';
    } else if (remaining <= 2) {
      textColor = 'text-yellow-300';
    }
    
    return (
      <span className={`${textColor} text-sm`}>
        {remaining} chat{remaining !== 1 ? 's' : ''} remaining
      </span>
    );
  };

  return (
    <div className="relative z-10 bg-white/10 backdrop-blur-lg border-t border-white/20">
      <div className="max-w-4xl mx-auto p-6">
        {/* Chat limit warning banner */}
        {isAuthenticated && chatLimits.remaining <= 1 && chatLimits.canChat && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-200 text-sm">
                  {chatLimits.remaining === 1 ? "Last free chat!" : "Almost out of free chats"}
                </span>
              </div>
              <button className="text-yellow-200 hover:text-yellow-100 text-sm underline">
                Upgrade to Premium
              </button>
            </div>
          </div>
        )}

        {/* No chats left banner */}
        {isAuthenticated && !chatLimits.canChat && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Crown className="w-5 h-5 text-red-400" />
                  <span className="text-red-200 font-medium">Free chats used up!</span>
                </div>
                <p className="text-red-200/80 text-sm">
                  You've used all 3 free chats. Upgrade to premium for unlimited conversations.
                </p>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-medium">
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholderText()}
              rows={1}
              disabled={!isAuthenticated || !chatLimits.canChat || connectionStatus !== 'connected'}
              className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-white/50 shadow-xl ${
                (!isAuthenticated || !chatLimits.canChat || connectionStatus !== 'connected') 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
              style={{ minHeight: '56px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!canSend()}
            className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 shadow-xl transform hover:scale-105 active:scale-95"
            title={
              !isAuthenticated ? "Login required" :
              !chatLimits.canChat ? "Upgrade needed" :
              connectionStatus !== 'connected' ? "Server disconnected" :
              "Send message"
            }
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : !isAuthenticated ? (
              <Lock className="w-6 h-6" />
            ) : !chatLimits.canChat ? (
              <Crown className="w-6 h-6" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <p className="text-white/60 text-sm">
            Press Enter to send, Shift+Enter for new line
          </p>
          <div className="flex items-center space-x-4 text-white/60 text-sm">
            {getChatLimitInfo()}
            <span>{inputMessage.length}/1000</span>
            {getStatusWarning()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputArea;