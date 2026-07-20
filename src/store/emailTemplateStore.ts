import { create } from "zustand";
import { apiCall } from "@/lib/apiClient";

export interface EmailTemplateData {
  id?: string;
  _id?: string;
  name: string;
  title: string;
  greeting?: string;
  content: string;
  banner?: string;
  createdAt?: string;
}

interface EmailTemplateState {
  templates: EmailTemplateData[];
  isLoading: boolean;
  error: string | null;

  createTemplate: (template: EmailTemplateData) => Promise<{ success: boolean; error?: string }>;
  updateTemplate: (id: string, template: EmailTemplateData) => Promise<{ success: boolean; error?: string }>;
  deleteTemplate: (id: string) => Promise<{ success: boolean; error?: string }>;
  fetchTemplates: () => Promise<void>;
  clearError: () => void;
}

export const useEmailTemplateStore = create<EmailTemplateState>((set, get) => ({
  templates: [],
  isLoading: false,
  error: null,

  createTemplate: async (template) => {
    set({ isLoading: true, error: null });
    try {
      await apiCall("/api/admin/email-templates", {
        method: "POST",
        body: template,
      });
      await get().fetchTemplates();
      set({ isLoading: false, error: null });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create email template.";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  updateTemplate: async (id, template) => {
    set({ isLoading: true, error: null });
    try {
      await apiCall(`/api/admin/email-templates/${id}`, {
        method: "PATCH",
        body: template,
      });
      await get().fetchTemplates();
      set({ isLoading: false, error: null });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update email template.";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiCall(`/api/admin/email-templates/${id}`, {
        method: "DELETE",
      });
      await get().fetchTemplates();
      set({ isLoading: false, error: null });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete email template.";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiCall<{ success: boolean; templates: EmailTemplateData[] }>("/api/admin/email-templates");
      set({
        templates: response.templates || [],
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || "Failed to retrieve email templates list.",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
export default useEmailTemplateStore;
