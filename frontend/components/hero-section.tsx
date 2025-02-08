"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useAnimationFrame,
  useMotionValue,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dna, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
const STRAND_COUNT = 30;
const STRAND_LENGTH = 1000;

export function HeroSection() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale }}
      className="relative min-h-screen h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-50/80 dark:bg-gray-950"
    >
      
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-indigo-100/80 via-blue-50/50 to-slate-50/30 dark:from-indigo-950/40 dark:via-blue-950/40 dark:to-gray-950" />
      <div className="absolute inset-0 w-full h-full dark:bg-grid-white/[0.03] bg-grid-black/[0.025]" />
      <div 
        className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10 animate-gradient-x"
        style={{
          maskImage: 'radial-gradient(ellipse at center, black, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 60%)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50/90 dark:to-gray-950/80" />
      
      {/* Animated DNA Helix */}
      <DNAHelix />

      {/* Content */}
      <div className="container px-4 md:px-6 relative z-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-4 space-y-6"
        >
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 drop-shadow-sm mb-4">
            Revolutionizing Genome Annotation
          </h1>
          <p className="mx-auto max-w-[700px] text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Powerful tools for researchers and scientists to analyze, annotate,
            and visualize genomic data with unprecedented ease and accuracy.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-center gap-6 mt-8"
        >
          <Link href="/dashboard">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-8 py-6 text-lg shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-200"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/documentation">
            <Button
              variant="outline"
              size="lg"
              className="group border-2 border-slate-200 dark:border-gray-700 px-8 py-6 text-lg hover:bg-slate-100 dark:hover:bg-gray-800/50 transition-all duration-200"
            >
              Documentation
              <ArrowRight className="ml-2 h-5 w-5 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      

       
      </div>
     
    </motion.div>
  );
}

function DNAHelix() {
  const baseY = useMotionValue(0);

  useAnimationFrame((t) => {
    baseY.set((t / 50) % STRAND_LENGTH);
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(STRAND_COUNT)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            y: useTransform(
              baseY,
              (y) =>
                ((y + i * (STRAND_LENGTH / STRAND_COUNT)) % STRAND_LENGTH) -
                STRAND_LENGTH / 2
            ),
          }}
        >
          <DNAStrand />
        </motion.div>
      ))}
    </div>
  );
}

function DNAStrand() {
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 50C25 50 25 100 50 100C75 100 75 50 100 50"
        stroke="url(#dna-gradient)"
        strokeWidth="0.55"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0 50C25 50 25 0 50 0C75 0 75 50 100 50"
        stroke="url(#dna-gradient)"
        strokeWidth="0.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <defs>
        <linearGradient
          id="dna-gradient"
          x1="0"
          y1="0"
          x2="100"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="rgba(79, 70, 229, 0.4)" />
          <stop offset="0.5" stopColor="rgba(147, 51, 234, 0.3)" />
          <stop offset="1" stopColor="rgba(219, 39, 119, 0.3)" />
        </linearGradient>
      </defs>
    </svg>
  );
}