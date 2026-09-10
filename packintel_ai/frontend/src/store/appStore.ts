import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  demoMode: boolean
  setDemoMode: (value: boolean) => void
  toggleDemoMode: () => void
  backendConnected: boolean
  setBackendConnected: (value: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      demoMode: true,
      setDemoMode: (value) => set({ demoMode: value }),
      toggleDemoMode: () => set((s) => ({ demoMode: !s.demoMode })),
      backendConnected: false,
      setBackendConnected: (value) => set({ backendConnected: value }),
    }),
    { name: 'packintel-app-store' }
  )
)
