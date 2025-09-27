import React from 'react';
import { Bot, Loader2 } from 'lucide-react';

const LoadingMessage = () => {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="inline-block p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            <span className="text-white">AI is thinking...</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;