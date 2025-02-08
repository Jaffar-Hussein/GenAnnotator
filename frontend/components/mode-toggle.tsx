import * as React from "react"
import { Moon, Sun, Laptop } from 'lucide-react'
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const buttonVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    tap: { scale: 0.98 },
    hover: { scale: 1.02 }
  }

  return (
    <motion.div 
      className="flex items-center gap-2   rounded-xl "
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
    >
      {[
        { id: 'light', icon: Sun, label: 'Light' },
        { id: 'dark', icon: Moon, label: 'Dark' },
        { id: 'system', icon: Laptop, label: 'System' }
      ].map(({ id, icon: Icon, label }) => (
        <motion.button
          key={id}
          onClick={() => setTheme(id)}
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileTap="tap"
          whileHover="hover"
          className={`
            relative px-4 py-2 rounded-lg text-sm font-medium
            transition-colors duration-200
            ${theme === id 
              ? 'text-indigo-500 dark:text-indigo-400 bg-indigo-100/50 dark:bg-indigo-900/30' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-700/60'
            }
          `}
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </div>
          {theme === id && (
            <motion.div
              layoutId="activeTheme"
              className="absolute inset-0 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-lg -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.button>
      ))}
    </motion.div>
  )
}

export default ModeToggle;