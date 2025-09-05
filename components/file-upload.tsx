"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, File, ImageIcon, Video, Music, FileText, Download, Eye, Trash2 } from "lucide-react"

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  disabled?: boolean
}

interface UploadedFile {
  file: File
  id: string
  progress: number
  status: "uploading" | "completed" | "error"
  url?: string
  preview?: string
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 10,
  maxSize = 50,
  acceptedTypes = ["image/*", "video/*", "audio/*", ".pdf", ".doc", ".docx", ".txt"],
  disabled = false,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
    if (type.startsWith("video/")) return <Video className="h-4 w-4" />
    if (type.startsWith("audio/")) return <Music className="h-4 w-4" />
    if (type.includes("pdf") || type.includes("document")) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files || disabled) return

    const newFiles = Array.from(files).slice(0, maxFiles - uploadedFiles.length)

    newFiles.forEach((file) => {
      if (file.size > maxSize * 1024 * 1024) {
        console.warn(`File ${file.name} is too large (max ${maxSize}MB)`)
        return
      }

      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      const uploadedFile: UploadedFile = {
        file,
        id: fileId,
        progress: 0,
        status: "uploading",
      }

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, preview: e.target?.result as string } : f)),
          )
        }
        reader.readAsDataURL(file)
      }

      setUploadedFiles((prev) => [...prev, uploadedFile])

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadedFiles((prev) =>
          prev.map((f) => {
            if (f.id === fileId) {
              const newProgress = Math.min(f.progress + Math.random() * 30, 100)
              if (newProgress >= 100) {
                clearInterval(interval)
                return { ...f, progress: 100, status: "completed", url: URL.createObjectURL(file) }
              }
              return { ...f, progress: newProgress }
            }
            return f
          }),
        )
      }, 200)
    })

    onFilesSelected(newFiles)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          isDragOver ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary hover:bg-gray-50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-1">
          Drop files here or <span className="text-primary font-medium">browse</span>
        </p>
        <p className="text-xs text-gray-500">
          Max {maxFiles} files, {maxSize}MB each. Supports images, videos, audio, and documents.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files ({uploadedFiles.length})</h4>
          {uploadedFiles.map((uploadedFile) => (
            <Card key={uploadedFile.id} className="p-3">
              <div className="flex items-center gap-3">
                {uploadedFile.preview ? (
                  <img
                    src={uploadedFile.preview || "/placeholder.svg"}
                    alt={uploadedFile.file.name}
                    className="h-10 w-10 object-cover rounded"
                  />
                ) : (
                  <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                    {getFileIcon(uploadedFile.file.type)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{uploadedFile.file.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.file.size)}</p>
                    <Badge variant={uploadedFile.status === "completed" ? "default" : "secondary"} className="text-xs">
                      {uploadedFile.status}
                    </Badge>
                  </div>
                  {uploadedFile.status === "uploading" && (
                    <Progress value={uploadedFile.progress} className="h-1 mt-1" />
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {uploadedFile.status === "completed" && uploadedFile.url && (
                    <>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    onClick={() => removeFile(uploadedFile.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
