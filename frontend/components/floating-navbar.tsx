"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { User, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const FloatingNav = ({
  className,
}: {
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  // const user = { name: "John Doe", role: "Annotator" };
  const simulateLogin = () => {
    setUser({ name: "John Doe", role: "Annotator" });
  };

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY) { // if scroll down hide the navbar
          setIsVisible(false);
        } else { // if scroll up show the navbar
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);

      // cleanup function
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : -10
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex fixed top-4 inset-x-0 mx-auto w-[95%] max-w-7xl rounded-full border border-transparent bg-white/80 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] backdrop-blur-[8px] dark:bg-gray-800/80 z-[100] px-4 py-2 sm:py-3 sm:px-6 lg:px-8",
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
              onClick={() => scrollToSection('features')}
            >
              Features
            </Button>
            <Button 
              variant="ghost" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-1 sm:p-2"
              onClick={() => scrollToSection('contact')}
            >
              Contact
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 text-xs sm:text-sm">
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{user.name}</span>
                    <span className="text-xs text-gray-500 hidden sm:inline">({user.role})</span>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setUser(null)}>
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-1 sm:p-2"
                    onClick={simulateLogin}
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

