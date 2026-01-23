"use client";

import { useEffect } from "react";

import { useAppStore } from "@/store";

const SESSION_CHECK_INTERVAL = 60000; // Check every minute
const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours
const WARNING_BEFORE_MINUTES = 10; // Show warning 10 minutes before timeout

export function SessionTimeout() {
  const { authToken, lastUsedAt, clearAuthToken } = useAppStore();

  useEffect(() => {
    if (!authToken || !lastUsedAt) return;

    const checkSession = () => {
      const lastUsed = new Date(lastUsedAt).getTime();
      const now = Date.now();
      const timeSinceLastUse = now - lastUsed;

      // Check if session expired
      if (timeSinceLastUse > SESSION_TIMEOUT_MS) {
        alert(
          "Your session has expired due to inactivity. Please log in again."
        );
        clearAuthToken();
        localStorage.removeItem("AUTH_TOKEN");
        localStorage.removeItem("youtrack-viewer-storage");
        window.location.reload();
        return;
      }

      // Show warning before timeout
      const timeUntilTimeout = SESSION_TIMEOUT_MS - timeSinceLastUse;
      const warningThreshold = WARNING_BEFORE_MINUTES * 60 * 1000;

      if (
        timeUntilTimeout <= warningThreshold &&
        timeUntilTimeout > warningThreshold - SESSION_CHECK_INTERVAL
      ) {
        const minutesLeft = Math.ceil(timeUntilTimeout / (60 * 1000));
        alert(
          `Your session will expire in ${minutesLeft} minute${
            minutesLeft !== 1 ? "s" : ""
          }} due to inactivity.`
        );
      }
    };

    // Check immediately
    checkSession();

    // Then check periodically
    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [authToken, lastUsedAt, clearAuthToken]);

  // Track user activity
  useEffect(() => {
    if (!authToken) return;

    const updateLastUsed = () => {
      const store = useAppStore.getState();
      store.updateLastUsed();
    };

    // Update on user interactions
    const events = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ] as const;

    events.forEach((event) => {
      window.addEventListener(event, updateLastUsed, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateLastUsed);
      });
    };
  }, [authToken]);

  return null;
}
