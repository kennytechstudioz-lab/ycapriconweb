"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { apiCall } from "@/lib/apiClient";

interface EarningItem {
  _id: string;
  username: string;
  currencyLogo: string;
  currencyName: string;
  currencySymbol: string;
  walletId: string;
  planName: string;
  planPercent: number;
  earning: number;
  activeDepositId: string;
  createdAt: string;
}

export default function UserEarningsPage() {
  const { user } = useAuthStore();
  const username = user?.username;

  const [earnings, setEarnings] = useState<EarningItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  // Custom toast warning confirm state
  const [toastConfirm, setToastConfirm] = useState<{
    show: boolean;
    id: string;
    message: string;
  } | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (username) {
      fetchEarnings(currentPage);
    }
  }, [username, currentPage]);

  const fetchEarnings = async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCall<{
        success: boolean;
        earnings: EarningItem[];
        totalPages: number;
      }>(`/api/users/earnings?username=${username}&page=${page}&limit=20`);
      setEarnings(response.earnings || []);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve your earnings history.");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerDeleteEarning = (id: string, amount: number, symbol: string) => {
    setToastConfirm({
      show: true,
      id,
      message: `Are you absolutely sure you want to delete this yield earning record of $${amount.toFixed(2)} (${symbol})? This action is permanent and cannot be undone.`
    });
  };

  const proceedDeleteEarning = async (id: string) => {
    try {
      await apiCall(`/api/users/earnings/${id}`, { method: "DELETE" });
      fetchEarnings(currentPage);
    } catch (err: any) {
      showToast(err.message || "Failed to delete earning record.");
    }
  };

  // Filter earnings within current page
  const filteredEarnings = earnings.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.currencySymbol.toLowerCase().includes(q) ||
      e.currencyName.toLowerCase().includes(q) ||
      e.planName.toLowerCase().includes(q)
    );
  });

  const paginatedEarnings = filteredEarnings;

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
          <h3 className="text-2xl font-black text-white tracking-tight uppercase">Interest & Yield Earnings</h3>
          <p className="text-sm text-neutral-400 font-light">
            Track daily return payouts compounded from your active green energy assets and investment contracts.
          </p>
        </div>

        {/* Search Field */}
        <div className="relative min-w-[280px]">
          <input
            type="text"
            placeholder="Search by currency, plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0b0d] border border-neutral-900 p-2.5 pl-9 rounded text-white text-xs focus:outline-none focus:border-[#528574] font-medium"
          />
          <svg className="w-4 h-4 text-neutral-500 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#0f1115] border border-neutral-900 rounded-lg overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-[#528574] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-neutral-400 mt-4 font-semibold uppercase tracking-wider animate-pulse">
              Calculating your yields...
            </span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
            <span className="text-red-400 font-bold uppercase tracking-wider">Failed to Sync</span>
            <p className="text-xs text-neutral-500 mt-2 max-w-sm">{error}</p>
          </div>
        ) : filteredEarnings.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
            <div className="w-16 h-16 bg-neutral-900/50 rounded-full flex items-center justify-center mb-4 border border-neutral-800">
              <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-white font-black uppercase tracking-wider">No Yields Earned Yet</span>
            <span className="text-xs text-neutral-500 mt-2">Daily interest payouts will automatically post here once your approved deposits tick.</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-[#050608]/80 border-b border-neutral-900 text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                    <th className="py-4 px-6">Asset / Plan</th>
                    <th className="py-4 px-6">Currency</th>
                    <th className="py-4 px-6 text-right">Earning Generated</th>
                    <th className="py-4 px-6 text-right">Date Received</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900/50">
                  {paginatedEarnings.map((e) => (
                    <tr key={e._id} className="hover:bg-neutral-900/20 transition-colors group">
                      {/* Plan Column */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold text-white">{e.planName}</span>
                          <span className="text-[10px] font-black text-[#528574] uppercase tracking-wider">{e.planPercent}% Daily Rate</span>
                        </div>
                      </td>

                      {/* Currency Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {e.currencyLogo ? (
                            <img src={e.currencyLogo} alt={e.currencySymbol} className="w-7 h-7 rounded-full bg-neutral-900 object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center font-black text-white text-[10px]">
                              {e.currencySymbol?.substring(0, 2).toUpperCase() || "??"}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-neutral-200">{e.currencyName}</span>
                            <span className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">{e.currencySymbol}</span>
                          </div>
                        </div>
                      </td>

                      {/* Earning amount column */}
                      <td className="py-4 px-6 text-right">
                        <span className="text-sm font-black font-mono text-[#4ade80]">
                          +${e.earning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Date & Time Column */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[13px] font-bold text-neutral-300">
                            {new Date(e.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                          </span>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            {new Date(e.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => triggerDeleteEarning(e._id, e.earning, e.currencySymbol)}
                          title="Delete Earning Record"
                          className="p-2 rounded bg-neutral-950 border border-neutral-900 text-red-400 hover:text-white hover:bg-red-600/20 hover:border-red-500/30 transition-all cursor-pointer inline-flex items-center justify-center animate-fade-in"
                        >
                          <svg className="w-4 h-4 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
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
                Page <span className="text-[#528574]">{currentPage}</span> of {totalPages}
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
              <h4 className="text-lg font-black text-white uppercase tracking-wider">Delete Earning Record</h4>
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
                  await proceedDeleteEarning(id);
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
