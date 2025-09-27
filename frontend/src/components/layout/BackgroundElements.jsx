import React from 'react';

const BackgroundElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-1/2 -right-8 w-96 h-96 bg-pink-500 rounded-full opacity-15 animate-bounce"></div>
      <div className="absolute -bottom-8 left-1/3 w-64 h-64 bg-indigo-500 rounded-full opacity-25 animate-pulse"></div>
    </div>
  );
};

export default BackgroundElements;