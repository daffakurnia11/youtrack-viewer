"use client";

import { AlertOctagon, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store";

const AUTH_TOKEN_KEY = "AUTH_TOKEN";
const QUERY_USERNAME_KEY = "QUERY_USERNAME";
const TOKEN_MAX_AGE_DAYS = 90;

// Helper to get from localStorage directly (SSR-safe)
const getFromLocalStorage = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

// Calculate token age in days
const getTokenAge = (createdAt: string | null): number | null => {
  if (!createdAt) return null;
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Format date for display
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Calculate time ago
const getTimeAgo = (dateString: string | null): string => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
};

interface SettingsModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
  currentUsername?: string;
  onUsernameChange?: (username: string) => void;
}

export function SettingsModal({
  forceOpen = false,
  onClose,
  currentUsername = "",
  onUsernameChange,
}: SettingsModalProps) {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState(currentUsername);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasCheckedLocalStorage, setHasCheckedLocalStorage] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  const { authToken, tokenCreatedAt, lastUsedAt, activityLog, clearAuthToken } = useAppStore();

  // Check if we're on the client side
  const isClient = typeof window !== "undefined";

  // Calculate token age
  const tokenAge = getTokenAge(tokenCreatedAt);
  const isTokenExpired = tokenAge !== null && tokenAge > TOKEN_MAX_AGE_DAYS;

  // Initialize modal state on client side
  useEffect(() => {
    // Check localStorage directly for initial auth
    const storedToken = getFromLocalStorage(AUTH_TOKEN_KEY);

    // Use setTimeout to avoid setState in effect warning
    const timer = setTimeout(() => {
      if (!storedToken && !hasCheckedLocalStorage) {
        // No token in localStorage, show modal
        setIsOpen(true);
        setHasCheckedLocalStorage(true);
      }

      // Handle forceOpen prop
      if (forceOpen) {
        setIsOpen(true);
        // Pre-fill with existing values
        if (storedToken) {
          setToken(storedToken);
        }
        const storedUsername =
          getFromLocalStorage(QUERY_USERNAME_KEY) || currentUsername;
        setUsername(storedUsername);
        setHasCheckedLocalStorage(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [forceOpen, currentUsername, hasCheckedLocalStorage]);

  const handleClose = () => {
    setIsOpen(false);
    setShowRevokeConfirm(false);
    onClose?.();
  };

  const handleRevokeToken = () => {
    clearAuthToken();
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem("youtrack-viewer-storage");
    setToken("");
    setShowRevokeConfirm(false);
    handleClose();
    window.location.reload();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      setError("Permanent token is required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to localStorage directly
      localStorage.setItem(AUTH_TOKEN_KEY, token.trim());

      if (username.trim()) {
        localStorage.setItem(QUERY_USERNAME_KEY, username.trim());
      }

      // Also update the store
      const { setAuthToken, setQueryUsername } = useAppStore.getState();
      setAuthToken(token.trim());
      setQueryUsername(username.trim());

      if (username.trim() !== currentUsername) {
        onUsernameChange?.(username.trim());
      }

      setError("");
      setIsOpen(false);
      onClose?.();
      // Reload page to use the new settings
      window.location.reload();
    } catch {
      setError("Failed to save settings. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Don't render anything during SSR or before mount
  if (!isClient || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Security Notice */}
          <Alert className="mb-4 border-orange-500 bg-orange-50 dark:bg-orange-950">
            <AlertOctagon className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-sm text-orange-800 dark:text-orange-200">
              <strong>Security Notice:</strong> Your permanent token is stored in
              browser localStorage. Only use this on trusted devices. Consider
              rotating your token regularly.
            </AlertDescription>
          </Alert>

          {/* Token Age Warning */}
          {tokenAge !== null && (
            <Alert
              className={`mb-4 ${
                isTokenExpired
                  ? "border-red-500 bg-red-50 dark:bg-red-950"
                  : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
              }`}
            >
              <AlertOctagon
                className={`h-4 w-4 ${
                  isTokenExpired ? "text-red-600" : "text-yellow-600"
                }`}
              />
              <AlertDescription
                className={`text-sm ${
                  isTokenExpired
                    ? "text-red-800 dark:text-red-200"
                    : "text-yellow-800 dark:text-yellow-200"
                }`}
              >
                <strong>
                  {isTokenExpired ? "Token Expired" : "Token Age"}:
                </strong>{" "}
                {tokenAge} day{tokenAge !== 1 ? "s" : ""} old
                {isTokenExpired
                  ? ". Please regenerate your token for security."
                  : `. Consider rotating after ${TOKEN_MAX_AGE_DAYS} days.`}
              </AlertDescription>
            </Alert>
          )}

          {/* Activity Information */}
          {authToken && (
            <Alert className="mb-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                <div className="space-y-2">
                  <div>
                    <strong>Last Used:</strong> {getTimeAgo(lastUsedAt)}
                    {lastUsedAt && (
                      <span className="text-xs text-blue-600 dark:text-blue-300 ml-2">
                        ({formatDate(lastUsedAt)})
                      </span>
                    )}
                  </div>
                  {activityLog.length > 1 && (
                    <div>
                      <strong>Recent Activity:</strong>
                      <div className="mt-1 space-y-1">
                        {activityLog.slice(0, 5).map((timestamp: string, index: number) => (
                          <div key={timestamp} className="text-xs pl-2">
                            {index === 0 ? "• " : "• "}
                            {getTimeAgo(timestamp)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Revoke Token Button (only show if token exists) */}
          {authToken && !showRevokeConfirm && (
            <div className="mb-4 flex justify-end">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowRevokeConfirm(true)}
                className="cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Revoke Token
              </Button>
            </div>
          )}

          {/* Revoke Confirmation */}
          {showRevokeConfirm && (
            <Alert className="mb-4 border-red-500 bg-red-50 dark:bg-red-950">
              <AlertDescription className="text-sm text-red-800 dark:text-red-200">
                <strong>Are you sure?</strong> This will clear your stored token.
                You&apos;ll need to re-enter it to use the app.
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowRevokeConfirm(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleRevokeToken}
                    className="cursor-pointer"
                  >
                    Yes, Revoke
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Permanent Token */}
            <div className="space-y-2">
              <Label htmlFor="auth-token">
                Permanent Token <span className="text-destructive">*</span>
              </Label>
              <Input
                id="auth-token"
                type="password"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setError("");
                }}
                placeholder="perm:..."
                required
                disabled={isSubmitting}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Get and generate your permanent token from{" "}
                <Link
                  href={
                    "https://brightan.myjetbrains.com/youtrack/users/me?tab=account-security"
                  }
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  here
                </Link>
              </p>
            </div>

            {/* Query Username */}
            <div className="space-y-2">
              <Label htmlFor="query-username">Query Username</Label>
              <Input
                id="query-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="daffakurniaf11"
                disabled={isSubmitting}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter your username for query prefix (e.g., daffakurniaf11)
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !token.trim()}
                className="cursor-pointer"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
