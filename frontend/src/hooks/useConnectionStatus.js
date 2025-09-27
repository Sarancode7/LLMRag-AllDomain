import { useState, useEffect } from 'react';

export const useConnectionStatus = (apiEndpoint) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastError, setLastError] = useState('');

  const testConnection = async () => {
    setConnectionStatus('connecting');
    setLastError('');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const healthUrl = apiEndpoint.replace('/chat', '/health');
      console.log('Testing connection to:', healthUrl);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Health check response:', data);
        
        if (data.status === 'healthy') {
          setConnectionStatus('connected');
          setLastError('');
        } else {
          setConnectionStatus('error');
          setLastError(data.message || 'Service unhealthy');
        }
      } else {
        setConnectionStatus('error');
        setLastError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      
      if (error.name === 'AbortError') {
        setLastError('Connection timeout - server may be down');
      } else if (error.message.includes('CORS')) {
        setLastError('CORS error - check server CORS settings');
      } else if (error.message.includes('fetch')) {
        setLastError('Network error - is the server running on port 8000?');
      } else {
        setLastError(error.message);
      }
    }
  };

  // Test connection when endpoint changes
  useEffect(() => {
    const timer = setTimeout(testConnection, 500);
    return () => clearTimeout(timer);
  }, [apiEndpoint]);

  // Auto-retry connection every 30 seconds if disconnected
  useEffect(() => {
    if (connectionStatus === 'error') {
      const interval = setInterval(testConnection, 30000);
      return () => clearInterval(interval);
    }
  }, [connectionStatus]);

  return {
    connectionStatus,
    lastError,
    testConnection
  };
};