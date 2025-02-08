import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { User, LogOut, ChevronDown, Settings, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";

export const FloatingNav = ({ className }: { className?: string }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        // Check if scrolled more than 50px to change background opacity
        setIsScrolled(window.scrollY > 50);
        
        // Hide navbar on scroll down, show on scroll up
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);
      return () => window.removeEventListener("scroll", controlNavbar);
    }
  }, [lastScrollY]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Adjusted offset for smoother scroll
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : -20,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "flex fixed top-4 inset-x-0 mx-auto w-full max-w-7xl z-[100]",
          className
        )}
      >
        <div className={cn(
          "flex items-center justify-between w-full rounded-full border px-4 py-2 sm:py-3 sm:px-6 lg:px-8",
          "transition-all duration-200",
          isScrolled 
            ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-gray-200 dark:border-gray-800 shadow-lg"
            : "bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-transparent"
        )}>
          <div className="flex items-center gap-3">
            {/* Logo with enhanced hover effects */}
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <div className={cn(
                  "w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600",
                  "dark:from-indigo-400 dark:to-purple-500",
                  "transform transition-all duration-300 ease-out",
                  "group-hover:scale-105 group-hover:shadow-lg",
                  "group-hover:from-indigo-400 group-hover:to-purple-500",
                  "dark:group-hover:from-indigo-300 dark:group-hover:to-purple-400"
                )}>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                  <div className="absolute inset-0 rounded-xl shadow-inner" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold tracking-wider text-white transform transition-all duration-300 ease-out group-hover:scale-110">
                    GA
                  </span>
                </div>

                <div className="absolute -right-1 -top-1 w-1.5 h-1.5 rounded-full bg-purple-300 dark:bg-purple-400 
                    transform transition-all duration-300 ease-out group-hover:scale-150 group-hover:opacity-75" />
                <div className="absolute -left-0.5 -bottom-0.5 w-1 h-1 rounded-full bg-indigo-300 dark:bg-indigo-400 
                    transform transition-all duration-300 ease-out group-hover:scale-150 group-hover:opacity-75" />
              </div>
            </Link>

            <Link href="/" className="font-semibold text-base sm:text-lg hover:text-primary transition-colors">
              Genome Annotator
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="hidden sm:flex items-center gap-1">
              <Button
                variant="ghost"
                className="text-sm font-medium hover:text-primary hover:bg-primary/10 transition-colors px-3"
                onClick={() => scrollToSection("features")}
              >
                Features
              </Button>
              <Button
                variant="ghost"
                className="text-sm font-medium hover:text-primary hover:bg-primary/10 transition-colors px-3"
                onClick={() => scrollToSection("footer")}
              >
                Contact
              </Button>
            </nav>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium hover:text-primary hover:bg-primary/10 transition-colors px-3"
                  >
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-sm hover:bg-primary/10 ml-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="hidden sm:inline font-medium">
                        {user.first_name}
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        ({user.role})
                      </span>
                      <ChevronDown className="w-4 h-4 ml-1 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <Link href="/profile">
                      <DropdownMenuItem className="hover:bg-primary/10">
                        <User className="w-4 h-4 mr-2" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    {/* <DropdownMenuItem className="hover:bg-primary/10">
                      <Settings className="w-4 h-4 mr-2" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-primary/10">
                      <Bell className="w-4 h-4 mr-2" />
                      <span>Notifications</span>
                    </DropdownMenuItem> */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                      onClick={() => logout()}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium hover:text-primary hover:bg-primary/10 transition-colors px-3"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup" className="hidden sm:block">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm px-4 py-2">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            <div className="border-l pl-2 ml-2 dark:border-gray-700">
              <ModeToggle />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};