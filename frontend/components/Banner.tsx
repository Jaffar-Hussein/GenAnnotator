import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AlertCircle, X } from "lucide-react"

interface BannerState {
  show: boolean
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  showBanner: (message: string, type: 'info' | 'success' | 'error' | 'warning') => void
  hideBanner: () => void
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
)

export const Banner = () => {
  const { show, message, type, hideBanner } = useBannerStore()

  if (!show) return null

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20"
      case "error":
        return "bg-red-50 dark:bg-red-900/20" 
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20"
      default:
        return "bg-blue-50 dark:bg-blue-900/20"
    }
  }

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800 dark:text-green-200"
      case "error":
        return "text-red-800 dark:text-red-200"
      case "warning":
        return "text-yellow-800 dark:text-yellow-200"
      default:
        return "text-blue-800 dark:text-blue-200"
    }
  }

  return (
    <div className={`w-full ${getBgColor()}`}>
      <div className="max-w-7xl mx-auto py-2 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className={`flex p-2 rounded-lg ${getBgColor()}`}>
              <AlertCircle className={`h-5 w-5 ${getTextColor()}`} />
            </span>
            <p className={`ml-3 font-medium ${getTextColor()}`}>
              {message}
            </p>
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              onClick={hideBanner}
              className={`-mr-1 flex p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2 transition-opacity hover:opacity-75 ${getTextColor()}`}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for easy access in components
export const useBanner = () => {
  const { showBanner, hideBanner } = useBannerStore()
  return { showBanner, hideBanner }
}