import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Clock } from "lucide-react";

const PfamLoader = () => {
  const [phase, setPhase] = useState(0);
  const [domainCount, setDomainCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const counter = setInterval(() => {
      setDomainCount((prev) => (prev < 42 ? prev + 1 : prev));
    }, 100);
    return () => clearInterval(counter);
  }, []);

  const phases = [
    {
      title: "Scanning Sequence",
      subtitle: "Analyzing protein domains",
      detail: `${domainCount} domains identified`,
    },
    {
      title: "Processing Domains",
      subtitle: "Matching with PFAM database",
      detail: "Calculating confidence scores",
    },
    {
      title: "Analyzing Structure",
      subtitle: "Evaluating domain architecture",
      detail: "Identifying key motifs",
    },
    {
      title: "Finalizing Results",
      subtitle: "Preparing visualization",
      detail: "Generating domain report",
    },
  ];

  return (
   
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border dark:border-gray-700">
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Protein Sequence Visualization */}
          <div className="relative h-32 bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-hidden">
            {/* Background sequence representation */}
            <div className="absolute inset-0 flex items-center px-4">
              <div className="w-full h-8 bg-gray-100 dark:bg-gray-800 rounded-full" />
            </div>

            {/* Animated domains */}
            <div className="absolute inset-0 flex items-center px-4">
              <motion.div
                className="relative w-full h-8"
                animate={{
                  opacity: [1, 0.8, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                {/* Dynamic protein domains */}
                {[...Array(6)].map((_, index) => (
                  <motion.div
                    key={index}
                    className="absolute h-full rounded-lg"
                    style={{
                      left: `${index * 18}%`,
                      width: "15%",
                      backgroundColor: `hsl(${index * 30 + 200}, 70%, 60%)`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: [0, 10, 0],
                      transition: {
                        duration: 2,
                        delay: index * 0.2,
                        repeat: Infinity,
                      },
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg" />
                  </motion.div>
                ))}

                {/* Scanning effect */}
                <motion.div
                  className="absolute top-0 bottom-0 w-1 bg-indigo-500/50 rounded-full"
                  animate={{
                    left: [0, "100%"],
                    opacity: [0.8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <motion.div
                    className="absolute -top-4 -bottom-4 -left-6 -right-6 bg-indigo-500/20 blur-lg"
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Status Information */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                className="text-center space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {phases[phase].title}
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-300">
                  {phases[phase].subtitle}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {phases[phase].detail}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress Indicator */}
            <div className="w-full flex justify-center space-x-2">
              {[0, 1, 2, 3].map((dot) => (
                <motion.div
                  key={dot}
                  className={`w-2 h-2 rounded-full ${
                    dot === phase
                      ? "bg-indigo-500 dark:bg-indigo-400"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                  animate={
                    dot === phase
                      ? {
                          scale: [1, 1.3, 1],
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </div>
          <motion.div
    className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
  >
    <div className="flex items-center gap-3 text-center">
      <Bell className="w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
      <p className="text-base text-gray-600 dark:text-gray-300">
        You can work on something else. We'll send you a notification when your results are ready.
      </p>
    </div>
  </motion.div>
        </div>
      </CardContent>
    </Card>
    
  );
};

export default PfamLoader;
