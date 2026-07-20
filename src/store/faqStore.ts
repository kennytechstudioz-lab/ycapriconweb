import { create } from "zustand";
import { apiCall } from "@/lib/apiClient";

export interface FaqData {
  _id?: string;
  category: string;
  question: string;
  answer: string;
  createdAt?: string;
}

interface FaqState {
  faqs: FaqData[];
  isLoading: boolean;
  error: string | null;
  fetchFaqs: () => Promise<void>;
  createFaq: (data: FaqData) => Promise<{ success: boolean; error?: string }>;
  updateFaq: (id: string, data: Partial<FaqData>) => Promise<{ success: boolean; error?: string }>;
  deleteFaq: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const useFaqStore = create<FaqState>((set, get) => ({
  faqs: [],
  isLoading: false,
  error: null,

  fetchFaqs: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiCall<{ success: boolean; faqs: FaqData[] }>("/api/faqs");
      set({ faqs: res.faqs || [], isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Failed to load FAQs." });
    }
  },

  createFaq: async (data) => {
    try {
      await apiCall("/api/faqs", { method: "POST", body: data });
      await get().fetchFaqs();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to create FAQ." };
    }
  },

  updateFaq: async (id, data) => {
    try {
      await apiCall(`/api/faqs/${id}`, { method: "PUT", body: data });
      await get().fetchFaqs();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update FAQ." };
    }
  },

  deleteFaq: async (id) => {
    try {
      await apiCall(`/api/faqs/${id}`, { method: "DELETE" });
      set((s) => ({ faqs: s.faqs.filter((f) => f._id !== id) }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to delete FAQ." };
    }
  },
}));
