import { create } from 'zustand'
import { useEffect } from 'react'
import { useBanner } from '@/components/Banner'
import { useAuthStore } from '@/store/useAuthStore'

interface BlastResult {
  [key: string]: any
}

interface BlastStore {
  taskKey: string | null
  isLoading: boolean
  isPolling: boolean
  error: string | null
  results: BlastResult | null
  pollInterval: NodeJS.Timeout | null
  setTaskKey: (key: string | null) => void
  setError: (error: string | null) => void
  setIsLoading: (loading: boolean) => void
  setIsPolling: (polling: boolean) => void
  setResults: (results: BlastResult | null) => void
  startPolling: (accessToken: string, username: string, showBanner: (message: string, type: string) => void) => void
  stopPolling: () => void
}

// Create a persistent store for BLAST results
const useBlastStore = create<BlastStore>((set, get) => ({
  taskKey: null,
  isLoading: false,
  isPolling: false,
  error: null,
  results: null,
  pollInterval: null,

  setTaskKey: (key) => set({ taskKey: key }),
  setError: (error) => set({ error }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsPolling: (polling) => set({ isPolling: polling }),
  setResults: (results) => set({ results }),

  startPolling: (accessToken: string, username: string, showBanner) => {
    const store = get()
    if (store.pollInterval) return // Don't start if already polling

    const POLLING_INTERVAL = 2000 // 2 seconds

    const checkTaskStatus = async () => {
      const currentTaskKey = get().taskKey
      if (!currentTaskKey) return

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/data/api/tasks/?user=${username}&state=COMPLETED`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            }
          }
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch task status')
        }

        const tasks = await response.json()
        const currentTask = tasks.find(task => task.key === currentTaskKey)

        if (currentTask) {
          if (currentTask.state === 'COMPLETED') {
            try {
              const resultResponse = await fetch(
                `http://127.0.0.1:8000/data/api/blast/?key=${currentTaskKey}`,
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                  }
                }
              )
              
              if (!resultResponse.ok) {
                throw new Error('Failed to fetch BLAST results')
              }

              const resultData = await resultResponse.json()
              set({ results: resultData })
              showBanner('BLAST analysis completed successfully!', 'success')
            } catch (error) {
              showBanner('Failed to fetch BLAST results', 'error')
            } finally {
              get().stopPolling()
              set({ taskKey: null })
            }
          } else if (currentTask.error_message) {
            showBanner(`BLAST analysis failed: ${currentTask.error_message}`, 'error')
            get().stopPolling()
            set({ taskKey: null })
          }
        }
      } catch (error) {
        console.error('Error checking task status:', error)
        showBanner('Failed to check BLAST status', 'error')
        get().stopPolling()
        set({ taskKey: null })
      }
    }

    const interval = setInterval(checkTaskStatus, POLLING_INTERVAL)
    set({ pollInterval: interval, isPolling: true })
    // Run initial check
    checkTaskStatus()
  },

  stopPolling: () => {
    const { pollInterval } = get()
    if (pollInterval) {
      clearInterval(pollInterval)
      set({ pollInterval: null, isPolling: false })
    }
  },
}))

export function useBlastTask() {
  const { showBanner } = useBanner()
  const accessToken = useAuthStore((state) => state.accessToken)
  const username = useAuthStore((state) => state.user?.username)
  const store = useBlastStore()

  const runBlast = async (gene: string) => {
    store.setIsLoading(true)
    store.setError(null)
    store.setResults(null) // Clear previous results
    
    try {
      const response = await fetch('http://127.0.0.1:8000/data/api/blast/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ gene }),
      })

      if (!response.ok) {
        throw new Error('Failed to start BLAST analysis')
      }

      const data = await response.json()
      
      if (response.status === 202) {
        // Task accepted, needs polling
        store.setTaskKey(data.key)
        store.startPolling(accessToken, username!, showBanner)
        showBanner('BLAST analysis started', 'info')
      } else if (response.status === 200) {
        // Immediate results available
        store.setResults(data)
        showBanner('BLAST results retrieved from cache', 'success')
      }
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to start BLAST')
      showBanner('Failed to start BLAST analysis', 'error')
    } finally {
      store.setIsLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      // Only cleanup loading and error states, keep results and polling
      store.setIsLoading(false)
      store.setError(null)
    }
  }, [])

  return {
    runBlast,
    isLoading: store.isLoading,
    error: store.error,
    taskKey: store.taskKey,
    isPolling: store.isPolling,
    results: store.results,
  }
}