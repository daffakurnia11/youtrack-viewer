import axios from "axios"
import { useCallback, useEffect } from "react"

import { useAppStore } from "@/store"

const AUTH_TOKEN_KEY = "AUTH_TOKEN"

// Helper to get token from localStorage directly (SSR-safe)
const getFromLocalStorage = (key: string) => {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function useBoardData() {
  const {
    sprints,
    states,
    subtribes,
    currentSprint,
    loadingBoard,
    boardError,
    authToken,
  } = useAppStore()

  const fetchBoard = useCallback(async () => {
    const store = useAppStore.getState()

    try {
      store.setLoadingBoard(true)
      store.setBoardError(null)

      // Check token from store or localStorage
      const token = authToken || getFromLocalStorage(AUTH_TOKEN_KEY)

      if (!token) {
        store.setLoadingBoard(false)
        return null
      }

      const headers = { Authorization: `Bearer ${token}` }

      const response = await axios.get("/api/board", { headers })
      const boardData = response.data

      store.setSprints(boardData.sprints || [])
      store.setStates(boardData.states || [])
      store.setSubtribes(boardData.subtribes || [])
      store.setCurrentSprint(boardData.currentSprint || null)

      return boardData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"

      if (axios.isAxiosError(err) && err.response?.status === 401) {
        store.clearAuthToken()
        store.setBoardError("Invalid token. Please enter a valid permanent token.")
        return null
      }

      store.setBoardError(`Failed to load board: ${errorMessage}`)
      return null
    } finally {
      store.setLoadingBoard(false)
    }
  }, [authToken])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  return {
    sprints,
    states,
    subtribes,
    currentSprint,
    loadingBoard,
    boardError,
    fetchBoard,
  }
}
