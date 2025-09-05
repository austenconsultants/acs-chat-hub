// hooks/use-mcp.ts
// React hook for MCP integration

import { useState, useEffect, useCallback } from 'react'
import { MCPHttpClient, initializeHttpMCP, getMCPHttpClient } from '@/lib/mcp-http-client'
import { MCPTool } from '@/lib/mcp-client'

interface UseMCPResult {
  client: MCPHttpClient | null
  isConnected: boolean
  isLoading: boolean
  error: string | null
  tools: MCPTool[]
  connect: () => Promise<void>
  disconnect: () => void
  callTool: (name: string, args?: any) => Promise<any>
  testConnection: () => Promise<void>
}

export function useMCP(autoConnect: boolean = true): UseMCPResult {
  const [client, setClient] = useState<MCPHttpClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tools, setTools] = useState<MCPTool[]>([])

  const connect = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Get settings from the API to check if MCP is enabled
      const settingsResponse = await fetch('/api/settings')
      let serverUrl = undefined
      
      if (settingsResponse.ok) {
        const settings = await settingsResponse.json()
        
        if (settings?.mcp?.enabled === false) {
          setError('MCP is disabled in settings')
          setIsConnected(false)
          setIsLoading(false)
          return
        }
        
        serverUrl = settings?.mcp?.serverUrl
      }
      
      const connected = await initializeHttpMCP(serverUrl)
      
      if (connected) {
        const mcpClient = getMCPHttpClient()
        if (mcpClient) {
          setClient(mcpClient)
          setIsConnected(true)
          setTools(mcpClient.getTools())
          console.log('[useMCP] Connected successfully')
        }
      } else {
        setError('Failed to connect to MCP server')
        setIsConnected(false)
      }
    } catch (err) {
      console.error('[useMCP] Connection error:', err)
      setError(err instanceof Error ? err.message : 'Connection failed')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    if (client) {
      client.disconnect()
      setClient(null)
      setIsConnected(false)
      setTools([])
    }
  }, [client])

  const callTool = useCallback(async (name: string, args?: any) => {
    if (!client) {
      throw new Error('MCP client not connected')
    }
    
    try {
      const result = await client.callTool(name, args)
      return result
    } catch (err) {
      console.error(`[useMCP] Tool call failed (${name}):`, err)
      throw err
    }
  }, [client])

  const testConnection = useCallback(async () => {
    if (!client) {
      await connect()
      return
    }
    
    try {
      const result = await client.testConnection()
      console.log('[useMCP] Connection test result:', result)
    } catch (err) {
      console.error('[useMCP] Connection test failed:', err)
      setError('Connection test failed')
    }
  }, [client, connect])

  useEffect(() => {
    if (autoConnect && !client && !isLoading) {
      connect()
    }
  }, [autoConnect])

  useEffect(() => {
    return () => {
      if (client) {
        disconnect()
      }
    }
  }, [])

  return {
    client,
    isConnected,
    isLoading,
    error,
    tools,
    connect,
    disconnect,
    callTool,
    testConnection,
  }
}

// Convenience hooks for specific tools
export function useMCPSSH() {
  const { client, callTool, ...rest } = useMCP()
  
  const executeCommand = useCallback(
    async (host: string, command: string) => {
      if (!client) throw new Error('MCP not connected')
      return await client.executeSSHCommand(host, command)
    },
    [client]
  )
  
  return { executeCommand, ...rest }
}

export function useMCPFreeSWITCH() {
  const { client, callTool, ...rest } = useMCP()
  
  const getStatus = useCallback(async () => {
    if (!client) throw new Error('MCP not connected')
    return await client.getFreeSwitchStatus()
  }, [client])
  
  return { getStatus, ...rest }
}
