import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function AppBadge({ title, variant = "default", className }) {
    return (
        <Badge variant={variant} className={cn("", className)}>
            {title}
        </Badge>
    )
}