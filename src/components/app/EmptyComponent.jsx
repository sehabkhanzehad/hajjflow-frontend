import { Button } from "@/components/ui/button"

export function EmptyComponent({ title, description, action, actionLabel, onAction, icon }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 text-muted-foreground">
                {icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            <p className="mb-6 max-w-sm text-muted-foreground">{description}</p>
            {action || (actionLabel && onAction && (
                <Button onClick={onAction}>
                    {actionLabel}
                </Button>
            ))}
        </div>
    )
}