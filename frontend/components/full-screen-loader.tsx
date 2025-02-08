import React from "react";
import { motion } from "framer-motion";

const GenomicLoader = () => {
  const bars = Array(30).fill(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const barVariants = {
    hidden: {
      scaleY: 0,
      height: "40%",
    },
    show: {
      scaleY: [0, 1, 0.5],
      height: ["40%", "80%", "40%"],
      transition: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 2,
        ease: "easeInOut",
      },
    },
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const textVariants = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
      <motion.div
        className="relative flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Sequence visualization */}
        <div className="absolute -inset-20 flex items-center justify-center opacity-30">
          <motion.div className="flex gap-1 h-40" variants={containerVariants}>
            {bars.map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-indigo-500 dark:bg-indigo-400 rounded-full origin-bottom"
                variants={barVariants}
                custom={i}
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Main logo */}
        <motion.div
          className="relative w-24 h-24"
          variants={logoVariants}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {/* Base with gradient */}
          <div
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 
                       dark:from-indigo-400 dark:to-purple-500 overflow-hidden"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
            <div className="absolute inset-0 rounded-xl shadow-inner" />
          </div>

          {/* GA Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold tracking-wider text-white">
              GA
            </span>
          </div>

          {/* Animated dots */}
          <motion.div
            className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-purple-300 dark:bg-purple-400"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -left-0.5 -bottom-0.5 w-1.5 h-1.5 rounded-full bg-indigo-300 dark:bg-indigo-400"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />

          {/* Rotating rings */}
          <motion.div
            className="absolute -inset-4 rounded-full border border-indigo-500/20 dark:border-indigo-400/20"
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute -inset-8 rounded-full border border-purple-500/10 dark:border-purple-400/10"
            animate={{ rotate: -360 }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GenomicLoader;
