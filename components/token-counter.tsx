"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatTokenCount, calculateCost } from "@/lib/token-counter"
import { Zap, DollarSign, TrendingUp } from "lucide-react"

interface TokenCounterProps {
  currentChatTokens: number
  totalTokens: number
  model: string
  className?: string
}

export function TokenCounter({ currentChatTokens, totalTokens, model, className }: TokenCounterProps) {
  const [sessionTokens, setSessionTokens] = useState(0)
  const [sessionCost, setSessionCost] = useState(0)

  // Token limits for different models
  const tokenLimits = {
    "gpt-4": 128000,
    "gpt-4-turbo": 128000,
    "gpt-4o": 128000,
    "gpt-3.5-turbo": 16385,
    "claude-3-opus": 200000,
    "claude-3-sonnet": 200000,
    "claude-3-haiku": 200000,
  }

  const maxTokens = tokenLimits[model as keyof typeof tokenLimits] || 128000
  const usagePercentage = (currentChatTokens / maxTokens) * 100

  useEffect(() => {
    // Load session tokens from sessionStorage
    const stored = sessionStorage.getItem("session_tokens")
    if (stored) {
      setSessionTokens(Number.parseInt(stored))
    }
  }, [])

  useEffect(() => {
    // Update session tokens
    setSessionTokens((prev) => {
      const newTotal = prev + currentChatTokens
      sessionStorage.setItem("session_tokens", newTotal.toString())
      return newTotal
    })

    // Calculate session cost
    const cost = calculateCost(
      {
        prompt_tokens: Math.floor(currentChatTokens * 0.6),
        completion_tokens: Math.floor(currentChatTokens * 0.4),
        total_tokens: currentChatTokens,
      },
      model,
    )
    setSessionCost(cost)
  }, [currentChatTokens, model])

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Token Usage</h3>
          <Badge variant="outline" className="text-xs">
            {model.toUpperCase()}
          </Badge>
        </div>

        {/* Current Chat Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Current Chat</span>
            <span className="font-medium">{formatTokenCount(currentChatTokens)}</span>
          </div>
          <Progress
            value={usagePercentage}
            className="h-2"
            style={{
              background: usagePercentage > 80 ? "#fee2e2" : usagePercentage > 60 ? "#fef3c7" : "#f0f9ff",
            }}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>{formatTokenCount(maxTokens)} limit</span>
          </div>
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded">
              <Zap className="h-3 w-3 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Session</p>
              <p className="text-sm font-medium">{formatTokenCount(sessionTokens)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded">
              <DollarSign className="h-3 w-3 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Cost</p>
              <p className="text-sm font-medium">${sessionCost.toFixed(4)}</p>
            </div>
          </div>
        </div>

        {/* Total Usage */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Total Usage</span>
          </div>
          <span className="text-sm font-medium">{formatTokenCount(totalTokens)}</span>
        </div>
      </div>
    </Card>
  )
}
