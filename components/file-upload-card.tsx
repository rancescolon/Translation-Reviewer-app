"use client"

import type React from "react"

import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FileUploadCardProps {
  id: string
  label: string
  file: File | null
  dragOver: boolean
  isProcessing: boolean
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function FileUploadCard({
  id,
  label,
  file,
  dragOver,
  isProcessing,
  onDragOver,
  onDragLeave,
  onDrop,
  onChange,
}: FileUploadCardProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border",
          file ? "bg-muted/50" : "",
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className={cn("rounded-full p-3 transition-colors", file ? "bg-primary/10" : "bg-muted")}>
            <Upload className={cn("h-6 w-6 transition-colors", file ? "text-primary" : "text-muted-foreground")} />
          </div>

          {file ? (
            <p className="text-sm font-medium">{file.name}</p>
          ) : (
            <>
              <p className="text-sm font-medium">Drag & drop your file here</p>
              <p className="text-xs text-muted-foreground">or click to browse</p>
            </>
          )}
          <Input id={id} type="file" accept=".json" onChange={onChange} disabled={isProcessing} className="hidden" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(id)?.click()}
            disabled={isProcessing}
          >
            Browse Files
          </Button>
        </div>
      </div>
    </div>
  )
}
