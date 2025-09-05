"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Bot, Zap, Brain, Sparkles, Clock, DollarSign, Crown } from "lucide-react"

type ModelId =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-4-turbo"
  | "gpt-4"
  | "gpt-3.5-turbo"
  | "claude-opus-4.1"
  | "claude-opus-4"
  | "claude-sonnet-4"
  | "claude-3.7-sonnet"
  | "claude-3-5-sonnet"
  | "claude-3-opus"
  | "claude-3-sonnet"
  | "claude-3-haiku"

interface ModelSelectorProps {
  selectedModel: ModelId
  onModelChange: (model: ModelId) => void
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const openAIModels = [
    {
      id: "gpt-4o" as const,
      name: "GPT-4o",
      description: "Latest multimodal flagship model",
      icon: Sparkles,
      badge: "Latest",
      cost: "$5/$15 per 1M tokens",
      contextWindow: "128K",
    },
    {
      id: "gpt-4o-mini" as const,
      name: "GPT-4o Mini",
      description: "Affordable and intelligent small model",
      icon: Zap,
      badge: "Fast",
      cost: "$0.15/$0.60 per 1M tokens",
      contextWindow: "128K",
    },
    {
      id: "gpt-4-turbo" as const,
      name: "GPT-4 Turbo",
      description: "High-performance model with vision",
      icon: Brain,
      badge: "Vision",
      cost: "$10/$30 per 1M tokens",
      contextWindow: "128K",
    },
    {
      id: "gpt-4" as const,
      name: "GPT-4",
      description: "Original GPT-4 model",
      icon: Brain,
      badge: "Classic",
      cost: "$30/$60 per 1M tokens",
      contextWindow: "8K",
    },
    {
      id: "gpt-3.5-turbo" as const,
      name: "GPT-3.5 Turbo",
      description: "Fast and cost-effective",
      icon: Clock,
      badge: "Budget",
      cost: "$0.50/$1.50 per 1M tokens",
      contextWindow: "16K",
    },
  ]

  const claudeModels = [
    {
      id: "claude-opus-4.1" as const,
      name: "Claude Opus 4.1",
      description: "Latest flagship model with enhanced capabilities",
      icon: Crown,
      badge: "Newest",
      cost: "$20/$80 per 1M tokens",
      contextWindow: "200K",
    },
    {
      id: "claude-opus-4" as const,
      name: "Claude Opus 4",
      description: "Most powerful Claude 4 model for complex reasoning",
      icon: Crown,
      badge: "Premium",
      cost: "$18/$75 per 1M tokens",
      contextWindow: "200K",
    },
    {
      id: "claude-sonnet-4" as const,
      name: "Claude Sonnet 4",
      description: "State-of-the-art coding and reasoning (72.7% SWE-bench)",
      icon: Sparkles,
      badge: "Latest",
      cost: "$8/$25 per 1M tokens",
      contextWindow: "200K",
    },
    {
      id: "claude-3.7-sonnet" as const,
      name: "Claude 3.7 Sonnet",
      description: "Enhanced Sonnet with improved performance",
      icon: Brain,
      badge: "Enhanced",
      cost: "$5/$20 per 1M tokens",
      contextWindow: "200K",
    },
    {
      id: "claude-3-5-sonnet" as const,
      name: "Claude 3.5 Sonnet",
      description: "Most intelligent Claude 3 model",
      icon: Sparkles,
      badge: "Popular",
      cost: "$3/$15 per 1M tokens",
      contextWindow: "200K",
    },
    {
      id: "claude-3-opus" as const,
      name: "Claude 3 Opus",
      description: "Powerful model for complex tasks",
      icon: Brain,
      badge: "Power",
      cost: "$15/$75 per 1M tokens",
      contextWindow: "200K",
    },
    {
      id: "claude-3-sonnet" as const,
      name: "Claude 3 Sonnet",
      description: "Balanced performance and speed",
      icon: Bot,
      badge: "Balanced",
      cost: "$3/$15 per 1M tokens",
      contextWindow: "200K",
    },
    {
      id: "claude-3-haiku" as const,
      name: "Claude 3 Haiku",
      description: "Fastest Claude model",
      icon: Zap,
      badge: "Speed",
      cost: "$0.25/$1.25 per 1M tokens",
      contextWindow: "200K",
    },
  ]

  const allModels = [...openAIModels, ...claudeModels]
  const currentModel = allModels.find((m) => m.id === selectedModel)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent min-w-[140px]">
          {currentModel && <currentModel.icon className="h-4 w-4" />}
          <span className="truncate">{currentModel?.name}</span>
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          OpenAI Models
        </DropdownMenuLabel>
        {openAIModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className="flex items-start gap-3 p-3 cursor-pointer"
          >
            <model.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{model.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {model.badge}
                </Badge>
                {selectedModel === model.id && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground mb-1">{model.description}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {model.cost}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {model.contextWindow}
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Anthropic Claude
        </DropdownMenuLabel>
        {claudeModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className="flex items-start gap-3 p-3 cursor-pointer"
          >
            <model.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{model.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {model.badge}
                </Badge>
                {selectedModel === model.id && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground mb-1">{model.description}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {model.cost}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {model.contextWindow}
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
