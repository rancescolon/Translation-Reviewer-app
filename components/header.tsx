"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface HeaderProps {
  title: string
  showMissingKeysButton?: boolean
  showResetButton?: boolean
  onMissingKeysClick?: () => void
  onResetClick?: () => void
  missingKeysCount?: number
}

export function Header({
  title,
  showMissingKeysButton = false,
  showResetButton = false,
  onMissingKeysClick,
  onResetClick,
  missingKeysCount = 0,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {showMissingKeysButton && missingKeysCount > 0 && (
            <Button variant="outline" onClick={onMissingKeysClick} className="flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
              <span>Missing Keys</span>
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium">{missingKeysCount}</span>
            </Button>
          )}
          {showResetButton && (
            <Button variant="outline" onClick={onResetClick} className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" /> Reset
            </Button>
          )}
          <Separator orientation="vertical" className="h-6" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
