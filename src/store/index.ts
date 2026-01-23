import { create } from "zustand"
import { createJSONStorage,persist } from "zustand/middleware"

import { Issue, SortOption,Sprint, State } from "@/types"

interface AppStore {
  // Auth & Settings
  authToken: string | null
  queryUsername: string

  // Board Data
  sprints: Sprint[]
  states: State[]
  subtribes: State[]
  currentSprint: { id: string } | null

  // Issues Data
  issues: Issue[]

  // Filters
  selectedSprint: string | null
  selectedSprintData: Sprint | null
  selectedStateIds: string[]
  sorts: SortOption[]

  // UI State
  showSettingsModal: boolean

  // Loading States
  loadingBoard: boolean
  loadingIssues: boolean

  // Error States
  boardError: string | null
  issuesError: string | null

  // Actions - Auth & Settings
  setAuthToken: (token: string) => void
  clearAuthToken: () => void
  setQueryUsername: (username: string) => void

  // Actions - Board Data
  setSprints: (sprints: Sprint[]) => void
  setStates: (states: State[]) => void
  setSubtribes: (subtribes: State[]) => void
  setCurrentSprint: (sprint: { id: string } | null) => void

  // Actions - Issues Data
  setIssues: (issues: Issue[]) => void
  clearIssues: () => void

  // Actions - Filters
  setSelectedSprint: (sprint: string | null) => void
  setSelectedSprintData: (sprint: Sprint | null) => void
  setSelectedStateIds: (stateIds: string[]) => void
  setSorts: (sorts: SortOption[]) => void

  // Actions - UI State
  setShowSettingsModal: (show: boolean) => void

  // Actions - Loading States
  setLoadingBoard: (loading: boolean) => void
  setLoadingIssues: (loading: boolean) => void

  // Actions - Error States
  setBoardError: (error: string | null) => void
  setIssuesError: (error: string | null) => void

  // Actions - Reset
  resetFilters: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Initial State - Auth & Settings
      authToken: null,
      queryUsername: "",

      // Initial State - Board Data
      sprints: [],
      states: [],
      subtribes: [],
      currentSprint: null,

      // Initial State - Issues Data
      issues: [],

      // Initial State - Filters
      selectedSprint: null,
      selectedSprintData: null,
      selectedStateIds: [],
      sorts: [],

      // Initial State - UI
      showSettingsModal: false,

      // Initial State - Loading
      loadingBoard: false,
      loadingIssues: false,

      // Initial State - Errors
      boardError: null,
      issuesError: null,

      // Actions - Auth & Settings
      setAuthToken: (token) => set({ authToken: token }),
      clearAuthToken: () => set({ authToken: null }),
      setQueryUsername: (username) => set({ queryUsername: username }),

      // Actions - Board Data
      setSprints: (sprints) => set({ sprints }),
      setStates: (states) => set({ states }),
      setSubtribes: (subtribes) => set({ subtribes }),
      setCurrentSprint: (sprint) => set({ currentSprint: sprint }),

      // Actions - Issues Data
      setIssues: (issues) => set({ issues }),
      clearIssues: () => set({ issues: [] }),

      // Actions - Filters
      setSelectedSprint: (sprint) => set({ selectedSprint: sprint }),
      setSelectedSprintData: (sprint) => set({ selectedSprintData: sprint }),
      setSelectedStateIds: (stateIds) => set({ selectedStateIds: stateIds }),
      setSorts: (sorts) => set({ sorts }),

      // Actions - UI State
      setShowSettingsModal: (show) => set({ showSettingsModal: show }),

      // Actions - Loading States
      setLoadingBoard: (loading) => set({ loadingBoard: loading }),
      setLoadingIssues: (loading) => set({ loadingIssues: loading }),

      // Actions - Error States
      setBoardError: (error) => set({ boardError: error }),
      setIssuesError: (error) => set({ issuesError: error }),

      // Actions - Reset
      resetFilters: () => set({
        selectedSprint: null,
        selectedSprintData: null,
        selectedStateIds: [],
        sorts: [],
      }),
    }),
    {
      name: "youtrack-viewer-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields to localStorage
      partialize: (state) => ({
        authToken: state.authToken,
        queryUsername: state.queryUsername,
        sorts: state.sorts,
      }),
    }
  )
)
