import React from 'react';
import { MessageCircle } from 'lucide-react';

const MessageSources = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-white/20">
      <p className="text-xs text-white/70 mb-2 flex items-center">
        <MessageCircle className="w-3 h-3 mr-1" />
        Sources:
      </p>
      {sources.map((source, index) => (
        <div key={index} className="text-xs text-white/80 bg-white/10 rounded-lg p-2 mb-1">
          {source.document || source}
        </div>
      ))}
    </div>
  );
};

export default MessageSources;