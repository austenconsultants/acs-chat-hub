"use client"
import { Button } from "@/components/ui/button"
import { Heart, ThumbsUp, Copy, Edit3, Trash2, Reply, MoreHorizontal, Share } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface MessageActionsProps {
  messageId: string
  isUser: boolean
  onReact: (reaction: string) => void
  onEdit: () => void
  onDelete: () => void
  onReply: () => void
  onCopy: () => void
}

export function MessageActions({ messageId, isUser, onReact, onEdit, onDelete, onReply, onCopy }: MessageActionsProps) {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-accent/10" onClick={() => onReact("👍")}>
        <ThumbsUp className="h-3 w-3" />
      </Button>
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-accent/10" onClick={() => onReact("❤️")}>
        <Heart className="h-3 w-3" />
      </Button>
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-accent/10" onClick={onReply}>
        <Reply className="h-3 w-3" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-accent/10">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copy message
          </DropdownMenuItem>
          {isUser && (
            <DropdownMenuItem onClick={onEdit}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit message
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete message
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Share className="h-4 w-4 mr-2" />
            Share message
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
