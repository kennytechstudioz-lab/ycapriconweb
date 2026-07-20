import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiCall } from "@/lib/apiClient";
import { UserProfile } from "./userStore";

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (username: string, passKey: string) => Promise<{ success: boolean; error?: string; requires2FA?: boolean; username?: string }>;
  logout: () => void;
  setUser: (user: UserProfile) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username, passKey) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall<{
            success: boolean;
            user?: UserProfile;
            message?: string;
            requires2FA?: boolean;
            username?: string;
          }>("/api/users/login", {
            method: "POST",
            body: { username, password: passKey },
          });

          // 2FA required — do not authenticate yet, let the page redirect
          if (response.success && response.requires2FA) {
            set({ isLoading: false });
            return { success: true, requires2FA: true, username: response.username };
          }

          if (response.success && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return { success: true };
          } else {
            throw new Error(response.message || "Authentication failed.");
          }
        } catch (err: any) {
          const errorMessage = err.message || "Invalid credentials or network error.";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user) => set({ user, isAuthenticated: true }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage", // persists session locally
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
