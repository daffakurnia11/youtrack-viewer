"use client";

import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store";
import Link from "next/link";

const AUTH_TOKEN_KEY = "AUTH_TOKEN";
const QUERY_USERNAME_KEY = "QUERY_USERNAME";

// Helper to get from localStorage directly (SSR-safe)
const getFromLocalStorage = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
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

  // Check if we're on the client side
  const isClient = typeof window !== "undefined";

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
    onClose?.();
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
          <Alert className="mb-4">
            <AlertDescription>
              Configure your YouTrack authentication and query settings.
            </AlertDescription>
          </Alert>

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
                placeholder="perm-..."
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
                  {" "}
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
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !token.trim()}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
