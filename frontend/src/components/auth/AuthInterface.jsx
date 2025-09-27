// components/auth/AuthInterface.jsx
import React from 'react';
import { User, LogOut, MessageCircle, Crown } from 'lucide-react';
import GoogleLoginButton from './GoogleLoginButton';

const AuthInterface = ({ 
  user, 
  isAuthenticated, 
  isLoading, 
  chatLimits, 
  onLogout 
}) => {
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Welcome to RAG Chatbot
            </h3>
            <p className="text-white/70 text-sm">
              Sign in with Google to start your conversation. You'll get 3 free chats to try out our AI assistant!
            </p>
          </div>
          
          <GoogleLoginButton 
            isLoading={isLoading}
          />
          
          <div className="mt-6 text-xs text-white/50">
            By signing in, you agree to our terms of service
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Chat Limits Display */}
      <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg border border-white/20">
        <MessageCircle className="w-4 h-4 text-blue-300" />
        <span className="text-sm text-white">
          {chatLimits.remaining}/{3} chats left
        </span>
        {chatLimits.remaining === 0 && (
          <Crown className="w-4 h-4 text-yellow-400" />
        )}
      </div>

      {/* User Info */}
      <div className="flex items-center space-x-3">
        {user?.picture && (
          <img 
            src={user.picture} 
            alt={user.name}
            className="w-8 h-8 rounded-full border-2 border-white/30"
          />
        )}
        <div className="hidden md:block">
          <div className="text-sm font-medium text-white">
            {user?.name}
          </div>
          <div className="text-xs text-white/60">
            {user?.email}
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="p-2 text-white/80 hover:text-white bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all duration-200"
        title="Logout"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AuthInterface;