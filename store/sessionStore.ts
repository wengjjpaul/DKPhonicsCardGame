// Zustand store for client-side session state
import { create } from 'zustand';
import { SessionData, DEFAULT_SESSION } from '@/types/session';

export type SessionState = {
  session: SessionData;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSession: (session: SessionData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSession: () => void;

  // Async actions (fetch from API)
  fetchSession: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
};

export const useSessionStore = create<SessionState>((set) => ({
  session: DEFAULT_SESSION,
  isLoading: true,
  error: null,

  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearSession: () => set({ session: DEFAULT_SESSION }),

  fetchSession: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetch('/api/session');
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }

      const data = await response.json();
      set({ session: data.session, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  updateName: async (name: string) => {
    try {
      set({ error: null });

      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name }),
      });

      if (!response.ok) {
        throw new Error('Failed to update name');
      }

      const data = await response.json();
      set({ session: data.session });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Unknown error' });
      throw err;
    }
  },
}));

export default useSessionStore;
