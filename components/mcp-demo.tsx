// components/mcp-demo.tsx
// Example component showing how to use MCP in your chat

import React, { useState } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { Terminal, Server, Activity } from 'lucide-react';

export default function MCPDemo() {
  const { isConnected, isLoading, callTool, error } = useMCP(true);
  const [result, setResult] = useState<any>(null);
  const [executing, setExecuting] = useState(false);

  const runTest = async () => {
    setExecuting(true);
    try {
      const res = await callTool('test', {});
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setExecuting(false);
    }
  };

  const checkFreeSWITCH = async () => {
    setExecuting(true);
    try {
      const res = await callTool('freeswitch_status', {});
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">MCP Integration Demo</h3>
      
      <div className="flex items-center gap-2 mb-4">
        <span>Status:</span>
        {isLoading ? (
          <span className="text-yellow-600">Connecting...</span>
        ) : isConnected ? (
          <span className="text-green-600">✅ Connected</span>
        ) : (
          <span className="text-red-600">❌ Disconnected</span>
        )}
      </div>

      {error && (
        <div className="text-red-600 mb-4">{error}</div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={runTest}
          disabled={!isConnected || executing}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Test MCP
        </button>
        <button
          onClick={checkFreeSWITCH}
          disabled={!isConnected || executing}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
        >
          Check FreeSWITCH
        </button>
      </div>

      {result && (
        <pre className="p-3 bg-gray-100 rounded text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

      {executing && (
        <div className="mt-2 text-blue-600">
          <Activity className="inline w-4 h-4 animate-spin mr-2" />
          Executing...
        </div>
      )}
    </div>
  );
}
