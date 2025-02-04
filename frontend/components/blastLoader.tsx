import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Bell } from 'lucide-react';

const BlastLoader = () => {
  const [phase, setPhase] = useState(0);
  const [matchCount, setMatchCount] = useState(0);

  // Sequence data
  const querySequence = "ATGCCGTAAGGCTAGCTAGCTAG";
  const dbSequence =   "ATGCCGTAA--CTAGCTAGCTAG";
  const matchLine =    "|||||||**  ||||||||||||";

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const counter = setInterval(() => {
      setMatchCount(prev => (prev < 256 ? prev + 1 : prev));
    }, 50);
    return () => clearInterval(counter);
  }, []);

  const phases = [
    {
      title: "Searching Database",
      subtitle: `${matchCount} sequences analyzed`,
      detail: "Finding potential matches"
    },
    {
      title: "Local Alignment",
      subtitle: "Calculating alignment scores",
      detail: "Extending high-scoring pairs"
    },
    {
      title: "Computing E-values",
      subtitle: "Evaluating significance",
      detail: "Filtering significant matches"
    },
    {
      title: "Generating Report",
      subtitle: "Preparing visualization",
      detail: "Organizing results"
    }
  ];

  // Function to render sequence characters with animation
  const renderSequence = (sequence, delay = 0) => {
    return sequence.split('').map((char, index) => (
      <motion.span
        key={index}
        className={`inline-block font-mono ${
          char === '|' ? 'text-green-500 dark:text-green-400' :
          char === '*' ? 'text-yellow-500 dark:text-yellow-400' :
          char === '-' ? 'text-red-500 dark:text-red-400' :
          'text-gray-800 dark:text-gray-200'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + index * 0.02 }}
      >
        {char}
      </motion.span>
    ));
  };

  return (
    
      <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border dark:border-gray-700">
        <CardContent className="p-8">
          <div className="space-y-8">
            {/* Sequence Alignment Visualization */}
            <div className="relative p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-hidden font-mono">
              {/* Database scanning visualization */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              {/* Sequence alignment display */}
              <div className="relative space-y-1">
                <div className="flex space-x-4">
                  <span className="w-16 text-gray-500 dark:text-gray-400">Query</span>
                  <div className="flex-1 overflow-hidden">
                    {renderSequence(querySequence)}
                  </div>
                </div>
                <div className="flex space-x-4">
                  <span className="w-16 text-gray-500 dark:text-gray-400">Match</span>
                  <div className="flex-1 overflow-hidden">
                    {renderSequence(matchLine, 0.5)}
                  </div>
                </div>
                <div className="flex space-x-4">
                  <span className="w-16 text-gray-500 dark:text-gray-400">Subject</span>
                  <div className="flex-1 overflow-hidden">
                    {renderSequence(dbSequence, 1)}
                  </div>
                </div>
              </div>

              {/* Score visualization */}
              <motion.div
                className="absolute right-4 top-4 text-sm font-sans"
                animate={{
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                <div className="text-right">
                  <span className="text-gray-600 dark:text-gray-300">Score: </span>
                  <span className="text-indigo-600 dark:text-indigo-400">245</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-600 dark:text-gray-300">E-value: </span>
                  <span className="text-indigo-600 dark:text-indigo-400">1e-52</span>
                </div>
              </motion.div>
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

              {/* Progress Dots */}
              <div className="w-full flex justify-center space-x-2">
                {[0, 1, 2, 3].map((dot) => (
                  <motion.div
                    key={dot}
                    className={`w-2 h-2 rounded-full ${
                      dot === phase 
                        ? 'bg-indigo-500 dark:bg-indigo-400' 
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                    animate={dot === phase ? {
                      scale: [1, 1.3, 1],
                    } : {}}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity
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

export default BlastLoader;