import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const toastTypes = {
  success: {
    icon: CheckCircle2,
    className: 'border-green-500',
    iconClass: 'text-green-500 dark:text-green-400',
    titleClass: 'text-green-800 dark:text-green-200',
    messageClass: 'text-green-700 dark:text-green-300',
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  },
  error: {
    icon: XCircle,
    className: 'border-red-500',
    iconClass: 'text-red-500 dark:text-red-400',
    titleClass: 'text-red-800 dark:text-red-200',
    messageClass: 'text-red-700 dark:text-red-300',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-yellow-500',
    iconClass: 'text-yellow-500 dark:text-yellow-400',
    titleClass: 'text-yellow-800 dark:text-yellow-200',
    messageClass: 'text-yellow-700 dark:text-yellow-300',
    badgeClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
  },
  info: {
    icon: Info,
    className: 'border-blue-500',
    iconClass: 'text-blue-500 dark:text-blue-400',
    titleClass: 'text-blue-800 dark:text-blue-200',
    messageClass: 'text-blue-700 dark:text-blue-300',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  }
};

interface ToastProps {
  show: boolean;
  type?: keyof typeof toastTypes;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  badges?: string[];
  icon?: React.ReactNode;
  content?: React.ReactNode;
}

const Toast = ({ 
  show = false, 
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  badges = [],
  icon,
  content
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVisible && duration > 0) {
      timer = setTimeout(handleClose, duration);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, duration]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible]);

  const toastConfig = toastTypes[type];
  const Icon = icon ? () => <>{icon}</> : toastConfig.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 max-w-md w-full z-50"
          role="alert"
        >
          <div className={`rounded-lg shadow-lg overflow-hidden bg-white dark:bg-gray-800 border-l-4 ${toastConfig.className}`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 ${toastConfig.iconClass}`} />
                  <h3 className={`text-lg font-medium ${toastConfig.titleClass}`}>
                    {title}
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 
                           dark:hover:text-gray-300 transition-colors p-1 rounded-full
                           hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Close notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {message && (
                <p className={`text-sm ${toastConfig.messageClass}`}>
                  {message}
                </p>
              )}

              {badges && badges.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {badges.map((badge, index) => (
                    <Badge key={index} className={toastConfig.badgeClass}>
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}

              {content && (
                <div className="mt-2">
                  {content}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;


// Usage examples:


// // Basic success toast
// <Toast
//   show={showToast}
//   type="success"
//   title="Success"
//   message="Operation completed successfully"
// />

// // Toast with badges
// <Toast
//   show={showToast}
//   type="info"
//   title="Assignment Status"
//   badges={['10 genes', 'VALIDATOR']}
//   message="Genes assigned successfully"
// />

// // Custom content
// <Toast
//   show={showToast}
//   type="success"
//   title="Assignment Complete"
//   content={
//     <div className="flex items-center gap-2">
//       <UserIcon className="h-4 w-4" />
//       <span>Assigned to John Doe</span>
//     </div>
//   }
// />