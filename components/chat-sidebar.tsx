"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Plus, Search, Settings, Users, Bot, ChevronLeft, ChevronRight, X } from "lucide-react"
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
        setSearchResults(data.chats || [])
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

  const displayChats = searchActive ? searchResults : chats
  const totalTokens = chats.reduce((sum, chat) => sum + chat.total_tokens, 0)
  const currentChat = chats.find((chat) => chat.id === currentChatId)
  const currentChatTokens = currentChat?.total_tokens || 0

  const contacts = [
    { id: "1", name: "Sarah Chen", status: "online", avatar: "/professional-woman-diverse.png" },
    { id: "2", name: "Mike Johnson", status: "away", avatar: "/professional-man.png" },
    { id: "3", name: "AI Assistant", status: "online", avatar: "/ai-robot.jpg" },
  ]

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

      {/* Token Counter */}
      <div className="p-4 border-b border-sidebar-border">
        <TokenCounter
          currentChatTokens={currentChatTokens}
          totalTokens={totalTokens}
          model={currentChat?.model || "gpt-4"}
        />
      </div>

      {/* Recent Chats */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <h3 className="text-sm font-medium text-sidebar-foreground mb-3">
              {searchActive ? "Search Results" : "Recent Chats"}
            </h3>
            <div className="space-y-2">
              {displayChats.map((chat) => (
                <Card
                  key={chat.id}
                  className={`p-3 hover:bg-sidebar-accent cursor-pointer transition-colors ${
                    currentChatId === chat.id ? "bg-sidebar-accent border-sidebar-primary" : ""
                  }`}
                  onClick={() => {
                    onChatSelect?.(chat.id)
                    if (searchActive) {
                      clearSearch()
                    }
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

              {displayChats.length === 0 && searchActive && !isSearching && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chats found matching "{searchQuery}"</p>
                  <p className="text-xs mt-1">Try different keywords or check spelling</p>
                </div>
              )}

              {displayChats.length === 0 && !searchActive && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-1">Start a new chat to begin</p>
                </div>
              )}
            </div>
          </div>

          {!searchActive && (
            <>
              <Separator />

              {/* Contacts */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-sidebar-foreground mb-3">Contacts</h3>
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-3 p-2 hover:bg-sidebar-accent rounded-md cursor-pointer transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {contact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-sidebar ${
                            contact.status === "online" ? "bg-green-500" : "bg-yellow-500"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-sidebar-foreground">{contact.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{contact.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </ScrollArea>
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
