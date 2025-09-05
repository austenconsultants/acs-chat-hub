export interface MCPTool {
  name: string
  description: string
  inputSchema: any
}

export interface MCPResource {
  uri: string
  name: string
  description?: string
  mimeType?: string
}

export interface MCPMessage {
  jsonrpc: "2.0"
  id?: string | number
  method?: string
  params?: any
  result?: any
  error?: any
}

export class MCPClient {
  private ws: WebSocket | null = null
  private messageId = 0
  private pendingRequests = new Map<string | number, { resolve: Function; reject: Function }>()
  private tools: MCPTool[] = []
  private resources: MCPResource[] = []
  private connected = false

  constructor(
    private serverUrl: string,
    private timeout = 30000,
  ) {}

  async connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // Support both WebSocket and HTTP URLs for fast MCP
        const wsUrl = this.serverUrl.startsWith("http") ? this.serverUrl.replace("http", "ws") + "/mcp" : this.serverUrl

        this.ws = new WebSocket(wsUrl)

        const timeoutId = setTimeout(() => {
          reject(new Error("Connection timeout"))
        }, this.timeout)

        this.ws.onopen = async () => {
          clearTimeout(timeoutId)
          console.log("[v0] MCP WebSocket connected")

          try {
            // Initialize MCP session
            await this.initialize()
            this.connected = true
            resolve(true)
          } catch (error) {
            console.error("[v0] MCP initialization failed:", error)
            reject(error)
          }
        }

        this.ws.onmessage = (event) => {
          try {
            const message: MCPMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error("[v0] Failed to parse MCP message:", error)
          }
        }

        this.ws.onclose = () => {
          console.log("[v0] MCP WebSocket disconnected")
          this.connected = false
          this.pendingRequests.clear()
        }

        this.ws.onerror = (error) => {
          console.error("[v0] MCP WebSocket error:", error)
          clearTimeout(timeoutId)
          reject(error)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private async initialize(): Promise<void> {
    // Send initialize request
    const initResponse = await this.sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {},
        resources: {},
      },
      clientInfo: {
        name: "AUSTENTEL-Chat",
        version: "1.0.0",
      },
    })

    console.log("[v0] MCP initialized:", initResponse)

    // List available tools
    try {
      const toolsResponse = await this.sendRequest("tools/list", {})
      this.tools = toolsResponse.tools || []
      console.log("[v0] MCP tools loaded:", this.tools.length)
    } catch (error) {
      console.warn("[v0] Failed to load MCP tools:", error)
    }

    // List available resources
    try {
      const resourcesResponse = await this.sendRequest("resources/list", {})
      this.resources = resourcesResponse.resources || []
      console.log("[v0] MCP resources loaded:", this.resources.length)
    } catch (error) {
      console.warn("[v0] Failed to load MCP resources:", error)
    }
  }

  private handleMessage(message: MCPMessage): void {
    if (message.id && this.pendingRequests.has(message.id)) {
      const { resolve, reject } = this.pendingRequests.get(message.id)!
      this.pendingRequests.delete(message.id)

      if (message.error) {
        reject(new Error(message.error.message || "MCP request failed"))
      } else {
        resolve(message.result)
      }
    }
  }

  private sendRequest(method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("MCP connection not available"))
        return
      }

      const id = ++this.messageId
      const message: MCPMessage = {
        jsonrpc: "2.0",
        id,
        method,
        params,
      }

      this.pendingRequests.set(id, { resolve, reject })

      // Set timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(new Error("MCP request timeout"))
        }
      }, this.timeout)

      this.ws.send(JSON.stringify(message))
    })
  }

  async callTool(name: string, arguments_: any): Promise<any> {
    if (!this.connected) {
      throw new Error("MCP not connected")
    }

    return await this.sendRequest("tools/call", {
      name,
      arguments: arguments_,
    })
  }

  async readResource(uri: string): Promise<any> {
    if (!this.connected) {
      throw new Error("MCP not connected")
    }

    return await this.sendRequest("resources/read", { uri })
  }

  getTools(): MCPTool[] {
    return this.tools
  }

  getResources(): MCPResource[] {
    return this.resources
  }

  isConnected(): boolean {
    return this.connected
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.connected = false
    this.pendingRequests.clear()
  }
}

// Global MCP client instance
let mcpClient: MCPClient | null = null

export function getMCPClient(): MCPClient | null {
  return mcpClient
}

export async function initializeMCP(serverUrl: string, timeout = 30000): Promise<boolean> {
  try {
    if (mcpClient) {
      mcpClient.disconnect()
    }

    mcpClient = new MCPClient(serverUrl, timeout)
    await mcpClient.connect()
    return true
  } catch (error) {
    console.error("[v0] Failed to initialize MCP:", error)
    mcpClient = null
    return false
  }
}

export function disconnectMCP(): void {
  if (mcpClient) {
    mcpClient.disconnect()
    mcpClient = null
  }
}
