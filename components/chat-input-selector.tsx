"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Send, Paperclip, Smile, Mic, Brain, Bot, Zap, Sparkles, Clock } from "lucide-react"

type ModelId =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-4-turbo"
  | "gpt-4"
  | "gpt-3.5-turbo"
  | "claude-3-5-sonnet"
  | "claude-3-opus"
  | "claude-3-sonnet"
  | "claude-3-haiku"
  | "claude-opus-4-1"
  | "claude-sonnet-4"

interface ChatInputSelectorProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  selectedModel: ModelId
  onModelChange: (model: ModelId) => void
  disabled?: boolean
  onKeyPress?: (e: React.KeyboardEvent) => void
}

export function ChatInputSelector({
  value,
  onChange,
  onSend,
  selectedModel,
  onModelChange,
  disabled,
  onKeyPress,
}: ChatInputSelectorProps) {
  const models = [
    // OpenAI Models
    { id: "gpt-4o" as const, name: "GPT-4o", icon: Sparkles, badge: "Latest", group: "OpenAI" },
    { id: "gpt-4o-mini" as const, name: "GPT-4o Mini", icon: Zap, badge: "Fast", group: "OpenAI" },
    { id: "gpt-4-turbo" as const, name: "GPT-4 Turbo", icon: Brain, badge: "Vision", group: "OpenAI" },
    { id: "gpt-4" as const, name: "GPT-4", icon: Brain, badge: "Classic", group: "OpenAI" },
    { id: "gpt-3.5-turbo" as const, name: "GPT-3.5 Turbo", icon: Clock, badge: "Budget", group: "OpenAI" },

    // Claude Models
    { id: "claude-opus-4-1" as const, name: "Claude Opus 4.1", icon: Sparkles, badge: "Latest", group: "Claude" },
    { id: "claude-sonnet-4" as const, name: "Claude Sonnet 4", icon: Brain, badge: "New", group: "Claude" },
    { id: "claude-3-5-sonnet" as const, name: "Claude 3.5 Sonnet", icon: Sparkles, badge: "Best", group: "Claude" },
    { id: "claude-3-opus" as const, name: "Claude 3 Opus", icon: Brain, badge: "Power", group: "Claude" },
    { id: "claude-3-sonnet" as const, name: "Claude 3 Sonnet", icon: Bot, badge: "Balanced", group: "Claude" },
    { id: "claude-3-haiku" as const, name: "Claude 3 Haiku", icon: Zap, badge: "Speed", group: "Claude" },
  ]

  const currentModel = models.find((m) => m.id === selectedModel)
  const openAIModels = models.filter((m) => m.group === "OpenAI")
  const claudeModels = models.filter((m) => m.group === "Claude")

  return (
    <div className="border-t border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-end gap-3">
        <Button variant="ghost" size="icon" className="mb-2 text-gray-600 hover:bg-gray-100">
          <Paperclip className="h-4 w-4" />
        </Button>

        <div className="flex-1 relative">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Type your message..."
            className="pr-20 min-h-[44px] resize-none border-gray-200 focus:border-black focus:ring-black"
            disabled={disabled}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
              <Smile className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="mb-2 gap-2 min-w-[120px] bg-transparent">
              {currentModel && <currentModel.icon className="h-4 w-4" />}
              <span className="truncate text-xs">{currentModel?.name}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              OpenAI
            </DropdownMenuLabel>
            {openAIModels.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className="flex items-center gap-3 p-2 cursor-pointer"
              >
                <model.icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{model.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {model.badge}
                    </Badge>
                  </div>
                </div>
                {selectedModel === model.id && <div className="w-2 h-2 bg-primary rounded-full" />}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Claude
            </DropdownMenuLabel>
            {claudeModels.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className="flex items-center gap-3 p-2 cursor-pointer"
              >
                <model.icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{model.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {model.badge}
                    </Badge>
                  </div>
                </div>
                {selectedModel === model.id && <div className="w-2 h-2 bg-primary rounded-full" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="mb-2 bg-black hover:bg-gray-800 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
