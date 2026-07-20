import { create } from "zustand";
import { apiCall } from "@/lib/apiClient";

export interface TransactionItem {
  _id: string;
  currencyId: string;
  currencyLogo: string;
  currencyName: string;
  currencySymbol: string;
  walletId: string;
  username: string;
  planDuration: number;
  planPercentage: number;
  planReferralPercent: number;
  amount: number;
  transactionType: "deposit" | "withdrawal" | "referral" | "bonus" | "capital_access";
  method: "direct" | "balance";
  status: "pending" | "completed" | "rejected";
  createdAt: string;
  updatedAt: string;
}

interface TransactionState {
  transactions: TransactionItem[];
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;

  fetchTransactions: (username: string, page?: number) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  error: null,

  fetchTransactions: async (username: string, page = 1) => {
    if (!username) return;
    set({ isLoading: true, error: null });
    try {
      const response = await apiCall<{
        success: boolean;
        transactions: TransactionItem[];
        totalPages: number;
        page: number;
      }>(`/api/users/transactions?username=${username}&page=${page}&limit=20`);
      set({
        transactions: response.transactions || [],
        totalPages: response.totalPages || 1,
        currentPage: response.page || page,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || "Failed to retrieve transaction records.",
      });
    }
  },

  deleteTransaction: async (id: string) => {
    try {
      await apiCall(`/api/users/transactions/${id}`, { method: "DELETE" });
      set((state) => ({
        transactions: state.transactions.filter((tx) => tx._id !== id),
      }));
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete transaction.");
    }
  },

  clearError: () => set({ error: null }),
}));
