"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  MessageSquare,
  Plus,
  Search,
  Settings,
  Users,
  Bot,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { TokenCounter } from "./token-counter"

interface Chat {
  id: string
  title: string
  model: string
  created_at: string
  updated_at: string
  total_tokens: number
  message_count: number
}

interface ChatSidebarProps {
  isOpen: boolean
  onToggle: () => void
  chats?: Chat[]
  currentChatId?: string | null
  onChatSelect?: (chatId: string) => void
  onNewChat?: () => void
}

export function ChatSidebar({
  isOpen,
  onToggle,
  chats = [],
  currentChatId,
  onChatSelect,
  onNewChat,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Chat[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchActive, setSearchActive] = useState(false)
  const [openAgents, setOpenAgents] = useState<Record<string, boolean>>({
    "acs-manager": true,
    acs: false,
    "acs-voice": false,
    "acs-voice-agent": false,
    infrastructure: false,
  })

  const safeChats = Array.isArray(chats) ? chats : []

  const agents = [
    {
      id: "acs-manager",
      name: "ACS Manager",
      description: "Administrative and management tasks",
      chats: safeChats.filter(
        (chat) => chat?.title?.toLowerCase().includes("manager") || chat?.title?.toLowerCase().includes("admin"),
      ),
      color: "bg-primary",
    },
    {
      id: "acs",
      name: "ACS",
      description: "General ACS operations",
      chats: safeChats.filter(
        (chat) =>
          chat?.title && !chat.title.toLowerCase().includes("manager") && !chat.title.toLowerCase().includes("voice"),
      ),
      color: "bg-accent",
    },
    {
      id: "acs-voice",
      name: "ACS Voice",
      description: "Voice communication services",
      chats: safeChats.filter(
        (chat) => chat?.title?.toLowerCase().includes("voice") && !chat?.title?.toLowerCase().includes("agent"),
      ),
      color: "bg-primary/80",
    },
    {
      id: "acs-voice-agent",
      name: "ACS Voice Agent",
      description: "Voice agent interactions",
      chats: safeChats.filter(
        (chat) => chat?.title?.toLowerCase().includes("voice") && chat?.title?.toLowerCase().includes("agent"),
      ),
      color: "bg-accent/80",
    },
    {
      id: "infrastructure",
      name: "Infrastructure",
      description: "System infrastructure and monitoring",
      chats: safeChats.filter(
        (chat) =>
          chat?.title?.toLowerCase().includes("infrastructure") || chat?.title?.toLowerCase().includes("system"),
      ),
      color: "bg-primary/60",
    },
  ]

  const debounceSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([])
        setSearchActive(false)
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      setSearchActive(true)

      try {
        const response = await fetch(`/api/chats/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setSearchResults(Array.isArray(data.chats) ? data.chats : [])
      } catch (error) {
        console.error("[v0] Search failed:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300),
    [],
  )

  useEffect(() => {
    debounceSearch(searchQuery)
  }, [searchQuery, debounceSearch])

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setSearchActive(false)
    setIsSearching(false)
  }

  const totalTokens = safeChats.reduce((sum, chat) => sum + (chat?.total_tokens || 0), 0)
  const currentChat = safeChats.find((chat) => chat?.id === currentChatId)
  const currentChatTokens = currentChat?.total_tokens || 0

  const toggleAgent = (agentId: string) => {
    setOpenAgents((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }))
  }

  if (!isOpen) {
    return (
      <div className="w-16 border-r border-border bg-sidebar flex flex-col items-center py-4 gap-4">
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Separator />
        <Button variant="ghost" size="icon">
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Users className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Bot className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-80 border-r border-sidebar-border bg-sidebar flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sidebar-foreground">ACS Chat Hub</h2>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" size="sm" onClick={onNewChat}>
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 pr-10 bg-sidebar-accent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={clearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        {searchActive && (
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {isSearching ? "Searching..." : `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`}
            </span>
            {!isSearching && (
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <h3 className="text-sm font-medium text-sidebar-foreground mb-3">
              {searchActive ? "Search Results" : "ACS Agents"}
            </h3>

            {searchActive ? (
              <div className="space-y-2">
                {searchResults.map((chat) => (
                  <Card
                    key={chat.id}
                    className={`p-3 hover:bg-sidebar-accent cursor-pointer transition-colors ${
                      currentChatId === chat.id ? "bg-sidebar-accent border-sidebar-primary" : ""
                    }`}
                    onClick={() => {
                      onChatSelect?.(chat.id)
                      clearSearch()
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-sidebar-foreground truncate">{chat.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(chat.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {chat.model}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {chat.message_count} msgs • {chat.total_tokens} tokens
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No chats found matching "{searchQuery}"</p>
                    <p className="text-xs mt-1">Try different keywords or check spelling</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {agents.map((agent) => (
                  <Collapsible key={agent.id} open={openAgents[agent.id]} onOpenChange={() => toggleAgent(agent.id)}>
                    <CollapsibleTrigger asChild>
                      <Card className="p-3 hover:bg-sidebar-accent cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${agent.color}`} />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-sidebar-foreground">{agent.name}</h4>
                            <p className="text-xs text-muted-foreground">{agent.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {agent.chats.length}
                            </Badge>
                            {openAgents[agent.id] ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </Card>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="ml-6 mt-2 space-y-1">
                      {agent.chats.map((chat) => (
                        <Card
                          key={chat.id}
                          className={`p-2 hover:bg-sidebar-accent cursor-pointer transition-colors ${
                            currentChatId === chat.id ? "bg-sidebar-accent border-sidebar-primary" : ""
                          }`}
                          onClick={() => onChatSelect?.(chat.id)}
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-medium text-sidebar-foreground truncate">{chat.title}</h5>
                            <span className="text-xs text-muted-foreground">
                              {new Date(chat.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {chat.model}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{chat.total_tokens} tokens</span>
                          </div>
                        </Card>
                      ))}
                      {agent.chats.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          <p className="text-xs">No conversations yet</p>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                ))}

                {safeChats.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs mt-1">Start a new chat to begin</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Token Counter */}
      <div className="p-4 border-t border-sidebar-border">
        <TokenCounter
          currentChatTokens={currentChatTokens}
          totalTokens={totalTokens}
          model={currentChat?.model || "gpt-4"}
        />
      </div>
    </div>
  )
}

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}
