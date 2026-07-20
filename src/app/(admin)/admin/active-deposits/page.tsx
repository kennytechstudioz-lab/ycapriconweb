"use client";

import React, { useEffect, useState } from "react";
import { apiCall } from "@/lib/apiClient";

interface ActiveDepositItem {
  _id: string;
  currencyId: string;
  currencyLogo: string;
  currencyName: string;
  currencySymbol: string;
  walletId: string;
  username: string;
  amount: number;
  planDuration: number;
  planName: string;
  planPercentage: number;
  planReferralPercent: number;
  daysRemaining: number;
  transactionId: string;
  lastDecrementedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminActiveDepositsPage() {
  const [deposits, setDeposits] = useState<ActiveDepositItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom toast warning confirm state
  const [toastConfirm, setToastConfirm] = useState<{
    show: boolean;
    type: 'delete';
    id: string;
    message: string;
  } | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Pagination parameters
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const triggerDeleteDeposit = (id: string, username: string, amount: number, symbol: string) => {
    setToastConfirm({
      show: true,
      type: 'delete',
      id,
      message: `Are you absolutely sure you want to delete the active deposit of $${amount.toFixed(2)} (${symbol}) for user "${username}"? This action is permanent and cannot be undone.`
    });
  };

  const proceedDeleteDeposit = async (id: string) => {
    try {
      await apiCall(`/api/users/active-deposits/${id}`, { method: "DELETE" });
      fetchActiveDeposits();
    } catch (err: any) {
      showToast(err.message || "Failed to delete active deposit tranche.");
    }
  };

  useEffect(() => {
    fetchActiveDeposits();
  }, []);

  // Reset page focus back to 1 whenever search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchActiveDeposits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCall<{ success: boolean; activeDeposits: ActiveDepositItem[] }>(
        "/api/users/active-deposits/all"
      );
      setDeposits(response.activeDeposits || []);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve platform active deposits.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter deposits
  const filteredDeposits = deposits.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.username.toLowerCase().includes(q) ||
      d.currencySymbol.toLowerCase().includes(q) ||
      d.currencyName.toLowerCase().includes(q) ||
      d.planName.toLowerCase().includes(q)
    );
  });

  // Calculate platform totals
  const totalActiveCapital = filteredDeposits.reduce((sum, d) => sum + d.amount, 0);
  const totalDailyPayout = filteredDeposits.reduce((sum, d) => sum + (d.amount * (d.planPercentage / 100)), 0);

  // Pagination calculation
  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDeposits = filteredDeposits.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-6 w-full text-left min-h-screen pb-32">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl border text-xs font-bold flex items-center gap-2 bg-[#10141a]/95 border-red-500/50 text-red-500">
          ✗ {toastMsg}
        </div>
      )}
      {/* Upper Action/Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-black text-white tracking-tight uppercase">Platform Active Deposits</h3>
          <p className="text-sm text-neutral-400 font-light">
            Monitor, audit, and track active compound capital tranches running across all user wallets system-wide.
          </p>
        </div>

        {/* Search Field */}
        <div className="relative min-w-[280px]">
          <input
            type="text"
            placeholder="Search by username, currency, plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-900 p-2.5 pl-9 rounded text-white text-xs focus:outline-none focus:border-[#e4c126] font-medium"
          />
          <svg className="w-4 h-4 text-neutral-500 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0f1115] border border-neutral-900 p-6 rounded-lg flex flex-col gap-1.5 text-left">
          <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider">Total Active Capital</span>
          <span className="text-2xl font-black text-white">${totalActiveCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-[#0f1115] border border-neutral-900 p-6 rounded-lg flex flex-col gap-1.5 text-left">
          <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider">Est. Platform Daily Yield</span>
          <span className="text-2xl font-black text-[#e4c126]">${totalDailyPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-[#0f1115] border border-neutral-900 p-6 rounded-lg flex flex-col gap-1.5 text-left">
          <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider">Running Active Tranches</span>
          <span className="text-2xl font-black text-[#4ade80]">{filteredDeposits.length} Tranches</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#0f1115] border border-neutral-900 rounded-lg overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-[#e4c126] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-neutral-400 mt-4 font-semibold uppercase tracking-wider animate-pulse">
              Syncing Platform Tranches...
            </span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
            <span className="text-red-400 font-bold uppercase tracking-wider">Retrieval Conflict</span>
            <p className="text-xs text-neutral-500 mt-2 max-w-sm">{error}</p>
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
            <div className="w-16 h-16 bg-neutral-900/50 rounded-full flex items-center justify-center mb-4 border border-neutral-800">
              <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-white font-black uppercase tracking-wider">No Active Deposits Running</span>
            <span className="text-xs text-neutral-500 mt-2">Any approved deposits will start compound cycles.</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-[#050608]/80 border-b border-neutral-900 text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6">Plan Name</th>
                    <th className="py-4 px-6">Currency</th>
                    <th className="py-4 px-6 text-right">Capital Amount</th>
                    <th className="py-4 px-6 text-right">Daily Return</th>
                    <th className="py-4 px-6 text-center">Remaining Days</th>
                    <th className="py-4 px-6 text-right">Date Started</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900/50">
                  {paginatedDeposits.map((d) => {
                    const elapsed = d.planDuration - d.daysRemaining;
                    const progressPercent = Math.min(100, Math.max(0, (elapsed / d.planDuration) * 100));
                    const dailyReturn = d.amount * (d.planPercentage / 100);

                    return (
                      <tr key={d._id} className="hover:bg-neutral-900/20 transition-colors group">
                        {/* User Username Column */}
                        <td className="py-4 px-6">
                          <span className="text-sm font-extrabold text-white">{d.username}</span>
                        </td>

                        {/* Plan Name Column */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-extrabold text-white">{d.planName}</span>
                            <span className="text-[10px] font-black text-[#e4c126] uppercase tracking-wider">{d.planPercentage}% Daily Yield</span>
                          </div>
                        </td>

                        {/* Currency Column */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {d.currencyLogo ? (
                              <img src={d.currencyLogo} alt={d.currencySymbol} className="w-7 h-7 rounded-full bg-neutral-900 object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center font-black text-white text-[10px]">
                                {d.currencySymbol?.substring(0, 2).toUpperCase() || "??"}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-neutral-200">{d.currencyName}</span>
                              <span className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">{d.currencySymbol}</span>
                            </div>
                          </div>
                        </td>

                        {/* Capital Amount Column */}
                        <td className="py-4 px-6 text-right">
                          <span className="text-sm font-black font-mono text-[#4ade80]">
                            ${d.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>

                        {/* Daily Return Column */}
                        <td className="py-4 px-6 text-right">
                          <span className="text-sm font-black font-mono text-[#e4c126]">
                            +${dailyReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>

                        {/* Remaining Days Column */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1.5 items-center justify-center max-w-[140px] mx-auto">
                            <div className="flex justify-between w-full text-[10px] font-bold text-neutral-400 font-mono">
                              <span>{elapsed}/{d.planDuration} Days</span>
                              <span className="text-white">{d.daysRemaining} Left</span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-950 rounded-full border border-neutral-900 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#d8b520] to-[#e4c126] transition-all duration-500" 
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Date Column */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-[13px] font-bold text-neutral-300">
                              {new Date(d.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                            </span>
                            <span className="text-[11px] text-neutral-500 font-medium">
                              {new Date(d.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>

                        {/* Action Column */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => triggerDeleteDeposit(d._id, d.username, d.amount, d.currencySymbol)}
                            title="Delete Tranche"
                            className="p-2 rounded bg-neutral-950 border border-neutral-900 text-red-400 hover:text-white hover:bg-red-600/20 hover:border-red-500/30 transition-all cursor-pointer inline-flex items-center justify-center animate-fade-in"
                          >
                            <svg className="w-4 h-4 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="flex justify-between items-center bg-[#0a0b0d]/40 border-t border-neutral-900/60 p-4 rounded-b-lg w-full mt-auto">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  currentPage === 1
                    ? "border-neutral-950 text-neutral-600 bg-neutral-900/30 cursor-not-allowed"
                    : "border-neutral-800 text-neutral-300 hover:text-white bg-[#0f1115] hover:bg-neutral-800"
                }`}
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Previous
              </button>

              <span className="text-xs text-neutral-400 font-extrabold tracking-wider">
                Page <span className="text-[#e4c126]">{currentPage}</span> of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  currentPage === totalPages
                    ? "border-neutral-950 text-neutral-600 bg-neutral-900/30 cursor-not-allowed"
                    : "border-neutral-800 text-neutral-300 hover:text-white bg-[#0f1115] hover:bg-neutral-800"
                }`}
              >
                Next
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Premium warning dialog toast overlay */}
      {toastConfirm && toastConfirm.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300 animate-fade-in">
          <div className="bg-[#0f1115] border-2 border-red-500/60 rounded-xl max-w-md w-full p-6 md:p-8 flex flex-col gap-6 shadow-[0_0_50px_rgba(239,68,68,0.15)] transform scale-100 transition-transform">
            <div className="flex items-center gap-3 border-b border-neutral-900 pb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#241315] text-[#f87171] border border-[#3d1e22]">
                <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">Delete Active Deposit</h4>
            </div>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">{toastConfirm.message}</p>
            <div className="flex items-center justify-end gap-3.5 mt-2">
              <button
                 onClick={() => setToastConfirm(null)}
                 className="px-4 py-2 rounded border border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/30 hover:bg-neutral-800/60 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const { id } = toastConfirm;
                  setToastConfirm(null);
                  await proceedDeleteDeposit(id);
                }}
                className="px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer bg-red-600 hover:bg-red-500 text-white"
              >
                Confirm and Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
