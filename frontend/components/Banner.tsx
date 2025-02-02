import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AlertCircle, CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BannerState {
  show: boolean;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  showBanner: (message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
  hideBanner: () => void;
}

export const useBannerStore = create<BannerState>()(
  persist(
    (set) => ({
      show: false,
      message: '',
      type: 'info',
      showBanner: (message, type) => set({ show: true, message, type }),
      hideBanner: () => set({ show: false, message: '', type: 'info' })
    }),
    {
      name: 'banner-storage',
    }
  )
);

const BannerIcon = ({ type }) => {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <AlertCircle className="h-5 w-5" />
  };

  return icons[type] || icons.info;
};

export const Banner = () => {
  const { show, message, type, hideBanner } = useBannerStore();

  if (!show) return null;

  const variants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 }
  };

  const getStyles = () => {
    const styles = {
      success: {
        bg: "bg-emerald-50 dark:bg-emerald-900",
        text: "text-emerald-800 dark:text-emerald-200",
        border: "border-emerald-200 dark:border-emerald-800",
        hover: "hover:bg-emerald-100 dark:hover:bg-emerald-800"
      },
      error: {
        bg: "bg-rose-50 dark:bg-rose-900",
        text: "text-rose-800 dark:text-rose-200",
        border: "border-rose-200 dark:border-rose-800",
        hover: "hover:bg-rose-100 dark:hover:bg-rose-800"
      },
      warning: {
        bg: "bg-amber-50 dark:bg-amber-900",
        text: "text-amber-800 dark:text-amber-200",
        border: "border-amber-200 dark:border-amber-800",
        hover: "hover:bg-amber-100 dark:hover:bg-amber-800"
      },
      info: {
        bg: "bg-blue-50 dark:bg-blue-900",
        text: "text-blue-800 dark:text-blue-200",
        border: "border-blue-200 dark:border-blue-800",
        hover: "hover:bg-blue-100 dark:hover:bg-blue-800"
      }
    };

    return styles[type] || styles.info;
  };

  const styles = getStyles();

  return (
    <AnimatePresence>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-4 left-4 right-4 z-50"
      >
        <div className="max-w-3xl mx-auto">
          <div className={`rounded-lg shadow-lg border ${styles.bg} ${styles.border}`}>
            <div className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex-shrink-0 ${styles.text}`}>
                    <BannerIcon type={type} />
                  </div>
                  <p className={`text-sm font-medium ${styles.text} truncate`}>
                    {message}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={hideBanner}
                    className={`rounded-full p-1.5 transition-colors ${styles.text} ${styles.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-current`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const useBanner = () => {
  const { showBanner, hideBanner } = useBannerStore();
  return { showBanner, hideBanner };
};