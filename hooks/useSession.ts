// Client-side session hook for accessing and updating session data
'use client';

import { useState, useEffect, useCallback } from 'react';
import { SessionData, SessionResponse, DEFAULT_SESSION } from '@/types/session';

type UseSessionReturn = {
  session: SessionData;
  isLoading: boolean;
  error: string | null;
  updateName: (name: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearSession: () => Promise<void>;
};

export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<SessionData>(DEFAULT_SESSION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch session on mount
  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/session');
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }

      const data: SessionResponse = await response.json();
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update player name
  const updateName = useCallback(async (name: string) => {
    try {
      setError(null);

      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name }),
      });

      if (!response.ok) {
        throw new Error('Failed to update name');
      }

      const data: SessionResponse = await response.json();
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  // Clear session
  const clearSession = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch('/api/session', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to clear session');
      }

      setSession(DEFAULT_SESSION);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  // Load session on mount
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return {
    session,
    isLoading,
    error,
    updateName,
    refreshSession,
    clearSession,
  };
}

export default useSession;
