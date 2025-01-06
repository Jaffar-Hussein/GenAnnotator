'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from "framer-motion"
import { Home, Database, Edit, BarChart2, FolderOpen, FileText, Settings, Users, ChevronRight } from 'lucide-react'
import { cn } from "@/lib/utils"
import  {ThemeSwitcher}  from "@/components/ui/theme-switcher"
import { Separator } from "@/components/ui/separator";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Genomes', href: '/genomes', icon: Database },
  { name: 'Visualization', href: '/visualization', icon: BarChart2 },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'User Management', href: '/admin/users', icon: Users },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed left-0 top-0 h-screen bg-background border-r z-50",
        "flex flex-col items-center py-8 transition-all duration-300",
        "group/sidebar",
        isHovered ? "w-64" : "w-20"
      )}
    >
      <Link href="/" className="flex items-center justify-center mb-8">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          GA
        </div>
      </Link>

      <nav className="flex-1 w-full px-4 py-6 space-y-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center h-12 px-4 pr-6 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30 font-medium" 
                  : "text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/20"
              )}
            >
              <motion.div
                className="flex items-center w-full"
                animate={{ x: isHovered ? 8 : 0 }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0 mr-3" />
                <motion.span
                  className="text-sm"
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    display: isHovered ? "block" : "none",
                  }}
                >
                  {item.name}
                </motion.span>
              </motion.div>
              {isActive && (
                <motion.div
                  className="absolute right-0 w-1 h-6 rounded-l-full bg-indigo-600 dark:bg-indigo-400"
                  layoutId="activeIndicator"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          )
        })}
        <Separator className="my-4 bg-primary/10" />
      </nav>

      <div className="mt-auto px-3 w-full">
        <motion.div 
          className={cn(
            "flex items-center justify-between p-3 rounded-lg",
            "hover:bg-primary/5 transition-colors",
          )}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-sm font-medium text-indigo-600 dark:text-indigo-300">
              JD
            </div>
            <motion.div
              className="flex flex-col"
              animate={{
                opacity: isHovered ? 1 : 0,
                width: isHovered ? 'auto' : 0,
                overflow: 'hidden',
              }}
            >
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </motion.div>
          </div>
          <motion.div
            animate={{
              opacity: isHovered ? 1 : 0,
              width: isHovered ? 'auto' : 0,
              overflow: 'hidden',
            }}
          >
            <ThemeSwitcher />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
