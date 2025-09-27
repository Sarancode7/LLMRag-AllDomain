// components/chat/ChatHistory.jsx
import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Search, 
  Calendar,
  ChevronRight,
  Clock
} from 'lucide-react';

const ChatHistory = ({ 
  conversations, 
  currentConversation, 
  onSelectConversation, 
  onNewConversation,
  onDeleteConversation,
  isLoading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 bg-white/5 backdrop-blur-lg border-r border-white/20 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Chat History
          </h3>
          <button
            onClick={onNewConversation}
            className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg border border-purple-500/30 text-purple-300 hover:text-purple-200 transition-colors"
            title="New Conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg 
                     text-white placeholder-white/50 focus:outline-none focus:border-blue-400 
                     focus:bg-white/15 transition-all text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-white/60 text-sm">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="w-12 h-12 text-white/30 mx-auto mb-3" />
            {searchTerm ? (
              <p className="text-white/60 text-sm">No conversations match your search.</p>
            ) : (
              <>
                <p className="text-white/60 text-sm mb-2">No conversations yet.</p>
                <button
                  onClick={onNewConversation}
                  className="text-purple-300 hover:text-purple-200 text-sm underline"
                >
                  Start your first conversation
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`relative group mb-2 p-3 rounded-lg cursor-pointer transition-all ${
                  currentConversation?.id === conversation.id
                    ? 'bg-purple-500/20 border border-purple-500/30'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20'
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <h4 className="text-white font-medium text-sm truncate mb-1">
                      {conversation.title || 'Untitled Conversation'}
                    </h4>
                    <p className="text-white/60 text-xs truncate mb-2">
                      {conversation.last_message || 'No messages yet'}
                    </p>
                    <div className="flex items-center text-xs text-white/50">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span className="mr-3">{formatDate(conversation.updated_at)}</span>
                      <MessageSquare className="w-3 h-3 mr-1" />
                      <span>{conversation.message_count || 0} messages</span>
                    </div>
                  </div>
                  
                  {currentConversation?.id === conversation.id && (
                    <ChevronRight className="w-4 h-4 text-purple-300 flex-shrink-0" />
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-300 hover:text-red-200 transition-all"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/20">
        <div className="text-xs text-white/50 text-center">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} saved
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;