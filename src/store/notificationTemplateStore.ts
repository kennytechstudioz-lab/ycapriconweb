import { create } from "zustand";
import { apiCall } from "@/lib/apiClient";

export interface NotificationTemplateData {
  id?: string;
  _id?: string;
  name: string;
  title: string;
  content: string;
  createdAt?: string;
}

interface NotificationTemplateState {
  templates: NotificationTemplateData[];
  isLoading: boolean;
  error: string | null;

  createTemplate: (template: NotificationTemplateData) => Promise<{ success: boolean; error?: string }>;
  updateTemplate: (id: string, template: NotificationTemplateData) => Promise<{ success: boolean; error?: string }>;
  deleteTemplate: (id: string) => Promise<{ success: boolean; error?: string }>;
  fetchTemplates: () => Promise<void>;
  clearError: () => void;
}

export const useNotificationTemplateStore = create<NotificationTemplateState>((set, get) => ({
  templates: [],
  isLoading: false,
  error: null,

  createTemplate: async (template) => {
    set({ isLoading: true, error: null });
    try {
      await apiCall("/api/admin/notification-templates", {
        method: "POST",
        body: template,
      });
      await get().fetchTemplates();
      set({ isLoading: false, error: null });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create notification template.";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  updateTemplate: async (id, template) => {
    set({ isLoading: true, error: null });
    try {
      await apiCall(`/api/admin/notification-templates/${id}`, {
        method: "PATCH",
        body: template,
      });
      await get().fetchTemplates();
      set({ isLoading: false, error: null });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update notification template.";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiCall(`/api/admin/notification-templates/${id}`, {
        method: "DELETE",
      });
      await get().fetchTemplates();
      set({ isLoading: false, error: null });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete notification template.";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiCall<{ success: boolean; templates: NotificationTemplateData[] }>("/api/admin/notification-templates");
      set({
        templates: response.templates || [],
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || "Failed to retrieve notification templates list.",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
export default useNotificationTemplateStore;
