import { create } from "zustand";
import { apiCall } from "@/lib/apiClient";

export interface WalletItem {
  id: string;
  currencyId: string;
  currencyName: string;
  currencySymbol: string;
  currencyLogo: string;
  address: string;
  balance: number;
  totalDeposit: number;
  totalWithdrawal: number;
  activeDeposit: number;
  companyAddress?: string;
}

interface WalletState {
  wallets: WalletItem[];
  totalBalance: number;
  isLoading: boolean;
  error: string | null;

  fetchWallets: (username: string) => Promise<void>;
  updateWalletAddress: (username: string, walletId: string, symbol: string, address: string) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  totalBalance: 0,
  isLoading: false,
  error: null,

  fetchWallets: async (username: string) => {
    if (!username) return;
    
    set({ isLoading: true, error: null });
    try {
      const response = await apiCall<{ success: boolean; wallets: WalletItem[]; totalBalance?: number }>(
        `/api/users/wallets?username=${username}`
      );
      if (response.success) {
        const walletList = response.wallets || [];
        const computedTotal = typeof response.totalBalance === "number"
          ? response.totalBalance
          : walletList.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);

        set({
          wallets: walletList,
          totalBalance: computedTotal,
          isLoading: false,
          error: null,
        });
      } else {
        set({ isLoading: false, error: "Failed to fetch wallets" });
      }
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || "Failed to retrieve wallets.",
      });
    }
  },

  updateWalletAddress: async (username: string, walletId: string, symbol: string, address: string) => {
    try {
      const response = await apiCall<{ success: boolean; message: string }>("/api/users/wallets/address", {
        method: "PUT",
        body: {
          username,
          walletId,
          address,
        },
      });
      
      if (response.success) {
        // Refetch wallets to keep them updated
        await get().fetchWallets(username);
        return { success: true, message: response.message || `${symbol} payout address saved!` };
      } else {
        return { success: false, message: response.message || "Failed to update address." };
      }
    } catch (error: any) {
      return { success: false, message: error.message || "Failed to update address." };
    }
  },

  clearError: () => set({ error: null }),
}));
