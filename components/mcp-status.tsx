"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, AlertCircle } from "lucide-react"

export function MCPStatus() {
  // In a real implementation, this would check actual MCP connection status
  const isConnected = true
  const mcpVersion = "1.0.2"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={isConnected ? "default" : "destructive"} className="text-xs gap-1 cursor-help">
            {isConnected ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            MCP {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">Model Context Protocol</p>
            <p className="text-muted-foreground">Status: {isConnected ? "Connected" : "Disconnected"}</p>
            <p className="text-muted-foreground">Version: {mcpVersion}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
