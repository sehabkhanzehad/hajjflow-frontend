"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const cycleTheme = () => {
        if (theme === "light") {
            setTheme("dark")
        } else if (theme === "dark") {
            setTheme("system")
        } else {
            setTheme("light")
        }
    }

    const getIcon = () => {
        if (theme === "light") return <Sun className="h-[1.2rem] w-[1.2rem]" />
        if (theme === "dark") return <Moon className="h-[1.2rem] w-[1.2rem]" />
        return <Monitor className="h-[1.2rem] w-[1.2rem]" />
    }

    return (
        <Button variant="outline" size="icon" onClick={cycleTheme}>
            {getIcon()}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}