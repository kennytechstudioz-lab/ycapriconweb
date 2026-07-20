import { create } from "zustand";
import { apiCall } from "@/lib/apiClient";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  balance: number;
  passKey: string;
  profilePicture: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  phoneNumber: string;
  country: string;
  occupation: string;
  isVerifying: boolean;
  isVerified: boolean;
  idType: string;
  idImage: string;
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  registerUser: (
    username: string, 
    email: string, 
    password: string, 
    wallets?: Array<{ currencyName: string; currencySymbol: string; walletAddress: string }>,
    referredBy?: string
  ) => Promise<{ success: boolean; error?: string }>;
  fetchProfile: (username: string) => Promise<{ success: boolean; profile?: UserProfile; error?: string }>;
  updateProfile: (data: Partial<UserProfile> & { username: string }) => Promise<{ success: boolean; profile?: UserProfile; error?: string }>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  registerUser: async (username, email, password, wallets, referredBy) => {
    set({ isLoading: true, error: null });
    try {
      await apiCall("/api/users/register", {
        method: "POST",
        body: { username, email, password, wallets, referredBy },
      });

      set({
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Something went wrong. Please try again.";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  fetchProfile: async (username) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiCall<{ success: boolean; profile: UserProfile }>(
        `/api/users/profile?username=${username}`
      );
      set({ profile: response.profile, isLoading: false });
      return { success: true, profile: response.profile };
    } catch (err: any) {
      const msg = err.message || "Failed to retrieve user profile.";
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiCall<{ success: boolean; profile: UserProfile }>(
        "/api/users/profile",
        {
          method: "PUT",
          body: data,
        }
      );
      set({ profile: response.profile, isLoading: false });
      return { success: true, profile: response.profile };
    } catch (err: any) {
      const msg = err.message || "Failed to update user profile.";
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  clearError: () => set({ error: null }),
}));
