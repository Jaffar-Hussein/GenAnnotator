"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Database,
  ClipboardList,
  TicketCheck,
  Settings,
  Users,
  LogOut,
  Moon,
  Dna,
  AtomIcon,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["ADMIN", "VALIDATOR", "ANNOTATOR", "READER"],
  },
  {
    name: "Genomes",
    href: "/genomes",
    icon: Database,
    roles: ["ADMIN", "VALIDATOR", "ANNOTATOR", "READER"],
  },
  {
    name: "Genes",
    href: "/genes",
    icon: Dna,
    roles: ["ADMIN", "VALIDATOR", "ANNOTATOR", "READER"],
  },
  {
    name: "Peptides",
    href: "/peptides",
    icon: AtomIcon,
    roles: ["ADMIN", "VALIDATOR", "ANNOTATOR", "READER"],
  },
  {
    name: "Gene Assignment",
    href: "/gene-assignment",
    icon: ClipboardList,
    roles: ["ADMIN", "VALIDATOR"],
  },
  {
    name: "Pending Annotations",
    href: "/gene-validation",
    icon: TicketCheck,
    roles: ["ADMIN", "VALIDATOR"],
  },
  {
    name: "My Annotations",
    href: "/my-annotations",
    icon: ClipboardCheck,
    roles: ["ADMIN", "VALIDATOR", "ANNOTATOR"],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
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

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(
    (item) => user?.role && item.roles.includes(user.role)
  );

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed left-0 top-0 h-screen z-50",
        "flex flex-col transition-all duration-300",
        "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800",
        isHovered ? "w-64" : "w-20"
      )}
    >
      <div className="h-full flex flex-col overflow-y-auto">
        {/* Logo */}
        <div className="flex-shrink-0 px-8 pb-12 pt-12">
          <Link href="/" className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
              GA
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 w-full px-4 space-y-2 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center h-12 px-4 pr-6 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                    : "text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10"
                )}
              >
                <div
                  className="flex items-center w-full"
                  style={{
                    transform: isHovered ? "translateX(8px)" : "translateX(0)",
                    transition: "transform 0.2s ease-in-out",
                  }}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 mr-3",
                      isActive
                        ? "text-indigo-600 dark:text-indigo-300"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  />
                  <span
                    className="text-sm whitespace-nowrap"
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
        </nav>

        {/* Bottom section */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
          {/* User Profile Section */}
          <div className="mb-2">
            <Link
              href="/profile"
              className={cn(
                "flex items-center p-3 rounded-lg",
                
                "hover:bg-indigo-50 dark:hover:bg-indigo-500/10",
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
                <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{userName}</p>
                <p className="text-xs text-muted-foreground text-gray-500 dark:text-gray-400 truncate">
                  {user?.role}
                </p>
              </div>
            </Link>
          </div>

          {/* Theme and Logout Section */}
          <div className="space-y-1">
            {/* Theme Switcher */}
            <div
              className={cn(
                "flex items-center p-3 rounded-lg",
                "text-gray-600 dark:text-gray-300",
                "hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10",
                "transition-all duration-200"
              )}
            >
              <div className="flex items-center justify-between w-full">
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
                router.push("/");
                logout();
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
    </div>
  );
}
