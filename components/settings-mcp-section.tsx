// components/settings-mcp-section.tsx
// MCP Configuration section for your settings page (NO ENV FILES!)

import React, { useState } from 'react';

interface MCPSettingsProps {
  settings: {
    mcp?: {
      enabled?: boolean;
      serverUrl?: string;
      timeout?: number;
    };
  };
  onUpdate: (settings: any) => void;
}

export const MCPSettingsSection: React.FC<MCPSettingsProps> = ({ settings, onUpdate }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  
  // Default MCP settings if not in database
  const mcpSettings = settings?.mcp || {
    enabled: true,
    serverUrl: 'http://10.152.0.70:8083',
    timeout: 30000,
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      // Save current settings first
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      // Test MCP connection
      const response = await fetch('/api/mcp');
      const data = await response.json();
      
      if (data.status === 'connected') {
        setTestResult(`✅ Connected to MCP Server: ${data.server.name} v${data.server.version}`);
      } else if (data.status === 'disabled') {
        setTestResult('⚠️ MCP is disabled in settings');
      } else {
        setTestResult('❌ Failed to connect to MCP server');
      }
    } catch (error: any) {
      setTestResult('❌ Connection error: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  const handleUpdate = (field: string, value: any) => {
    const updatedSettings = {
      ...settings,
      mcp: {
        ...mcpSettings,
        [field]: value,
      },
    };
    onUpdate(updatedSettings);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">MCP (Model Context Protocol) Configuration</h3>
      <p className="text-sm text-gray-600">
        Configure connection to your MCP server for infrastructure control
      </p>
      
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="mcp-enabled"
          checked={mcpSettings.enabled}
          onChange={(e) => handleUpdate('enabled', e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="mcp-enabled" className="text-sm font-medium text-gray-700">
          Enable MCP Integration
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          MCP Server URL
        </label>
        <input
          type="text"
          value={mcpSettings.serverUrl}
          onChange={(e) => handleUpdate('serverUrl', e.target.value)}
          disabled={!mcpSettings.enabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          placeholder="http://10.152.0.70:8083"
        />
        <p className="mt-1 text-xs text-gray-500">
          URL of your MCP server (stored in database, not .env)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Request Timeout (ms)
        </label>
        <input
          type="number"
          value={mcpSettings.timeout}
          onChange={(e) => handleUpdate('timeout', parseInt(e.target.value))}
          disabled={!mcpSettings.enabled}
          min="5000"
          max="120000"
          step="1000"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />
      </div>

      <div>
        <button
          onClick={testConnection}
          disabled={!mcpSettings.enabled || testing}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {testing ? 'Testing...' : 'Test MCP Connection'}
        </button>
      </div>

      {testResult && (
        <div className={`p-3 rounded-md ${
          testResult.startsWith('✅') ? 'bg-green-50 text-green-800' : 
          testResult.startsWith('⚠️') ? 'bg-yellow-50 text-yellow-800' : 
          'bg-red-50 text-red-800'
        }`}>
          {testResult}
        </div>
      )}

      {mcpSettings.enabled && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Available MCP Tools:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>test</strong> - Test MCP connectivity</li>
            <li>• <strong>ssh_command</strong> - Execute SSH commands on remote servers</li>
            <li>• <strong>check_port</strong> - Check if network ports are open</li>
            <li>• <strong>freeswitch_status</strong> - Check FreeSWITCH service status</li>
            <li>• <strong>valkey_status</strong> - Check Valkey cache status</li>
            <li>• <strong>calculate</strong> - Perform calculations</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            All settings are stored in SQLite database, no .env files used
          </p>
        </div>
      )}
    </div>
  );
};
