// components/auth/UpgradePrompt.jsx
import React from 'react';
import { Crown, MessageCircle, Zap } from 'lucide-react';

const UpgradePrompt = ({ onUpgrade }) => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Crown className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">
          Upgrade to Premium
        </h3>
        
        <p className="text-white/70 mb-6">
          You've used all 3 free chats. Unlock unlimited conversations with our premium plan!
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <MessageCircle className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-white/60">Free Plan</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">3</div>
            <div className="text-white/60 text-sm">Chats per session</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center justify-center mb-2">
              <Crown className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-white">Premium</span>
            </div>
            <div className="flex items-center justify-center mb-1">
              <span className="text-3xl font-bold text-white">∞</span>
            </div>
            <div className="text-white/80 text-sm">Unlimited chats</div>
          </div>
        </div>
        
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-center text-white/80">
            <Zap className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-sm">Faster response times</span>
          </div>
          <div className="flex items-center justify-center text-white/80">
            <MessageCircle className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-sm">Priority support</span>
          </div>
          <div className="flex items-center justify-center text-white/80">
            <Crown className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm">Advanced features</span>
          </div>
        </div>
        
        <button
          onClick={onUpgrade}
          className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Upgrade to Premium
        </button>
        
        <p className="text-white/50 text-xs mt-4">
          Payment integration coming soon!
        </p>
      </div>
    </div>
  );
};

export default UpgradePrompt;