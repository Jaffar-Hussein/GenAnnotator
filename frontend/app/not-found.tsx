'use client'
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Ghost, Home, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Flickering Grid Background */}
      <div className="absolute inset-0">
        <FlickeringGrid
          className="relative inset-0 z-0 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
          squareSize={4}
          gridGap={6}
          color="rgb(147, 51, 234)"
          maxOpacity={0.3}
          flickerChance={0.1}
          height={1200}
          width={1200}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full space-y-8 text-center">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 mx-auto  rounded-xl flex items-center justify-center">
            <Ghost className="w-12 h-12 text-indigo-600 dark:text-indigo-300" />
          </div>
        </motion.div>
        
        {/* Text Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Oops! It seems like you've ventured into uncharted territory. The page you're looking for has vanished into the digital void.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
        >
          <Button
            variant="outline"
            className="group bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-gray-200 dark:border-gray-800"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Go Back
          </Button>
          
          <Button 
            asChild
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white"
          >
            <Link href="/" className="group">
              <Home className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
              Return Home
            </Link>
          </Button>
        </motion.div>

        {/* Support Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="pt-8 text-sm text-gray-600 dark:text-gray-400"
        >
          <p>
            Need help finding something? {' '}
            <Link 
              href="/support" 
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Contact our support team
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}