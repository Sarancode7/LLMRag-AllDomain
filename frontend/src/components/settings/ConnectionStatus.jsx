import React from 'react';
import { Database, AlertCircle } from 'lucide-react';

const ConnectionStatus = ({ connectionStatus, lastError }) => {
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'error': return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'connecting': return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'error': return 'Disconnected';
      case 'connecting': return 'Connecting...';
      default: return 'Unknown';
    }
  };

  const getConnectionDotColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-emerald-400 animate-pulse';
      case 'error': return 'bg-red-400';
      case 'connecting': return 'bg-amber-400 animate-pulse';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="flex items-center space-x-2 mt-1">
      <Database className="w-4 h-4 text-purple-300" />
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getConnectionStatusColor()}`}>
        <div className={`w-2 h-2 rounded-full ${getConnectionDotColor()}`}></div>
        <span>{getConnectionStatusText()}</span>
      </span>
      {lastError && (
        <div className="flex items-center space-x-1 text-xs text-red-300">
          <AlertCircle className="w-3 h-3" />
          <span>{lastError}</span>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;