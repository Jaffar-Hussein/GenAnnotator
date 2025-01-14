"use client"

import * as React from "react"
import { Moon, Sun } from 'lucide-react'
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-8 h-8 rounded-lg",
        "flex items-center justify-center",
        "transition-transform duration-200",
        "hover:scale-110"
      )}
    >
      <Sun 
        className={cn(
          "h-5 w-5 absolute",
          "text-indigo-600 dark:text-indigo-300",
          "transition-all duration-300",
          "rotate-0 scale-100 dark:-rotate-90 dark:scale-0",
        )}
      />
      <Moon 
        className={cn(
          "h-5 w-5 absolute",
          "text-indigo-600 dark:text-indigo-300",
          "transition-all duration-300",
          "rotate-90 scale-0 dark:rotate-0 dark:scale-100",
        )}
      />
      <span className="sr-only">
        Switch to {theme === 'dark' ? 'light' : 'dark'} mode
      </span>
    </button>
  )
}