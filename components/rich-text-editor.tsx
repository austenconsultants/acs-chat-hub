"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Bold,
  Italic,
  Code,
  Link,
  List,
  ListOrdered,
  Quote,
  Paperclip,
  Mic,
  Send,
  ImageIcon,
  Smile,
} from "lucide-react"
import { FileUpload } from "./file-upload"
import { VoiceRecorder } from "./voice-recorder"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  placeholder?: string
}

export function RichTextEditor({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = "Type your message...",
}: RichTextEditorProps) {
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const emojis = ["😀", "😂", "😍", "🤔", "👍", "👎", "❤️", "🎉", "🔥", "💯", "🚀", "✨"]

  const insertMarkdown = (prefix: string, suffix = "") => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end)

    onChange(newText)

    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }

  const insertEmoji = (emoji: string) => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const newText = value.substring(0, start) + emoji + value.substring(start)
    onChange(newText)
    setShowEmojiPicker(false)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const handleFilesSelected = (files: File[]) => {
    console.log("Files selected:", files)
    setShowFileUpload(false)
  }

  const handleVoiceRecording = (audioBlob: Blob, duration: number) => {
    console.log("Voice recording completed:", { audioBlob, duration })
    setShowVoiceRecorder(false)
  }

  return (
    <div className="space-y-3">
      {/* File Upload Panel */}
      {showFileUpload && (
        <FileUpload onFilesSelected={handleFilesSelected} maxFiles={5} maxSize={25} disabled={disabled} />
      )}

      {/* Voice Recorder Panel */}
      {showVoiceRecorder && <VoiceRecorder onRecordingComplete={handleVoiceRecording} disabled={disabled} />}

      <div className="border border-border rounded-lg bg-white">
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => insertMarkdown("**", "**")}
            disabled={disabled}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => insertMarkdown("*", "*")}
            disabled={disabled}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => insertMarkdown("`", "`")}
            disabled={disabled}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => insertMarkdown("[", "](url)")}
            disabled={disabled}
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => insertMarkdown("- ")}
            disabled={disabled}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => insertMarkdown("1. ")}
            disabled={disabled}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => insertMarkdown("> ")}
            disabled={disabled}
          >
            <Quote className="h-4 w-4" />
          </Button>

          <div className="flex-1" />

          {/* Media Controls */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={disabled}
            onClick={() => setShowFileUpload(!showFileUpload)}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={disabled}
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
          >
            <Mic className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={disabled}>
            <ImageIcon className="h-4 w-4" />
          </Button>

          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={disabled}>
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="grid grid-cols-6 gap-1">
                {emojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-lg"
                    onClick={() => insertEmoji(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Text Input */}
        <div className="flex items-end gap-2 p-3">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            onClick={onSend}
            disabled={disabled || !value.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
