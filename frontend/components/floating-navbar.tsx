"use client";

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
  const [lastScrollY, setLastScrollY] = useState(0);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY) {
          // if scroll down hide the navbar
          setIsVisible(false);
        } else {
          // if scroll up show the navbar
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);

      // cleanup function
      return () => {
        window.removeEventListener("scroll", controlNavbar);
      };
    }
  }, [lastScrollY]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      const yOffset = -100;
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
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "flex fixed top-4 inset-x-0 mx-auto w-full max-w-7xl rounded-full border border-transparent bg-white/80 shadow-lg backdrop-blur-md dark:bg-gray-800/90 z-[100] px-4 py-2 sm:py-3 sm:px-6 lg:px-8",
          className
        )}
      >
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="font-semibold text-base sm:text-lg">
            Genome Annotator
          </Link>
          <div className="flex items-center gap-2 sm:gap-6">
            <Button
              variant="ghost"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-1 sm:p-2"
              onClick={() => scrollToSection("features")}
            >
              Features
            </Button>
            <Button
              variant="ghost"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-1 sm:p-2"
              onClick={() => scrollToSection("footer")}
            >
              Contact
            </Button>
            {isAuthenticated && user ? (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-1 sm:p-2"
                  >
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-sm"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {user.first_name}
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        ({user.role})
                      </span>
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-4">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <Link href="/profile">
                      <DropdownMenuItem>
                        <User className="w-4 h-4 mr-2" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="w-4 h-4 mr-2" />
                      <span>Notifications</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => logout()}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-1 sm:p-2"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup" className="hidden sm:block">
                  <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-4">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            <ModeToggle />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
