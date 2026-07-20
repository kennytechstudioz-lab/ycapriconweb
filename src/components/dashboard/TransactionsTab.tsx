"use client";
import React from "react";

export function TransactionsTab({ isLoadingTxns, storeTransactions }: any) {
  return (
    <div className="bg-[#0f1115] border border-neutral-900 p-6 rounded flex flex-col gap-4">
      <h4 className="text-base font-extrabold text-white border-b border-neutral-900 pb-4 text-left">Full Capital Allocation Tranches</h4>
      <div className="flex flex-col gap-3">
        {isLoadingTxns ? (
          <span className="text-neutral-500 text-xs py-4 animate-pulse text-left">Syncing tranches...</span>
        ) : storeTransactions.length === 0 ? (
          <span className="text-neutral-500 text-xs py-4 font-medium text-left">No recent transactions found.</span>
        ) : (
          storeTransactions.map((txn: any) => (
            <div key={txn._id || txn.id} className="bg-[#0a0b0d] border border-neutral-900 p-4 rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  txn.transactionType === "deposit" ? "bg-[#528574]/15 text-[#528574]" : txn.transactionType === "withdrawal" ? "bg-red-500/15 text-red-500" : txn.transactionType === "capital_access" ? "bg-blue-500/15 text-blue-500" : "bg-[#e4c126]/15 text-[#e4c126]"
                }`}>
                  {txn.transactionType === "deposit" ? "↓" : txn.transactionType === "withdrawal" ? "↑" : txn.transactionType === "capital_access" ? "⚡" : "⇄"}
                </span>
                <div className="flex flex-col gap-0.5 text-left">
                  <h5 className="text-xs font-extrabold text-white capitalize">{txn.transactionType.replace("_", " ")} ({txn.currencySymbol})</h5>
                  <span className="text-[10px] text-neutral-500 font-medium">
                    {(txn._id || txn.id).slice(-8).toUpperCase()} • {new Date(txn.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-black text-white">
                  ${txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className={`text-[9px] font-extrabold bg-neutral-950 px-2 py-0.5 rounded uppercase border ${
                  txn.status === "completed" ? "text-green-400 border-green-500/20" : txn.status === "rejected" ? "text-red-400 border-red-500/20" : "text-[#e4c126] border-[#e4c126]/20"
                }`}>
                  {txn.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
