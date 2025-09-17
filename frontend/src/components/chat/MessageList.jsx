import React, { useRef, useEffect } from 'react';
import Message from './Message';
import LoadingMessage from './LoadingMessage';

const MessageList = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 relative z-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message) => (
          <Message 
            key={message.id}
            message={message}
          />
        ))}
        
        {isLoading && <LoadingMessage />}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;