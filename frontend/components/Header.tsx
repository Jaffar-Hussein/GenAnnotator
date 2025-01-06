"use client"
import Link from 'next/link'
import { UserCircle, Bell, Menu } from 'lucide-react'
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from 'react'
import { useSidebar } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const sampleNotifications = [
  { id: 1, message: "New genome uploaded: E. coli K-12" },
  { id: 2, message: "Annotation completed for S. aureus" },
  { id: 3, message: "New analysis results available" },
]

export default function Header() {
  const { state } = useSidebar()
  const [notifications, setNotifications] = useState(sampleNotifications)
  return (
    <header className="bg-background border-b">
      <div className="px-4">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <SidebarTrigger className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </SidebarTrigger>
            {state === "collapsed" && (
              <span className="ml-2 text-lg font-semibold">Genome Annotator</span>
            )}
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative group"
                >
                  <Bell className="h-6 w-6 transition-transform duration-300 ease-in-out group-hover:rotate-[15deg]" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                  <span className="sr-only">View notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {notifications.length === 0 ? (
                  <DropdownMenuItem>No new notifications</DropdownMenuItem>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id}>
                      {notification.message}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/settings" passHref>
              <Button variant="ghost" size="icon" className="ml-3">
                <UserCircle className="h-6 w-6" />
                <span className="sr-only">User settings</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
