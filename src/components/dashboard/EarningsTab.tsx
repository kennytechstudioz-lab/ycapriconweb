"use client";
import React, { useState, useEffect } from "react";
import { apiCall } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { useWalletStore } from "@/store/walletStore";
import { useTransactionStore } from "@/store/transactionStore";

export function EarningsTab() {
  const { user } = useAuthStore();
  const username = user?.username;

  const { wallets, fetchWallets } = useWalletStore();
  const { transactions, fetchTransactions } = useTransactionStore();

  const [earningsList, setEarningsList] = useState<any[]>([]);

  useEffect(() => {
    if (username) {
      fetchWallets(username);
      fetchTransactions(username);
      
      const fetchEarnings = async () => {
        try {
          const response = await apiCall<{ success: boolean; earnings: any[] }>(
            `/api/users/earnings?username=${username}`
          );
          if (response.success) {
            setEarningsList(response.earnings || []);
          }
        } catch (error) {
          console.error("✗ Failed to load earnings:", error);
        }
      };
      
      fetchEarnings();
    }
  }, [username, fetchWallets, fetchTransactions]);

  const activeDeposits = wallets.reduce((acc, curr) => acc + (curr.activeDeposit || 0), 0);
  const totalEarnings = earningsList.reduce((acc, e) => acc + (e.earning || 0), 0);
  const totalWithdrawals = transactions
    .filter((t) => t.transactionType === "withdrawal")
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-[#0f1115] border border-neutral-900 p-6 rounded text-left">
        <h4 className="text-base font-extrabold text-white border-b border-neutral-900 pb-4">Earnings Breakdown</h4>
        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">Active Deposits</span>
            <span className="text-xl font-black text-white">${activeDeposits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">Earnings Yield (15% Avg)</span>
            <span className="text-xl font-black text-[#e4c126]">${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">Dividends Distributed</span>
            <span className="text-xl font-black text-green-400">${totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
