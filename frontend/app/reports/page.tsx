
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"


export default function Genomes() {
  return (
    <div className="container max-w-7xl mx-auto p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Welcome Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, Jaffar</h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your reports today.
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button>
              Create New Project
            </Button>
          </div>
        </div>

       
      </motion.div>
    </div>
  )
}

