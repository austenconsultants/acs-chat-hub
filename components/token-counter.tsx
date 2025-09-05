"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { formatTokenCount, calculateCost } from "@/lib/token-counter"
import { Zap, DollarSign, TrendingUp, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"

interface TokenCounterProps {
  currentChatTokens: number
  totalTokens: number
  model: string
  className?: string
}

interface ModelUsage {
  tokens: number
  cost: number
  chats: number
}

export function TokenCounter({ currentChatTokens, totalTokens, model, className }: TokenCounterProps) {
  const [sessionTokens, setSessionTokens] = useState(0)
  const [sessionCost, setSessionCost] = useState(0)
  const [selectedModel, setSelectedModel] = useState<string>("all")
  const [modelUsage, setModelUsage] = useState<Record<string, ModelUsage>>({})
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 3

  const tokenLimits = {
    "gpt-4": 128000,
    "gpt-4-turbo": 128000,
    "gpt-4o": 128000,
    "gpt-3.5-turbo": 16385,
    "claude-3-opus": 200000,
    "claude-3-sonnet": 200000,
    "claude-3-haiku": 200000,
    "claude-sonnet-4": 200000,
    "claude-opus-4": 200000,
  }

  const maxTokens = tokenLimits[model as keyof typeof tokenLimits] || 128000
  const usagePercentage = (currentChatTokens / maxTokens) * 100

  const totalUsageAcrossModels = Object.values(modelUsage).reduce((sum, usage) => sum + usage.tokens, 0)
  const totalCostAcrossModels = Object.values(modelUsage).reduce((sum, usage) => sum + usage.cost, 0)

  const getDisplayUsage = () => {
    if (selectedModel === "all") {
      return {
        tokens: totalUsageAcrossModels,
        cost: totalCostAcrossModels,
        chats: Object.values(modelUsage).reduce((sum, usage) => sum + usage.chats, 0),
      }
    }
    return modelUsage[selectedModel] || { tokens: 0, cost: 0, chats: 0 }
  }

  const displayUsage = getDisplayUsage()

  useEffect(() => {
    const stored = sessionStorage.getItem("session_tokens")
    const storedModelUsage = sessionStorage.getItem("model_usage")

    if (stored) {
      setSessionTokens(Number.parseInt(stored))
    }

    if (storedModelUsage) {
      setModelUsage(JSON.parse(storedModelUsage))
    }
  }, [])

  useEffect(() => {
    setSessionTokens((prev) => {
      const newTotal = prev + currentChatTokens
      sessionStorage.setItem("session_tokens", newTotal.toString())
      return newTotal
    })

    if (currentChatTokens > 0) {
      setModelUsage((prev) => {
        const cost = calculateCost(
          {
            prompt_tokens: Math.floor(currentChatTokens * 0.6),
            completion_tokens: Math.floor(currentChatTokens * 0.4),
            total_tokens: currentChatTokens,
          },
          model,
        )

        const updated = {
          ...prev,
          [model]: {
            tokens: (prev[model]?.tokens || 0) + currentChatTokens,
            cost: (prev[model]?.cost || 0) + cost,
            chats: (prev[model]?.chats || 0) + 1,
          },
        }

        sessionStorage.setItem("model_usage", JSON.stringify(updated))
        return updated
      })
    }

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

  const modelEntries = Object.entries(modelUsage)
  const totalPages = Math.ceil(modelEntries.length / itemsPerPage)
  const paginatedEntries = modelEntries.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Token Usage</h3>
          <Badge variant="outline" className="text-xs">
            {model.toUpperCase()}
          </Badge>
        </div>

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

        <div className="space-y-2">
          <label className="text-xs text-gray-500">View Usage By Model</label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              {Object.keys(modelUsage).map((modelKey) => (
                <SelectItem key={modelKey} value={modelKey}>
                  {modelKey.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded">
              <Zap className="h-3 w-3 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{selectedModel === "all" ? "Total" : selectedModel.toUpperCase()}</p>
              <p className="text-sm font-medium">{formatTokenCount(displayUsage.tokens)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded">
              <DollarSign className="h-3 w-3 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Cost</p>
              <p className="text-sm font-medium">${displayUsage.cost.toFixed(4)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {selectedModel === "all" ? "All Models" : `${selectedModel.toUpperCase()} Chats`}
            </span>
          </div>
          <span className="text-sm font-medium">{displayUsage.chats} chats</span>
        </div>

        {modelEntries.length > 0 && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                <span className="text-xs text-gray-600">Detailed Usage</span>
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              <div className="border-t border-gray-200 pt-2">
                {paginatedEntries.map(([modelKey, usage]) => (
                  <div key={modelKey} className="flex items-center justify-between py-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {modelKey.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className="text-gray-600">{formatTokenCount(usage.tokens)}</span>
                      <span className="text-green-600">${usage.cost.toFixed(4)}</span>
                      <span className="text-blue-600">{usage.chats} chats</span>
                    </div>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevPage}
                      disabled={totalPages <= 1}
                      className="h-6 px-2"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <span className="text-xs text-gray-500">
                      {currentPage + 1} of {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextPage}
                      disabled={totalPages <= 1}
                      className="h-6 px-2"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </Card>
  )
}
