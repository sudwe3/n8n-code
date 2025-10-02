import React, { useState } from 'react';
import { X } from './Icons.jsx';

export const Settings = ({ isOpen, onClose, onConnect, isConnected, onDisconnect }) => {
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await onConnect(baseUrl, apiKey);
      if (result.success) {
        setBaseUrl('');
        setApiKey('');
      } else {
        setError(result.error || 'Connection failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#252526] rounded-lg w-[500px] max-h-[600px] flex flex-col border border-[#3e3e42]">
        <div className="flex items-center justify-between p-4 border-b border-[#3e3e42]">
          <h2 className="text-lg font-semibold">n8n Connection Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {isConnected ? (
            <div className="space-y-4">
              <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded p-3 text-sm">
                <p className="text-green-400 font-medium">Connected to n8n</p>
                <p className="text-gray-300 text-xs mt-1">
                  You can now open and edit workflows directly from n8n
                </p>
              </div>
              
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-sm transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#1e1e1e] border border-[#3e3e42] rounded p-3 text-xs text-gray-300">
                <p className="font-medium mb-2">How to get API Key:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open your n8n instance</li>
                  <li>Go to Settings</li>
                  <li>Click on "n8n API"</li>
                  <li>Click "Create an API key"</li>
                  <li>Copy the API key</li>
                </ol>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  n8n Base URL
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://your-n8n-instance.com"
                  className="w-full px-3 py-2 bg-[#3e3e42] border border-[#3e3e42] rounded focus:border-[#0e639c] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your n8n API key"
                  className="w-full px-3 py-2 bg-[#3e3e42] border border-[#3e3e42] rounded focus:border-[#0e639c] focus:outline-none text-sm"
                />
              </div>

              {error && (
                <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                onClick={handleConnect}
                disabled={!baseUrl || !apiKey || loading}
                className="w-full px-4 py-2 bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-[#3e3e42] disabled:cursor-not-allowed rounded text-sm transition-colors"
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};