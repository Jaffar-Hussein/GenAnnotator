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
        <div
          className={cn(
            "flex items-center justify-between w-full rounded-full border px-4 py-2 sm:py-3 sm:px-6 lg:px-8",
            "transition-all duration-200",
            isScrolled
              ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-gray-200 dark:border-gray-800 shadow-lg"
              : "bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-transparent"
          )}
        >
          <div className="flex items-center gap-3">
            {/* Logo with enhanced hover effects */}
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600",
                    "dark:from-indigo-400 dark:to-purple-500",
                    "transform transition-all duration-300 ease-out",
                    "group-hover:scale-105 group-hover:shadow-lg",
                    "group-hover:from-indigo-400 group-hover:to-purple-500",
                    "dark:group-hover:from-indigo-300 dark:group-hover:to-purple-400"
                  )}
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                  <div className="absolute inset-0 rounded-xl shadow-inner" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold tracking-wider text-white transform transition-all duration-300 ease-out group-hover:scale-110">
                    GA
                  </span>
                </div>

                <div
                  className="absolute -right-1 -top-1 w-1.5 h-1.5 rounded-full bg-purple-300 dark:bg-purple-400 
                    transform transition-all duration-300 ease-out group-hover:scale-150 group-hover:opacity-75"
                />
                <div
                  className="absolute -left-0.5 -bottom-0.5 w-1 h-1 rounded-full bg-indigo-300 dark:bg-indigo-400 
                    transform transition-all duration-300 ease-out group-hover:scale-150 group-hover:opacity-75"
                />
              </div>
            </Link>

            <Link
              href="/"
              className="font-semibold text-base sm:text-lg hover:text-primary transition-colors"
            >
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
                      className="relative flex items-center gap-3 px-4 py-2 text-sm group   border border-slate-200/60 dark:border-gray-700/60 hover:bg-slate-100 dark:hover:bg-gray-700/60 shadow-sm rounded-lg transition-all duration-200"
                    >
                      <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <User className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {user.first_name}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          ({user.role})
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-56 p-2 bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border border-slate-200/60 dark:border-gray-700/60 shadow-lg rounded-lg"
                  >
                    <Link href="/profile" className="w-full">
                      <DropdownMenuItem className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-md cursor-pointer hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white focus:bg-indigo-100/50 dark:focus:bg-indigo-900/30">
                        <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <div className="flex flex-col">
                          <span>Profile</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            View and edit your profile
                          </span>
                        </div>
                      </DropdownMenuItem>
                    </Link>

                    <DropdownMenuSeparator className="my-2 border-slate-200/60 dark:border-gray-700/60" />

                    <DropdownMenuItem
                      onClick={logout}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-md cursor-pointer text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100/50 dark:hover:bg-red-900/30 focus:bg-red-100/50 dark:focus:bg-red-900/30"
                    >
                      <LogOut className="h-4 w-4" />
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
