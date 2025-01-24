'use client'

import { Shield, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 mx-auto bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center">
            <Shield className="w-12 h-12 text-indigo-600 dark:text-indigo-300" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="text-4xl font-bold tracking-tight">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            Sorry, but you don't have permission to access this page. Please check your credentials or contact your administrator for assistance.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
        >
          <Button
            variant="outline"
            className="group"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Go Back
          </Button>
          
          <Button asChild>
            <Link href="/" className="group">
              <Home className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
              Return Home
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="pt-8 text-sm text-muted-foreground"
        >
          <p>
            If you believe this is a mistake, please{' '}
            <Link 
              href="/support" 
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              contact support
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}