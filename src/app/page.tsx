"use client";

import { useEffect, useMemo } from "react";

import { BoardFilters } from "@/components/BoardFilters";
import { BoardHeader } from "@/components/BoardHeader";
import { BoardStats } from "@/components/BoardStats";
import { ErrorState } from "@/components/ErrorState";
import { IssueList } from "@/components/IssueList";
import { LoadingState } from "@/components/LoadingState";
import { QueryDisplay } from "@/components/QueryDisplay";
import { SettingsModal } from "@/components/SettingsModal";
import { SprintMarkdownGenerator } from "@/components/SprintMarkdownGenerator";
import { SprintSelector } from "@/components/SprintSelector";
import { Card, CardContent } from "@/components/ui/card";
import { useBoardData } from "@/hooks/useBoardData";
import { useIssuesData } from "@/hooks/useIssuesData";
import {
  buildQuery,
  buildSortFilter,
  buildStateFilter,
} from "@/lib/youTrackQuery";
import { useAppStore } from "@/store";
import { SortOption } from "@/types";

const BOARD_NAME = "Board Employer Kanban";

// Helper to build the full query prefix
const buildQueryPrefix = (username: string) => {
  if (!username) return "";
  return `#${username} {${BOARD_NAME}}:`;
};

export default function Home() {
  // Get state and actions from Zustand store
  const {
    sprints,
    states,
    selectedSprint,
    selectedSprintData,
    selectedStateIds,
    sorts,
    issues,
    loadingBoard,
    loadingIssues,
    boardError,
    issuesError,
    queryUsername,
    showSettingsModal,
    currentSprint,
    setSelectedSprint,
    setSelectedSprintData,
    setSelectedStateIds,
    setSorts,
    setShowSettingsModal,
    setQueryUsername,
  } = useAppStore();

  useBoardData();
  const { fetchIssues } = useIssuesData();

  // Set current sprint as default when board is loaded
  useEffect(() => {
    if (!currentSprint || sprints.length === 0) return;

    const currentSprintData = sprints.find((s) => s.id === currentSprint.id);
    if (currentSprintData && !selectedSprint) {
      setSelectedSprint(currentSprintData.name);
      setSelectedSprintData(currentSprintData);
    }
  }, [
    currentSprint,
    sprints,
    selectedSprint,
    setSelectedSprint,
    setSelectedSprintData,
  ]);

  const handleSprintChange = (sprintName: string) => {
    setSelectedSprint(sprintName);

    if (!sprintName) {
      setSelectedSprintData(null);
      return;
    }

    const sprintData = sprints.find((s) => s.name === sprintName) || null;
    setSelectedSprintData(sprintData);

    fetchIssues(sprintName, selectedStateIds, sorts);
  };

  const handleStateChange = (newStateIds: string[]) => {
    setSelectedStateIds(newStateIds);

    if (selectedSprint) {
      fetchIssues(selectedSprint, newStateIds, sorts);
    }
  };

  const handleSortsChange = (newSorts: SortOption[]) => {
    setSorts(newSorts);

    if (selectedSprint) {
      fetchIssues(selectedSprint, selectedStateIds, newSorts);
    }
  };

  const handleRefresh = () => {
    if (!selectedSprint) {
      alert("Please select a sprint first");
      return;
    }

    fetchIssues(selectedSprint, selectedStateIds, sorts);
  };

  const handleSettings = () => {
    setShowSettingsModal(true);
  };

  const handleCloseSettingsModal = () => {
    setShowSettingsModal(false);
  };

  const handleUsernameChange = (newUsername: string) => {
    setQueryUsername(newUsername);
  };

  const error = boardError || issuesError;

  // Calculate total story points
  const totalStoryPoints = useMemo(() => {
    return issues.reduce((total, issue) => {
      const fields = issue.fields || [];

      // Get story point field based on issue type
      const isAJTI = issue.idReadable?.startsWith("AJTI");
      const fieldIndex = isAJTI ? 9 : 6;

      if (fields.length <= fieldIndex) {
        return total;
      }

      const field = fields[fieldIndex];
      const value = field?.value;

      // Value can be a number directly (for SimpleIssueCustomField)
      if (typeof value === "number") {
        return total + value;
      }

      // Or an object with presentation/name properties
      if (value && typeof value === "object") {
        const numValue =
          "presentation" in value
            ? parseFloat(value.presentation ?? "")
            : "name" in value
              ? parseFloat(value.name ?? "")
              : NaN;

        return total + (isNaN(numValue) ? 0 : numValue);
      }

      return total;
    }, 0);
  }, [issues]);

  // Build the query string for display
  const queryString = useMemo(() => {
    if (!selectedSprint) return "";

    const stateFilter = buildStateFilter(states, selectedStateIds);
    const sortFilter = buildSortFilter(sorts);
    const queryPrefix = buildQueryPrefix(queryUsername);

    return buildQuery(selectedSprint, stateFilter, sortFilter, queryPrefix);
  }, [selectedSprint, states, selectedStateIds, sorts, queryUsername]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-4 md:p-8">
      <SettingsModal
        forceOpen={showSettingsModal}
        onClose={handleCloseSettingsModal}
        currentUsername={queryUsername}
        onUsernameChange={handleUsernameChange}
      />

      <div className="max-w-7xl mx-auto">
        <Card className="mb-6">
          <BoardHeader />
        </Card>

        {error && <ErrorState error={error} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Filter Board */}
          <div className="lg:col-span-1 h-fit space-y-4">
            <Card>
              <CardContent className="space-y-4">
                <SprintSelector
                  sprints={sprints}
                  selectedSprint={selectedSprint}
                  onSprintChange={handleSprintChange}
                  loading={loadingBoard}
                />

                <BoardFilters
                  states={states}
                  selectedStateIds={selectedStateIds}
                  onStateChange={handleStateChange}
                  sorts={sorts}
                  onSortsChange={handleSortsChange}
                />

                <BoardStats
                  sprint={selectedSprintData}
                  issuesCount={issues.length}
                  totalStoryPoints={totalStoryPoints}
                  onRefresh={handleRefresh}
                  onSettings={handleSettings}
                  loading={loadingIssues}
                />
              </CardContent>
            </Card>

            <SprintMarkdownGenerator
              currentSprintName={selectedSprint}
              sprints={sprints}
              states={states}
              mode="current"
            />

            <SprintMarkdownGenerator
              currentSprintName={selectedSprint}
              sprints={sprints}
              states={states}
              mode="previous"
            />
          </div>

          {/* Right Side - Query Display & Issue List */}
          <div className="lg:col-span-2 space-y-4">
            <QueryDisplay query={queryString} />

            <Card>
              <CardContent className="px-6">
                {loadingIssues && <LoadingState />}

                {!loadingIssues && (
                  <div className="max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
                    <IssueList
                      issues={issues}
                      selectedSprint={selectedSprint}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
