import axios from "axios"
import { useCallback } from "react"

import { buildQuery, buildSortFilter, buildStateFilter, DEFAULT_ISSUE_FIELDS } from "@/lib/youTrackQuery"
import { useAppStore } from "@/store"
import { SortOption } from "@/types"

export function useIssuesData() {
  const {
    states,
    issues,
    loadingIssues,
    issuesError,
    authToken,
    queryUsername,
    selectedSprint,
    selectedStateIds,
    sorts,
  } = useAppStore()

  const fetchIssues = useCallback(
    async (sprintName?: string, stateIds?: string[], sortOptions?: SortOption[]) => {
      const store = useAppStore.getState()
      const finalSprint = sprintName ?? selectedSprint
      const finalStateIds = stateIds ?? selectedStateIds
      const finalSorts = sortOptions ?? sorts

      if (!finalSprint) {
        store.setIssues([])
        return null
      }

      try {
        store.setLoadingIssues(true)
        store.setIssuesError(null)

        if (!authToken) {
          store.setLoadingIssues(false)
          return null
        }

        // Build query prefix
        const BOARD_NAME = "Board Employer Kanban"
        const queryPrefix = queryUsername ? `#${queryUsername} {${BOARD_NAME}}:` : ""

        const stateFilter = buildStateFilter(states, finalStateIds)
        const sortFilter = buildSortFilter(finalSorts)
        const query = buildQuery(finalSprint, stateFilter, sortFilter, queryPrefix)

        const headers = { Authorization: `Bearer ${authToken}` }

        const response = await axios.get("/api/issues", {
          params: { query, fields: DEFAULT_ISSUE_FIELDS },
          headers,
        })

        store.setIssues(response.data || [])
        store.updateLastUsed() // Track activity
        return response.data || []
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error"

        if (axios.isAxiosError(err) && err.response?.status === 401) {
          store.clearAuthToken()
          store.setIssuesError("Invalid token. Please enter a valid permanent token.")
          return null
        }

        store.setIssuesError(`Failed to load issues: ${errorMessage}`)
        return null
      } finally {
        store.setLoadingIssues(false)
      }
    },
    [states, authToken, queryUsername, selectedSprint, selectedStateIds, sorts]
  )

  const clearIssues = useCallback(() => {
    const store = useAppStore.getState()
    store.setIssues([])
    store.setIssuesError(null)
  }, [])

  return {
    issues,
    loadingIssues,
    issuesError,
    fetchIssues,
    clearIssues,
  }
}
