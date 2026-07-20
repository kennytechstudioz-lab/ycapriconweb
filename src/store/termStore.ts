import { create } from "zustand";
import { apiCall } from "@/lib/apiClient";

export interface TermData {
  _id?: string;
  category: "terms" | "policy";
  content: string;
  createdAt?: string;
}

interface TermState {
  terms: TermData[];
  isLoading: boolean;
  error: string | null;
  fetchTerms: () => Promise<void>;
  createTerm: (data: TermData) => Promise<{ success: boolean; error?: string }>;
  updateTerm: (id: string, data: Partial<TermData>) => Promise<{ success: boolean; error?: string }>;
  deleteTerm: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const useTermStore = create<TermState>((set, get) => ({
  terms: [],
  isLoading: false,
  error: null,

  fetchTerms: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiCall<{ success: boolean; terms: TermData[] }>("/api/terms");
      set({ terms: res.terms || [], isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Failed to load terms." });
    }
  },

  createTerm: async (data) => {
    try {
      await apiCall("/api/terms", { method: "POST", body: data });
      await get().fetchTerms();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to create term." };
    }
  },

  updateTerm: async (id, data) => {
    try {
      await apiCall(`/api/terms/${id}`, { method: "PUT", body: data });
      await get().fetchTerms();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update term." };
    }
  },

  deleteTerm: async (id) => {
    try {
      await apiCall(`/api/terms/${id}`, { method: "DELETE" });
      set((s) => ({ terms: s.terms.filter((t) => t._id !== id) }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to delete term." };
    }
  },
}));
