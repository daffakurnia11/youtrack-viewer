"use client";

import axios from "axios";
import { FileText, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DEFAULT_ISSUE_FIELDS } from "@/lib/youTrackQuery";

interface SprintMarkdownGeneratorProps {
  currentSprintName: string | null;
  sprints: Array<{ id: string; name: string; ordinal?: number }>;
  states: Array<{ id: string; name: string }>;
  mode?: "current" | "previous";
}

interface Ticket {
  id: string;
  summary: string;
  storyPoints: number;
  subTribe: string;
  deployed: boolean;
}

interface MarkdownPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  sprintName: string;
}

interface YouTrackIssue {
  idReadable: string;
  summary: string;
  fields: Array<{
    value: unknown;
  }>;
  project?: {
    shortName: string;
  };
  resolved?: string | null;
}

interface YouTrackField {
  value:
    | {
        name?: string;
        presentation?: string;
      }
    | number;
}

function MarkdownPreviewModal({
  isOpen,
  onClose,
  content,
  sprintName,
}: MarkdownPreviewModalProps) {
  const markdownRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!markdownRef.current) return;

    const htmlContent = markdownRef.current.innerHTML;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([htmlContent], { type: "text/html" }),
          "text/plain": new Blob([content], { type: "text/plain" }),
        }),
      ]);
      alert("Copied to clipboard!");
    } catch {
      // Fallback to copying raw markdown
      await navigator.clipboard.writeText(content);
      alert("Markdown copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between px-6">
          <div>
            <h3 className="text-lg font-semibold">Sprint Report Preview</h3>
            <p className="text-sm text-muted-foreground">{sprintName}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto px-6">
          <div ref={markdownRef} className="prose prose-sm max-w-full!">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </CardContent>

        <div className="flex gap-2 px-6 py-4 border-t">
          <Button onClick={handleCopy} className="cursor-pointer">
            Copy to Clipboard
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function SprintMarkdownGenerator({
  currentSprintName,
  sprints,
  states,
  mode = "previous",
}: SprintMarkdownGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [markdownContent, setMarkdownContent] = useState("");
  const [previewSprintName, setPreviewSprintName] = useState("");

  // Clear preview when sprint changes
  useEffect(() => {
    if (showPreview && previewSprintName !== currentSprintName) {
      setShowPreview(false);
      setMarkdownContent("");
      setPreviewSprintName("");
    }
  }, [currentSprintName, showPreview, previewSprintName]);

  // Find target sprint based on mode
  const getTargetSprint = () => {
    if (!currentSprintName) return null;

    const currentSprintIndex = sprints.findIndex(
      (s) => s.name === currentSprintName,
    );
    if (currentSprintIndex === -1) return null;

    if (mode === "previous") {
      // Get the sprint before the current one
      return sprints[currentSprintIndex + 1] || null;
    } else {
      // Use the current sprint
      return sprints[currentSprintIndex] || null;
    }
  };

  // Fetch issues for the sprint
  const fetchSprintIssues = async (sprintName: string) => {
    const authToken = localStorage.getItem("AUTH_TOKEN");
    if (!authToken) return [];

    const queryUsername = localStorage.getItem("QUERY_USERNAME") || "";
    const BOARD_NAME = "Board Employer Kanban";
    const queryPrefix = queryUsername
      ? `#${queryUsername} {${BOARD_NAME}}:`
      : "";

    let stateFilter = "";

    if (mode === "previous") {
      // Get deployed states for previous sprint
      const deployedStateNames = [
        "Completed",
        "Verified",
        "Deployed to Production",
      ];
      const deployedStates = states.filter((s) =>
        deployedStateNames.includes(s.name),
      );

      stateFilter = deployedStates
        .map((s) => {
          const stateName = s.name.includes(" ") ? `{${s.name}}` : s.name;
          return `State: ${stateName}`;
        })
        .join(" ");
    }

    const query = `${queryPrefix} {${sprintName}} ${stateFilter}`;
    const response = await axios.get("/api/issues", {
      params: { query, fields: DEFAULT_ISSUE_FIELDS },
      headers: { Authorization: `Bearer ${authToken}` },
    });

    return response.data || [];
  };

  // Parse issue into ticket format
  const parseTicket = (issue: YouTrackIssue): Ticket | null => {
    const fields = issue.fields || [];
    const summary = issue.summary || "";
    const isAJTI = issue.idReadable?.startsWith("AJTI");

    // Get story points
    const storyPointField = fields[isAJTI ? 9 : 6] as YouTrackField | undefined;
    const storyPoints =
      typeof storyPointField?.value === "number"
        ? storyPointField.value
        : parseFloat(
            storyPointField?.value?.presentation ||
              storyPointField?.value?.name ||
              "0",
          );

    // Get SubTribe
    const subTribeField = fields[isAJTI ? 11 : 12] as YouTrackField | undefined;
    const subTribeName =
      typeof subTribeField?.value === "object" && subTribeField?.value?.name
        ? subTribeField.value.name
        : "Issues";

    // Check if it's deployed (has resolved date)
    const deployed = !!issue.resolved;

    return {
      id: issue.idReadable,
      summary,
      storyPoints,
      subTribe: subTribeName,
      deployed,
    };
  };

  // Generate markdown
  const handleGenerate = async () => {
    const targetSprint = getTargetSprint();
    if (!targetSprint) {
      alert(
        mode === "previous"
          ? "No previous sprint found"
          : "No current sprint found",
      );
      return;
    }

    setIsGenerating(true);

    try {
      // Fetch issues for the sprint
      const issues = await fetchSprintIssues(targetSprint.name);

      // Parse tickets
      const tickets = issues
        .map(parseTicket)
        .filter((t: Ticket | null): t is Ticket => t !== null);

      if (tickets.length === 0) {
        alert("No tickets found in sprint");
        setIsGenerating(false);
        return;
      }

      // Group by subtribe
      const grouped: Record<string, Ticket[]> = {};
      tickets.forEach((ticket: Ticket) => {
        const key = ticket.subTribe;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(ticket);
      });

      // Sort by SubTribe, then by issue ID
      Object.keys(grouped).forEach((key) => {
        grouped[key].sort((a, b) => {
          if (a.subTribe !== b.subTribe)
            return a.subTribe.localeCompare(b.subTribe);
          return a.id.localeCompare(b.id);
        });
      });

      // Build markdown
      let markdown = `# ${targetSprint.name}\n\n`;

      const totalIssues = tickets.length;
      if (mode === "previous") {
        // Show totals for previous sprint
        const totalStoryPoints = tickets.reduce(
          (sum: number, ticket: Ticket) => sum + ticket.storyPoints,
          0,
        );
        markdown += `**Total Issues:** ${totalIssues} | **Total Story Points:** ${totalStoryPoints}\n\n---\n\n`;
      } else {
        markdown += `**Total Issues:** ${totalIssues}\n\n---\n\n`;
      }

      // Add subtribes
      Object.entries(grouped).forEach(([subTribe, tickets]) => {
        markdown += `## ${subTribe}\n\n`;

        if (mode === "previous") {
          if (tickets.length === 0) {
            markdown += `_No ticket deployed_\n\n`;
            markdown += "---\n\n";
            return;
          }
        }

        markdown += "\n\n";

        // Add tickets
        tickets.forEach((ticket) => {
          if (mode === "previous") {
            const deployed = ticket.deployed;
            const deployedMark = deployed ? ` **DEPLOYED**` : "";
            markdown += `- ${ticket.id} ${ticket.summary} (${ticket.storyPoints}SP) ${deployedMark}\n`;
          } else {
            // Current sprint - no story points or deployed status
            markdown += `- ${ticket.id} ${ticket.summary}\n`;
          }
        });

        markdown += "---\n";
      });

      setMarkdownContent(markdown);
      setPreviewSprintName(targetSprint.name);
      setShowPreview(true);
    } catch (error) {
      alert(
        "Failed to generate sprint markdown: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const targetSprint = getTargetSprint();

  return (
    <>
      <Card className="mb-4">
        <CardContent>
          <div className="flex flex-col items-start justify-between mb-2">
            <h3 className="text-sm font-semibold">
              {mode === "previous"
                ? "Generate Last Sprint"
                : "Generate Current Sprint"}
            </h3>
            {targetSprint && (
              <span className="text-xs text-muted-foreground">
                {mode === "previous" ? "Previous: " : "Current: "}
                {targetSprint.name}
              </span>
            )}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !targetSprint}
            className="w-full cursor-pointer"
            size="sm"
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-1" />
                Generate & Preview
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <MarkdownPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        content={markdownContent}
        sprintName={previewSprintName}
      />
    </>
  );
}
