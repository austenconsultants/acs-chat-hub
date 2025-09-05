// app/api/mcp/route.ts
// API route to bridge your MCP client with the HTTP-based MCP server

import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

// Default MCP server URL - can be overridden in settings
const DEFAULT_MCP_SERVER_URL = 'http://10.152.0.70:8083'

// Helper function to call MCP server
async function callMCPServer(method: string, params: any = {}) {
  // Get MCP settings from database
  const db = getDatabase()
  const settings = db.getSettings()
  const mcpServerUrl = settings?.mcp?.serverUrl || DEFAULT_MCP_SERVER_URL
  
  const response = await fetch(`${mcpServerUrl}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }),
  })

  if (!response.ok) {
    throw new Error(`MCP server error: ${response.status}`)
  }

  const data = await response.json()
  
  if (data.error) {
    throw new Error(data.error.message || 'MCP request failed')
  }

  return data.result
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { method, params } = body

    console.log('[MCP API] Request:', method, params)

    switch (method) {
      case 'initialize':
        // Initialize MCP session (the HTTP server doesn't need this)
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: {
              name: 'MCP Server for Lobechat',
              version: '1.0.0',
            },
            capabilities: {
              tools: {},
              resources: {},
            },
          },
        })

      case 'tools/list':
        // Return the available tools from your MCP server
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          result: {
            tools: [
              {
                name: 'test',
                description: 'Test MCP connectivity',
                inputSchema: {
                  type: 'object',
                  properties: {},
                  required: [],
                },
              },
              {
                name: 'ssh_command',
                description: 'Execute command on remote server',
                inputSchema: {
                  type: 'object',
                  properties: {
                    host: { type: 'string', description: 'Target host IP address' },
                    command: { type: 'string', description: 'Command to execute' },
                  },
                  required: ['host', 'command'],
                },
              },
              {
                name: 'check_port',
                description: 'Check if a network port is open',
                inputSchema: {
                  type: 'object',
                  properties: {
                    host: { type: 'string', description: 'Target host' },
                    port: { type: 'integer', description: 'Port number', default: 80 },
                  },
                  required: ['host'],
                },
              },
              {
                name: 'freeswitch_status',
                description: 'Check FreeSWITCH service status',
                inputSchema: {
                  type: 'object',
                  properties: {},
                  required: [],
                },
              },
              {
                name: 'valkey_status',
                description: 'Check Valkey cache status',
                inputSchema: {
                  type: 'object',
                  properties: {},
                  required: [],
                },
              },
              {
                name: 'calculate',
                description: 'Add two numbers',
                inputSchema: {
                  type: 'object',
                  properties: {
                    a: { type: 'number', description: 'First number' },
                    b: { type: 'number', description: 'Second number' },
                  },
                  required: ['a', 'b'],
                },
              },
            ],
          },
        })

      case 'resources/list':
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          result: { resources: [] },
        })

      case 'tools/call':
        const { name, arguments: args } = params
        
        try {
          const result = await callMCPServer('tools/call', {
            name,
            arguments: args,
          })

          return NextResponse.json({
            jsonrpc: '2.0',
            id: body.id,
            result,
          })
        } catch (error) {
          // If the RPC endpoint doesn't work, try direct HTTP call
          console.log('[MCP API] Trying direct HTTP call for tool:', name)
          
          const db = getDatabase()
          const settings = db.getSettings()
          const mcpServerUrl = settings?.mcp?.serverUrl || DEFAULT_MCP_SERVER_URL
          
          const directResponse = await fetch(`${mcpServerUrl}/${name}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args || {}),
          })

          if (!directResponse.ok) {
            throw new Error(`Tool execution failed: ${directResponse.status}`)
          }

          const directData = await directResponse.json()
          
          return NextResponse.json({
            jsonrpc: '2.0',
            id: body.id,
            result: directData,
          })
        }

      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          error: { code: -32601, message: 'Method not found' },
        })
    }
  } catch (error) {
    console.error('[MCP API] Error:', error)
    
    return NextResponse.json({
      jsonrpc: '2.0',
      id: request.body?.id,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error',
      },
    })
  }
}

// GET endpoint for status check
export async function GET() {
  try {
    const db = getDatabase()
    const settings = db.getSettings()
    const mcpServerUrl = settings?.mcp?.serverUrl || DEFAULT_MCP_SERVER_URL
    const mcpEnabled = settings?.mcp?.enabled !== false
    
    if (!mcpEnabled) {
      return NextResponse.json({
        status: 'disabled',
        message: 'MCP is disabled in settings',
        url: mcpServerUrl,
      })
    }
    
    const response = await fetch(mcpServerUrl)
    const data = await response.json()
    
    return NextResponse.json({
      status: 'connected',
      server: data,
      url: mcpServerUrl,
    })
  } catch (error) {
    const db = getDatabase()
    const settings = db.getSettings()
    const mcpServerUrl = settings?.mcp?.serverUrl || DEFAULT_MCP_SERVER_URL
    
    return NextResponse.json({
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Cannot reach MCP server',
      url: mcpServerUrl,
    })
  }
}
