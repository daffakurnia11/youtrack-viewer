import { create } from "zustand"
import { createJSONStorage,persist } from "zustand/middleware"

import { Issue, SortOption,Sprint, State } from "@/types"

interface AppStore {
  // Auth & Settings
  authToken: string | null
  queryUsername: string
  tokenCreatedAt: string | null
  lastUsedAt: string | null
  activityLog: string[]

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
  setTokenCreatedAt: (date: string | null) => void
  setQueryUsername: (username: string) => void
  updateLastUsed: () => void
  checkSessionTimeout: () => boolean
  isSessionExpired: () => boolean

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
      tokenCreatedAt: null,
      lastUsedAt: null,
      activityLog: [],

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
      setAuthToken: (token) => set({
        authToken: token,
        tokenCreatedAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
        activityLog: [new Date().toISOString()],
      }),
      clearAuthToken: () => set({
        authToken: null,
        tokenCreatedAt: null,
        lastUsedAt: null,
        activityLog: [],
      }),
      setTokenCreatedAt: (date) => set({ tokenCreatedAt: date }),
      setQueryUsername: (username) => set({ queryUsername: username }),
      updateLastUsed: () => set((state) => {
        const now = new Date().toISOString();
        return {
          lastUsedAt: now,
          activityLog: [now, ...state.activityLog.slice(0, 9)], // Keep last 10 activities
        };
      }),
      checkSessionTimeout: (): boolean => {
        const state = useAppStore.getState();
        const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

        if (!state.lastUsedAt) return false;

        const lastUsed = new Date(state.lastUsedAt).getTime();
        const now = Date.now();
        const timeSinceLastUse = now - lastUsed;

        return timeSinceLastUse > SESSION_TIMEOUT_MS;
      },
      isSessionExpired: (): boolean => {
        const state = useAppStore.getState();
        const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

        if (!state.lastUsedAt) return false;

        const lastUsed = new Date(state.lastUsedAt).getTime();
        const now = Date.now();
        const timeSinceLastUse = now - lastUsed;

        return timeSinceLastUse > SESSION_TIMEOUT_MS;
      },

      // Actions - Board Data
      setSprints: (sprints: Sprint[]) => set({ sprints }),
      setStates: (states: State[]) => set({ states }),
      setSubtribes: (subtribes: State[]) => set({ subtribes }),
      setCurrentSprint: (sprint: { id: string } | null) => set({ currentSprint: sprint }),

      // Actions - Issues Data
      setIssues: (issues: Issue[]) => set({ issues }),
      clearIssues: () => set({ issues: [] }),

      // Actions - Filters
      setSelectedSprint: (sprint: string | null) => set({ selectedSprint: sprint }),
      setSelectedSprintData: (sprint: Sprint | null) => set({ selectedSprintData: sprint }),
      setSelectedStateIds: (stateIds: string[]) => set({ selectedStateIds: stateIds }),
      setSorts: (sorts: SortOption[]) => set({ sorts }),

      // Actions - UI State
      setShowSettingsModal: (show: boolean) => set({ showSettingsModal: show }),

      // Actions - Loading States
      setLoadingBoard: (loading: boolean) => set({ loadingBoard: loading }),
      setLoadingIssues: (loading: boolean) => set({ loadingIssues: loading }),

      // Actions - Error States
      setBoardError: (error: string | null) => set({ boardError: error }),
      setIssuesError: (error: string | null) => set({ issuesError: error }),

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
        tokenCreatedAt: state.tokenCreatedAt,
        lastUsedAt: state.lastUsedAt,
        activityLog: state.activityLog,
        sorts: state.sorts,
      }),
    }
  )
)
