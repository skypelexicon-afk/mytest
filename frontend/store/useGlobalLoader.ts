import { create } from 'zustand'

interface LoaderStore {
  loadingCount: number
  startLoading: () => void
  stopLoading: () => void
}

export const useGlobalLoader = create<LoaderStore>((set, get) => ({
  loadingCount: 0,

  startLoading: () => {
    set((state) => ({ loadingCount: state.loadingCount + 1 }));
  },

  stopLoading: () => {
    set((state) => ({ loadingCount: Math.max(0, state.loadingCount - 1) }));
  },
}));
