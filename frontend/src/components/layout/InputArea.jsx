import React, { useState, useRef } from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';

const InputArea = ({ onSendMessage, connectionStatus, isLoading }) => {
  const [inputMessage, setInputMessage] = useState('');
  const inputRef = useRef(null);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isLoading || connectionStatus !== 'connected') return;
    
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative z-10 bg-white/10 backdrop-blur-lg border-t border-white/20">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={connectionStatus === 'connected' ? "Ask me anything about your documents..." : "Please check server connection..."}
              rows={1}
              disabled={connectionStatus !== 'connected'}
              className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-white/50 shadow-xl ${
                connectionStatus !== 'connected' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ minHeight: '56px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || connectionStatus !== 'connected'}
            className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 shadow-xl transform hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
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
            <span>{inputMessage.length}/1000</span>
            {connectionStatus !== 'connected' && (
              <span className="text-red-300 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Server disconnected
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputArea;