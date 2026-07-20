"use client";
import React from "react";

export function MetricCardsGrid({
  totalBalance,
  walletsLabel,
  activeDeposits,
  totalDeposits,
  totalWithdrawals,
  pendingWithdrawals,
  totalEarnings
}: {
  totalBalance: number;
  walletsLabel: string;
  activeDeposits: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  totalEarnings: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* Card 1: Total Balance from N wallets */}
      <div className="bg-[#0f1115] border border-neutral-900 p-6 rounded relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#e4c126]" />
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-3">
          Total Wallet Balance
        </span>
        <h4 className="text-2xl font-black text-white">
          ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </h4>
        <span className="text-[10px] font-bold text-[#e4c126] bg-[#e4c126]/10 px-2 py-0.5 rounded inline-block mt-2">
          Aggregated from {walletsLabel}
        </span>
      </div>

      {/* Card 2: Deposits (Active + Total) */}
      <div className="bg-[#0f1115] border border-neutral-900 p-6 rounded relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#528574]" />
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-3">
          Portfolio Deposits
        </span>
        <h4 className="text-2xl font-black text-white">
          ${activeDeposits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </h4>
        <span className="text-[10px] font-bold text-[#528574] bg-[#528574]/10 px-2 py-0.5 rounded inline-block mt-2">
          Active • Total: ${totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 0 })}
        </span>
      </div>

      {/* Card 3: Withdrawal (Pending + Total) */}
      <div className="bg-[#0f1115] border border-neutral-900 p-6 rounded relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-3">
          Total Withdrawals
        </span>
        <h4 className="text-2xl font-black text-white">
          ${totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </h4>
        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded inline-block mt-2">
          Pending: ${pendingWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 0 })}
        </span>
      </div>

      {/* Card 4: Earnings (Currently running investments) */}
      <div className="bg-[#0f1115] border border-neutral-900 p-6 rounded relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-3">
          Active Energy Earnings
        </span>
        <h4 className="text-2xl font-black text-white">
          ${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </h4>
        <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded inline-block mt-2">
          15% Average Annual Yield Rate
        </span>
      </div>

    </div>
  );
}
