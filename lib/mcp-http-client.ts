// lib/mcp-http-client.ts
// HTTP-based MCP client for your Flask MCP server

import { MCPTool, MCPResource } from '@/lib/mcp-client'

export class MCPHttpClient {
  private tools: MCPTool[] = []
  private resources: MCPResource[] = []
  private connected = false
  private serverUrl: string
  private timeout: number

  constructor(serverUrl?: string, timeout: number = 30000) {
    // Default URL, can be overridden by settings
    this.serverUrl = serverUrl || 'http://10.152.0.70:8083'
    this.timeout = timeout
  }

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`/api/mcp`, {
        method: 'GET',
        signal: AbortSignal.timeout(this.timeout),
      })
      
      const data = await response.json()
      
      if (data.status === 'connected') {
        console.log('[MCP HTTP] Connected to server:', data.server)
        await this.initialize()
        this.connected = true
        return true
      }
      
      return false
    } catch (error) {
      console.error('[MCP HTTP] Connection failed:', error)
      return false
    }
  }

  private async initialize(): Promise<void> {
    try {
      await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {}, resources: {} },
        clientInfo: { name: 'AUSTENTEL-Chat', version: '1.0.0' },
      })

      const toolsResponse = await this.sendRequest('tools/list', {})
      this.tools = toolsResponse.tools || []
      console.log('[MCP HTTP] Tools loaded:', this.tools.length)

      const resourcesResponse = await this.sendRequest('resources/list', {})
      this.resources = resourcesResponse.resources || []
      console.log('[MCP HTTP] Resources loaded:', this.resources.length)
    } catch (error) {
      console.error('[MCP HTTP] Initialization error:', error)
    }
  }

  private async sendRequest(method: string, params: any): Promise<any> {
    const response = await fetch('/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        method,
        params,
      }),
      signal: AbortSignal.timeout(this.timeout),
    })

    if (!response.ok) {
      throw new Error(`MCP request failed: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message || 'MCP request failed')
    }

    return data.result
  }

  async callTool(name: string, arguments_: any): Promise<any> {
    if (!this.connected) {
      const reconnected = await this.connect()
      if (!reconnected) {
        throw new Error('MCP not connected')
      }
    }

    console.log(`[MCP HTTP] Calling tool: ${name}`, arguments_)
    return await this.sendRequest('tools/call', {
      name,
      arguments: arguments_,
    })
  }

  async readResource(uri: string): Promise<any> {
    if (!this.connected) {
      throw new Error('MCP not connected')
    }
    return await this.sendRequest('resources/read', { uri })
  }

  getTools(): MCPTool[] { return this.tools }
  getResources(): MCPResource[] { return this.resources }
  isConnected(): boolean { return this.connected }
  disconnect(): void { this.connected = false }

  // Helper methods for specific tools
  async testConnection(): Promise<string> {
    try {
      const result = await this.callTool('test', {})
      return result?.content || result?.message || 'pong'
    } catch (error) {
      throw new Error(`Test failed: ${error}`)
    }
  }

  async executeSSHCommand(host: string, command: string): Promise<any> {
    return await this.callTool('ssh_command', { host, command })
  }

  async checkPort(host: string, port: number = 80): Promise<any> {
    return await this.callTool('check_port', { host, port })
  }

  async getFreeSwitchStatus(): Promise<any> {
    return await this.callTool('freeswitch_status', {})
  }

  async getValkeyStatus(): Promise<any> {
    return await this.callTool('valkey_status', {})
  }

  async calculate(a: number, b: number): Promise<any> {
    return await this.callTool('calculate', { a, b })
  }
}

// Global HTTP MCP client instance
let mcpHttpClient: MCPHttpClient | null = null

export function getMCPHttpClient(): MCPHttpClient | null {
  return mcpHttpClient
}

export async function initializeHttpMCP(
  serverUrl?: string,
  timeout: number = 30000
): Promise<boolean> {
  try {
    if (mcpHttpClient) {
      mcpHttpClient.disconnect()
    }

    mcpHttpClient = new MCPHttpClient(serverUrl, timeout)
    const connected = await mcpHttpClient.connect()
    
    if (!connected) {
      mcpHttpClient = null
      return false
    }
    
    return true
  } catch (error) {
    console.error('[MCP HTTP] Failed to initialize:', error)
    mcpHttpClient = null
    return false
  }
}

export function disconnectHttpMCP(): void {
  if (mcpHttpClient) {
    mcpHttpClient.disconnect()
    mcpHttpClient = null
  }
}
