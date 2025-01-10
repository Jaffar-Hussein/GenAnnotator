'use client'

import { motion } from "framer-motion"
import { Database, Dna, FlaskRoundIcon as Flask, LineChart, Network, Search } from 'lucide-react'
import { cn } from "@/lib/utils"
import Link from 'next/link'

const features = [
  {
    icon: Database,
    title: "Genome Data Management",
    description: "Store, manage, and filter E. coli genomic data effortlessly in a secure environment.",
    gradient: "from-blue-500/10 to-blue-500/5"
  },
  {
    icon: Dna,
    title: "Annotation & Validation Workflow",
    description: "Add new annotations, review them, and approve or reject with feedback—all in one place.",
    gradient: "from-purple-500/10 to-purple-500/5"
  },
  {
    icon: Search,
    title: "Powerful Sequence Analysis",
    description: "Conduct BLAST queries, domain analysis, and advanced searches to unlock genomic insights.",
    gradient: "from-indigo-500/10 to-indigo-500/5"
  },
  {
    icon: Network,
    title: "Role-Based Access & Collaboration",
    description: "Assign roles (Reader, Annotator, Validator, Admin) and streamline teamwork across projects.",
    gradient: "from-pink-500/10 to-pink-500/5"
  },
  {
    icon: LineChart,
    title: "Genome Visualization",
    description: "Explore each genome graphically with clickable genes and optional PFAM domain highlights.",
    gradient: "from-cyan-500/10 to-cyan-500/5"
  },
  {
    icon: Flask,
    title: "External Database Integration",
    description: "Enrich your analysis by seamlessly pulling in data from PFAM and other external resources.",
    gradient: "from-emerald-500/10 to-emerald-500/5"
  },
]

export function FeatureSection() {
  return (
    <section id="features" className="relative overflow-hidden pb-16">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-6">
              Powerful Features for Genomic Research
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Streamline your genomic research workflow with our comprehensive suite of tools designed for efficiency and accuracy.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={cn(
                "group relative h-full p-8 rounded-2xl transition-all duration-300",
                "hover:shadow-lg hover:scale-[1.02]",
                "bg-gradient-to-br border border-primary/10",
                feature.gradient
              )}>
                <div className="relative z-10">
                  <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Link
            href="/documentation"
            className={cn(
              "inline-flex items-center justify-center",
              "px-8 py-4 rounded-full",
              "text-primary-foreground font-medium",
              "bg-gradient-to-r from-primary to-primary/80",
              "hover:from-primary/90 hover:to-primary/70",
              "transition-all duration-300 hover:scale-105",
              "shadow-lg shadow-primary/25"
            )}
          >
            Explore All Features
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

