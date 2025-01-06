"use client"

import * as React from "react"
import { Moon, Sun, Laptop } from 'lucide-react'
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="border-none">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-40 z-50 mt-4"
        sideOffset={5}
      >
        <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center justify-between">
  <div className="flex items-center">
    <Sun className="mr-2 h-4 w-4" />
    <span>Light</span>
  </div>
  {theme === "light" && (
    <motion.div
      className="h-2 w-2 rounded-full bg-primary"
      layoutId="themeIndicator"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    />
  )}
</DropdownMenuItem>
<DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center justify-between">
  <div className="flex items-center">
    <Moon className="mr-2 h-4 w-4" />
    <span>Dark</span>
  </div>
  {theme === "dark" && (
    <motion.div
      className="h-2 w-2 rounded-full bg-primary"
      layoutId="themeIndicator"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    />
  )}
</DropdownMenuItem>
<DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center justify-between">
  <div className="flex items-center">
    <Laptop className="mr-2 h-4 w-4" />
    <span>System</span>
  </div>
  {theme === "system" && (
    <motion.div
      className="h-2 w-2 rounded-full bg-primary"
      layoutId="themeIndicator"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    />
  )}
</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


