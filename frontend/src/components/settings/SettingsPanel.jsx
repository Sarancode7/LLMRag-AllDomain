import React from 'react';
import { Zap } from 'lucide-react';

const SettingsPanel = ({ 
  showSettings, 
  apiEndpoint, 
  setApiEndpoint, 
  testConnection, 
  connectionStatus 
}) => {
  if (!showSettings) return null;

  return (
    <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
      <h3 className="text-white font-medium mb-3 flex items-center">
        <Zap className="w-4 h-4 mr-2" />
        API Configuration
      </h3>
      <div className="flex items-center space-x-3 mb-3">
        <input
          type="text"
          value={apiEndpoint}
          onChange={(e) => setApiEndpoint(e.target.value)}
          placeholder="http://localhost:8000/chat"
          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
        />
        <button
          onClick={testConnection}
          disabled={connectionStatus === 'connecting'}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-lg disabled:opacity-50"
        >
          {connectionStatus === 'connecting' ? 'Testing...' : 'Test'}
        </button>
      </div>
      
      <div className="text-xs space-y-1">
        <p className="text-white/60">
          Local: http://localhost:8000/chat | Remote: Use your server URL
        </p>
        <div className="bg-white/5 rounded p-2 text-white/70">
          <p className="font-medium">Troubleshooting:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Make sure your Python server is running on port 8000</li>
            <li>Check if CORS is properly configured in your FastAPI app</li>
            <li>Verify the chroma_db folder exists with vector data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;