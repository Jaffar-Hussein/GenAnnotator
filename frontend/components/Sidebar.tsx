"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Database,
  ClipboardList,
  BarChart2,
  FolderOpen,
  FileText,
  Settings,
  Users,
  LogOut,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";
import React from "react";
import { useRouter } from 'next/navigation';
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Genomes", href: "/genomes", icon: Database },
  { name: "Visualization", href: "/visualization", icon: BarChart2 },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "User Management", href: "/admin/users", icon: Users },
  {name: "Gene Assignment", href: "/gene-assignment", icon: ClipboardList}
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore(state => state.logout);
  const router = useRouter();

  const userInitials =
    user?.first_name && user?.last_name
      ? `${user.first_name.charAt(0).toUpperCase()}${user.last_name
          .charAt(0)
          .toUpperCase()}`
      : "";

  const userName = user?.first_name
    ? user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1)
    : "";

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed left-0 top-0 h-screen bg-background border-r z-50",
        "flex flex-col items-center py-8 transition-all duration-300",
        isHovered ? "w-64" : "w-20"
      )}
    >
      <Link href="/" className="flex items-center justify-center mb-8">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
          GA
        </div>
      </Link>

      <nav className="flex-1 w-full px-4 py-6 space-y-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center h-12 px-4 pr-6 rounded-lg transition-all duration-200",
                isActive
                  ? "text-indigo-900 bg-indigo-50/80 dark:text-indigo-200 dark:bg-indigo-950/30 font-medium"
                  : "text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50/60 dark:hover:text-indigo-300 dark:hover:bg-indigo-950/20"
              )}
            >
              <div
                className="flex items-center w-full"
                style={{
                  transform: isHovered ? "translateX(8px)" : "translateX(0)",
                  transition: "transform 0.2s ease-in-out",
                }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0 mr-3" />
                <span
                  className="text-sm"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    display: isHovered ? "block" : "none",
                    transition: "opacity 0.2s ease-in-out",
                  }}
                >
                  {item.name}
                </span>
              </div>
              {isActive && (
                <div className="absolute right-0 w-1 h-6 rounded-l-full bg-indigo-400 dark:bg-indigo-500" />
              )}
            </Link>
          );
        })}
        <Separator className="my-4 bg-indigo-100 dark:bg-indigo-900/30" />
      </nav>

      <div className="mt-auto w-full">
        {/* User Profile Section */}
        <div className="px-3 mb-2">
          <Link
            href="/profile"
            className={cn(
              "flex items-center p-3 rounded-lg",
              "hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20",
              "transition-all duration-200"
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full",
                "bg-indigo-50 dark:bg-indigo-950/30",
                "flex items-center justify-center",
                "text-sm font-medium text-indigo-600 dark:text-indigo-300"
              )}
            >
              {userInitials}
            </div>
            <div
              className="ml-3 flex flex-col overflow-hidden"
              style={{
                opacity: isHovered ? 1 : 0,
                width: isHovered ? "auto" : 0,
                transition: "all 0.2s ease-in-out",
              }}
            >
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role}
              </p>
            </div>
          </Link>
        </div>

        {/* Theme and Logout Section */}
        <div className="px-3 py-2 border-t border-indigo-100 dark:border-indigo-950/50 space-y-1">
          {/* Theme Switcher Row */}
          <div
            className={cn(
              "w-full flex items-center p-3 rounded-lg",
              "text-muted-foreground",
              "hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20",
              "transition-all duration-200"
            )}
          >
            <div
              className="flex items-center justify-between w-full"
              style={{
                transform: isHovered ? "translateX(8px)" : "translateX(0)",
                transition: "transform 0.2s ease-in-out",
              }}
            >
              <div className="flex items-center">
                <Moon className="w-5 h-5 flex-shrink-0 mr-3" />
                <span
                  style={{
                    opacity: isHovered ? 1 : 0,
                    display: isHovered ? "block" : "none",
                    transition: "opacity 0.2s ease-in-out",
                  }}
                >
                  Theme
                </span>
              </div>
              <div
                style={{
                  opacity: isHovered ? 1 : 0,
                  width: isHovered ? "auto" : 0,
                  overflow: "hidden",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <ThemeSwitcher />
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className={cn(
              "w-full flex items-center p-3 rounded-lg",
              "text-red-600 dark:text-red-400",
              "hover:bg-red-50/60 dark:hover:bg-red-900/20",
              "transition-all duration-200"
            )}
          >
            <div
              className="flex items-center w-full"
              style={{
                transform: isHovered ? "translateX(8px)" : "translateX(0)",
                transition: "transform 0.2s ease-in-out",
              }}
            >
              <LogOut className="w-5 h-5 flex-shrink-0 mr-3" />
              <span
                style={{
                  opacity: isHovered ? 1 : 0,
                  display: isHovered ? "block" : "none",
                  transition: "opacity 0.2s ease-in-out",
                }}
              >
                Logout
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
