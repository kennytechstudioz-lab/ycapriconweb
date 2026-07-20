"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiCall } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";

export function ActiveDepositsTab() {
  const { user } = useAuthStore();
  const username = user?.username;

  const [activeDepositsList, setActiveDepositsList] = useState<any[]>([]);
  const [loadingActiveDeposits, setLoadingActiveDeposits] = useState(true);

  useEffect(() => {
    const fetchActiveDeposits = async () => {
      if (!username) return;
      try {
        setLoadingActiveDeposits(true);
        const response = await apiCall<{ success: boolean; activeDeposits: any[] }>(
          `/api/users/active-deposits?username=${username}`
        );
        if (response.success) {
          setActiveDepositsList(response.activeDeposits || []);
        }
      } catch (error) {
        console.error("✗ Failed to load active deposits:", error);
      } finally {
        setLoadingActiveDeposits(false);
      }
    };
    
    fetchActiveDeposits();
  }, [username]);

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in text-left">
      <div className="bg-[#0f1115] border border-neutral-900 rounded-lg overflow-hidden flex flex-col">
        {loadingActiveDeposits ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[300px]">
            <div className="w-8 h-8 border-3 border-[#528574] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-neutral-500 text-xs mt-3 animate-pulse">Syncing energy portfolios...</span>
          </div>
        ) : activeDepositsList.length === 0 ? (
          <div className="py-20 text-center flex flex-col gap-3 items-center justify-center min-h-[300px] p-6">
            <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center mb-1 border border-neutral-800">
              <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-extrabold text-sm uppercase tracking-wider">No Active Tranches Running</span>
            <span className="text-neutral-500 text-xs">Any approved deposits will start compound cycles.</span>
            <Link href="/dashboard/deposit" className="text-xs text-[#528574] hover:underline font-extrabold uppercase mt-2 animate-pulse">
              Invest In Clean Energy Plan →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#050608]/80 border-b border-neutral-900 text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                  <th className="py-4 px-6">Plan Name</th>
                  <th className="py-4 px-6">Currency</th>
                  <th className="py-4 px-6 text-right">Capital Amount</th>
                  <th className="py-4 px-6 text-right">Daily Return</th>
                  <th className="py-4 px-6 text-center">Remaining Days</th>
                  <th className="py-4 px-6 text-right">Date Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/50">
                {activeDepositsList.map((d: any, index: number) => {
                  const elapsed = d.planDuration - d.daysRemaining;
                  const progressPercent = Math.min(100, Math.max(0, (elapsed / d.planDuration) * 100));
                  const dailyYield = d.amount * (d.planPercentage / 100);

                  return (
                    <tr key={d._id || `active-${index}`} className="hover:bg-neutral-900/20 transition-colors group">
                      {/* Plan Name Column */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold text-white">{d.planName}</span>
                          <span className="text-[10px] font-black text-[#528574] uppercase tracking-wider">{d.planPercentage}% Daily Yield</span>
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
                          +${dailyYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                              className="h-full bg-gradient-to-r from-[#3b6357] to-[#528574] transition-all duration-500" 
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Date Started Column */}
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
