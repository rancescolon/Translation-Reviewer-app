import { cn } from "@/lib/utils"

interface KeyboardShortcutProps {
  keys: string[]
  description: string
  className?: string
}

export function KeyboardShortcut({ keys, description, className }: KeyboardShortcutProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-1">
        {keys.map((key, index) => (
          <kbd
            key={index}
            className="inline-flex h-5 items-center justify-center rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground"
          >
            {key}
          </kbd>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  )
}
