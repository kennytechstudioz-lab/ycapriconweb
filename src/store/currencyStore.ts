import { create } from "zustand";
import { apiCall } from "@/lib/apiClient";

export interface CurrencyData {
  id?: string;
  _id?: string;
  name: string;
  symbol: string;
  image?: string;
  address: string;
  balance: number;
  createdAt?: string;
}

interface CurrencyState {
  currencies: CurrencyData[];
  isLoading: boolean;
  error: string | null;

  createCurrency: (currency: CurrencyData) => Promise<{ success: boolean; error?: string }>;
  updateCurrency: (id: string, currency: CurrencyData) => Promise<{ success: boolean; error?: string }>;
  deleteCurrency: (id: string) => Promise<{ success: boolean; error?: string }>;
  fetchCurrencies: () => Promise<void>;
  clearError: () => void;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currencies: [],
  isLoading: false,
  error: null,

  createCurrency: async (currency) => {
    set({ isLoading: true, error: null });
    try {
      await apiCall("/api/currencies", {
        method: "POST",
        body: currency,
      });
      await get().fetchCurrencies();
      set({ isLoading: false, error: null });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create currency.";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  updateCurrency: async (id, currency) => {
    set({ isLoading: true, error: null });
    try {
      await apiCall(`/api/currencies/${id}`, {
        method: "PATCH",
        body: currency,
      });
      await get().fetchCurrencies();
      set({ isLoading: false, error: null });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update currency.";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  deleteCurrency: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiCall(`/api/currencies/${id}`, {
        method: "DELETE",
      });
      await get().fetchCurrencies();
      set({ isLoading: false, error: null });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete currency.";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  fetchCurrencies: async () => {
    const currentCurrencies = get().currencies;
    if (currentCurrencies && currentCurrencies.length > 0) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await apiCall<{ success: boolean; currencies: CurrencyData[] }>("/api/currencies");
      set({
        currencies: response.currencies || [],
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || "Failed to retrieve currencies.",
      });
    }
  },


  clearError: () => set({ error: null }),
}));
