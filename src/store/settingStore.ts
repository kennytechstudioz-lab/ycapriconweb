import { create } from "zustand";
import { apiCall } from "@/lib/apiClient";
import { useToastStore } from "@/store/toastStore";

export interface SettingData {
  companyName: string;
  domainName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  showCurrency: boolean;
  registrationLink?: string;
  documents?: { name: string; url: string }[];
  mapEmbed?: string;
}

interface SettingState {
  setting: SettingData | null;
  isLoading: boolean;
  error: string | null;

  fetchSettings: () => Promise<{ success: boolean; setting?: SettingData; error?: string }>;
  updateSettings: (data: SettingData) => Promise<{ success: boolean; setting?: SettingData; error?: string }>;
  clearError: () => void;
}

export const useSettingStore = create<SettingState>((set, get) => ({
  setting: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    const currentSetting = get().setting;
    if (currentSetting) {
      return { success: true, setting: currentSetting };
    }

    set({ isLoading: true, error: null });
    try {
      const response = await apiCall("/api/settings", { method: "GET" });
      const setting = response.setting;
      set({ setting, isLoading: false });
      return { success: true, setting };
    } catch (err: any) {
      const msg = err.message || "Failed to retrieve system configurations.";
      set({ error: msg, isLoading: false });
      useToastStore.getState().showToast("Unable to fetch company details. Please check your network connection.", "error");
      return { success: false, error: msg };
    }
  },



  updateSettings: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiCall("/api/settings", {
        method: "PUT",
        body: data,
      });
      const setting = response.setting;
      set({ setting, isLoading: false });
      return { success: true, setting };
    } catch (err: any) {
      const msg = err.message || "Failed to update system configurations.";
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  clearError: () => set({ error: null }),
}));
