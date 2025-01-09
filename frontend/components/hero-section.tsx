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
      className="relative min-h-screen h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 w-full h-full dark:bg-grid-white/[0.05] bg-grid-black/[0.05]" />
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center  [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <DNAHelix />

      {/* Content */}
      <div className="container px-4 md:px-6 relative z-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-4"
        >
          <h1 className="text-4xl pb-2 font-bold tracking-tighter sm:text-5xl md:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500 mb-4">
            Revolutionizing Genome Annotation
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl dark:text-gray-400 mb-8">
            Powerful tools for researchers and scientists to analyze, annotate,
            and visualize genomic data with unprecedented ease and accuracy.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          {isAuthenticated ? (
            <Link href="/signup">
              <Button
                size="lg"
                className="group bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          ) : (
            <Link href="/signup">
              <Button
                size="lg"
                className="group bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          )}
          <Link href="/documentation">
            <Button variant="outline" size="lg" className="group">
              Documentation
              <ArrowRight className="ml-2 h-4 w-4 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16"
        >
          <Dna className="h-16 w-16 mx-auto text-primary animate-pulse" />
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
          <stop stopColor="rgba(99, 102, 241, 0.2)" />
          <stop offset="0.5" stopColor="rgba(168, 85, 247, 0.1)" />
          <stop offset="1" stopColor="rgba(236, 72, 153, 0.1)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
