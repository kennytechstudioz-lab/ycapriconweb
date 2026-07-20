"use client";

import { useEffect, useState } from "react";
import { apiCall } from "@/lib/apiClient";

interface TransactionItem {
  _id: string;
  currencyLogo: string;
  currencyName: string;
  currencySymbol: string;
  username: string;
  amount: number;
  transactionType: "deposit" | "withdrawal" | "referral" | "bonus";
  status: "pending" | "completed" | "rejected";
  createdAt: string;
}

interface ActiveDepositItem {
  _id: string;
  amount: number;
}

interface CurrencyData {
  _id: string;
  balance: number;
}

interface UserItem {
  id: string;
}

export default function AdminPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [activeDeposits, setActiveDeposits] = useState<ActiveDepositItem[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyData[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [txRes, depositsRes, currRes, usersRes] = await Promise.allSettled([
          apiCall<{ success: boolean; transactions: TransactionItem[] }>("/api/users/transactions/all"),
          apiCall<{ success: boolean; activeDeposits: ActiveDepositItem[] }>("/api/users/active-deposits/all"),
          apiCall<{ success: boolean; currencies: CurrencyData[] }>("/api/currencies"),
          apiCall<{ success: boolean; users: UserItem[] }>("/api/users"),
        ]);

        if (txRes.status === "fulfilled") setTransactions(txRes.value.transactions || []);
        if (depositsRes.status === "fulfilled") setActiveDeposits(depositsRes.value.activeDeposits || []);
        if (currRes.status === "fulfilled") setCurrencies(currRes.value.currencies || []);
        if (usersRes.status === "fulfilled") setTotalUsers((usersRes.value.users || []).length);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Computed stats
  const activeDepositsCount = activeDeposits.length;
  const totalActiveDepositsAmount = activeDeposits.reduce((sum, d) => sum + d.amount, 0);
  const totalDepositsAmount = transactions
    .filter((t) => t.transactionType === "deposit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingWithdrawals = transactions.filter(
    (t) => t.transactionType === "withdrawal" && t.status === "pending"
  );
  const pendingWithdrawalsAmount = pendingWithdrawals.reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawalsAmount = transactions
    .filter((t) => t.transactionType === "withdrawal")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCurrencyBalance = currencies.reduce((sum, c) => sum + (c.balance || 0), 0);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="px-2 py-0.5 bg-[#122319] text-[#4ade80] border border-[#1e3a29] text-[10px] font-black uppercase tracking-widest rounded">Completed</span>;
      case "pending":
        return <span className="px-2 py-0.5 bg-[#262112] text-[#e4c126] border border-[#3e361c] text-[10px] font-black uppercase tracking-widest rounded animate-pulse">Pending</span>;
      case "rejected":
        return <span className="px-2 py-0.5 bg-[#241315] text-[#f87171] border border-[#3d1e22] text-[10px] font-black uppercase tracking-widest rounded">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 bg-neutral-900 text-neutral-400 border border-neutral-800 text-[10px] font-black uppercase tracking-widest rounded">{status}</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, { bg: string; border: string; color: string; path: string }> = {
      deposit: { bg: "bg-[#122319]", border: "border-[#1e3a29]", color: "text-[#4ade80]", path: "M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" },
      withdrawal: { bg: "bg-[#241315]", border: "border-[#3d1e22]", color: "text-[#f87171]", path: "M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" },
      referral: { bg: "bg-[#1e1c2e]", border: "border-[#2d2a45]", color: "text-[#a78bfa]", path: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" },
      bonus: { bg: "bg-[#262112]", border: "border-[#3e361c]", color: "text-[#e4c126]", path: "M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" },
    };
    const icon = iconMap[type] || { bg: "bg-neutral-900", border: "border-neutral-800", color: "text-neutral-400", path: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" };
    return (
      <div className={`w-7 h-7 rounded-full ${icon.bg} border ${icon.border} flex items-center justify-center ${icon.color} flex-shrink-0`}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} />
        </svg>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#e4c126] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider animate-pulse">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-8">

      {/* Heading */}
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-black text-white tracking-wide">Overview</h3>
        <p className="text-xs text-neutral-400 font-light">
          Platform-wide summary of deposits, withdrawals, balances, and users.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1 — Deposits */}
        <div className="bg-[#13151a] border border-neutral-800 p-6 rounded relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#4ade80]" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Deposits</span>
            <span className="text-[10px] font-bold text-[#4ade80] bg-[#4ade80]/10 px-2 py-0.5 rounded">
              {activeDepositsCount} Active
            </span>
          </div>
          <h4 className="text-2xl font-black text-[#4ade80]">
            ${totalActiveDepositsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h4>
          <p className="text-[10px] text-neutral-500 mt-0.5 font-light">Active deposit capital</p>
          <p className="text-sm font-bold text-white mt-3">
            ${totalDepositsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-neutral-500 mt-0.5 font-light">Total completed deposits</p>
        </div>

        {/* Card 2 — Withdrawals */}
        <div className="bg-[#13151a] border border-neutral-800 p-6 rounded relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#f87171]" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Withdrawals</span>
            <span className="text-[10px] font-bold text-[#e4c126] bg-[#e4c126]/10 px-2 py-0.5 rounded animate-pulse">
              {pendingWithdrawals.length} Pending
            </span>
          </div>
          <h4 className="text-2xl font-black text-[#e4c126]">
            ${pendingWithdrawalsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h4>
          <p className="text-[10px] text-neutral-500 mt-0.5 font-light">Pending withdrawal value</p>
          <p className="text-sm font-bold text-white mt-3">
            ${totalWithdrawalsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-neutral-500 mt-0.5 font-light">Total withdrawal volume</p>
        </div>

        {/* Card 3 — Currency Balance */}
        <div className="bg-[#13151a] border border-neutral-800 p-6 rounded relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#e4c126]" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Currency Balance</span>
            <span className="text-[10px] font-bold text-[#e4c126] bg-[#e4c126]/10 px-2 py-0.5 rounded">
              {currencies.length} Coins
            </span>
          </div>
          <h4 className="text-2xl font-black text-white">
            ${totalCurrencyBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h4>
          <p className="text-[11px] text-neutral-500 mt-2 font-light">
            Total company wallet holdings
          </p>
        </div>

        {/* Card 4 — Users */}
        <div className="bg-[#13151a] border border-neutral-800 p-6 rounded relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Registered Users</span>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
              All Time
            </span>
          </div>
          <h4 className="text-2xl font-black text-white">
            {totalUsers.toLocaleString()}
          </h4>
          <p className="text-[11px] text-neutral-500 mt-2 font-light">
            Total platform accounts
          </p>
        </div>

      </div>

      {/* Recent Transactions */}
      <div className="bg-[#13151a] border border-neutral-800 rounded flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800">
          <div className="flex flex-col gap-0.5">
            <h4 className="text-sm font-extrabold text-white tracking-wide">Recent Transactions</h4>
            <p className="text-[11px] text-neutral-400 font-light">Latest activity across all user accounts</p>
          </div>
          <a
            href="/admin/transactions"
            className="text-[10px] font-bold uppercase tracking-wider text-[#e4c126] hover:text-white transition-colors"
          >
            View All
          </a>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-neutral-900/50 rounded-full flex items-center justify-center mb-4 border border-neutral-800">
              <svg className="w-7 h-7 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-white font-black uppercase tracking-wider">No transactions yet</span>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="bg-[#0a0b0d]/60 border-b border-neutral-900 text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Currency</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/50">
                {recentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-neutral-900/20 transition-colors">
                    <td className="py-3.5 px-6">
                      <span className="text-sm font-extrabold text-white">{tx.username}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2.5">
                        {getTypeIcon(tx.transactionType)}
                        <span className="text-sm font-bold text-neutral-200 capitalize">{tx.transactionType}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2.5">
                        {tx.currencyLogo ? (
                          <img src={tx.currencyLogo} alt={tx.currencySymbol} className="w-6 h-6 rounded-full bg-neutral-900 object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center font-black text-white text-[9px]">
                            {tx.currencySymbol?.substring(0, 2).toUpperCase() || "??"}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-neutral-200">{tx.currencyName}</span>
                          <span className="text-[10px] font-black text-neutral-500 uppercase">{tx.currencySymbol}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span className={`text-sm font-black font-mono ${tx.transactionType === "withdrawal" ? "text-[#f87171]" : "text-[#4ade80]"}`}>
                        {tx.transactionType === "withdrawal" ? "-" : "+"}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[12px] font-bold text-neutral-300">
                          {new Date(tx.createdAt).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" })}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">
                          {new Date(tx.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
