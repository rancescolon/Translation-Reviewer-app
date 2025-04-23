import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check, AlertCircle, Clock } from "lucide-react"

interface StatusBadgeProps {
  status: "pending" | "passed" | "failed"
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (status === "pending") {
    return (
      <Badge variant="outline" className={cn("bg-muted text-muted-foreground", className)}>
        <Clock className="mr-1 h-3 w-3" /> Not reviewed
      </Badge>
    )
  }

  if (status === "passed") {
    return (
      <Badge variant="outline" className={cn("bg-green-500/10 text-green-500 border-green-500/20", className)}>
        <Check className="mr-1 h-3 w-3" /> Approved
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={cn("bg-red-500/10 text-red-500 border-red-500/20", className)}>
      <AlertCircle className="mr-1 h-3 w-3" /> Needs correction
    </Badge>
  )
}
