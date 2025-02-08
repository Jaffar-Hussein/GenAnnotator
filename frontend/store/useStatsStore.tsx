import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { persist } from "zustand/middleware";
interface GenomeOverview {
  genome: string;
  total: number;
  annotated: number;
  ratio: number;
}

interface GenomeStats {
  count: number;
  average_length: number;
  total_nt: number;
  fully_annotated: number;
  in_progress: number;
  new: number;
  overview: GenomeOverview[];
}

interface GeneStats {
  count: number;
  average_length: number;
  average_gc_content: number;
}

interface PeptideStats {
  count: number;
  average_length: number;
}

interface AnnotationStatus {
  status: string;
  count: number;
  ratio: number;
}

interface Statistics {
  genome: GenomeStats;
  gene: GeneStats;
  peptide: PeptideStats;
  annotation: AnnotationStatus[];
}

interface StatsStore {
  stats: Statistics | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

// Create the store
const useStatsStore = create<StatsStore>()(
  persist(
    (set) => ({
      stats: null,
      isLoading: false,
      error: null,
      fetchStats: async () => {
        set({ isLoading: true, error: null });
        try {
            console.log("fetching stat%%%s");
          const accessToken = useAuthStore.getState().accessToken;

          const response = await fetch(
            "http://127.0.0.1:8000/data/api/stats/",
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch statistics");
          }

          const data = await response.json();
          set({ stats: data, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
    }),
    {
      name: "stats-storage",
      partialize: (state) => ({ stats: state.stats }),
    }
  )
);

export default useStatsStore;
