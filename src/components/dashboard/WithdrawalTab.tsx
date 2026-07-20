"use client";
import React, { useState, useEffect } from "react";
import { apiCall } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { useWalletStore } from "@/store/walletStore";
import { useToastStore } from "@/store/toastStore";

export function WithdrawalTab() {
  const { user } = useAuthStore();
  const username = user?.username || "";
  const { wallets, isLoading: loadingWallets, fetchWallets } = useWalletStore();
  const { showToast } = useToastStore();

  const [withdrawalWalletSymbol, setWithdrawalWalletSymbol] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalSubmitting, setWithdrawalSubmitting] = useState(false);

  useEffect(() => {
    if (username) {
      fetchWallets(username);
    }
  }, [username, fetchWallets]);

  useEffect(() => {
    if (wallets.length > 0 && !withdrawalWalletSymbol) {
      setWithdrawalWalletSymbol(wallets[0].currencySymbol);
    }
  }, [wallets, withdrawalWalletSymbol]);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(withdrawalAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      showToast("Please enter a valid withdrawal amount.", "warning");
      return;
    }

    const selectedWallet = wallets.find((w) => w.currencySymbol === withdrawalWalletSymbol);
    if (!selectedWallet?.address?.trim()) {
      showToast(`No payout address set for ${withdrawalWalletSymbol}. Go to Settings → Wallets to add one.`, "warning");
      return;
    }

    setWithdrawalSubmitting(true);
    try {
      await apiCall("/api/users/withdrawal", {
        method: "POST",
        body: { username, amount: amountVal, currencySymbol: withdrawalWalletSymbol },
      });
      await fetchWallets(username);
      setWithdrawalAmount("");
      showToast(`Withdrawal request of $${amountVal.toLocaleString()} submitted and is being processed.`);
    } catch (err: any) {
      showToast(err.message || "Failed to submit withdrawal request.", "warning");
    } finally {
      setWithdrawalSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left w-full">
      {/* Wallet Cards — sorted by balance descending */}
      {loadingWallets ? (
        <div className="flex items-center gap-3 py-6">
          <div className="w-5 h-5 border-2 border-[#528574] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-neutral-500">Loading wallets...</span>
        </div>
      ) : wallets.length === 0 ? (
        <p className="text-sm text-neutral-500 py-4">No wallets available. Contact support to have wallets assigned to your account.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
          {[...wallets].sort((a, b) => b.balance - a.balance).map((w) => {
            const isSelected = withdrawalWalletSymbol === w.currencySymbol;
            const hasAddress = !!w.address?.trim();
            return (
              <button
                key={w.currencySymbol}
                type="button"
                onClick={() => setWithdrawalWalletSymbol(w.currencySymbol)}
                className={`flex items-center gap-4 p-4 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-[#528574] bg-[#528574]/10 shadow-[0_0_0_1px_#528574]"
                    : "border-neutral-800 bg-[#0f1115] hover:border-neutral-700 hover:bg-[#13151a]"
                }`}
              >
                {w.currencyLogo ? (
                  <img src={w.currencyLogo} alt={w.currencySymbol} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-white/10" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {w.currencySymbol.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-extrabold text-white truncate">{w.currencyName}</span>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{w.currencySymbol}</span>
                  <span className={`text-base font-black font-mono mt-0.5 ${w.balance > 0 ? "text-[#528574]" : "text-neutral-600"}`}>
                    ${w.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  {!hasAddress && (
                    <span className="text-[9px] text-[#e4c126] font-bold uppercase tracking-wider mt-0.5">No payout address</span>
                  )}
                </div>
                {isSelected && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-[#528574] flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 stroke-white fill-none stroke-[2.5]" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Amount input + submit — only shown when a wallet is selected */}
      {withdrawalWalletSymbol && (() => {
        const selWallet = wallets.find((w) => w.currencySymbol === withdrawalWalletSymbol);
        const hasAddress = !!selWallet?.address?.trim();
        return (
          <div className="bg-[#0f1115] border border-neutral-900 rounded-lg p-6 flex flex-col gap-5 max-w-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase text-neutral-500 font-extrabold tracking-wider">Payout Amount (USD)</span>
              <span className="text-[10px] text-neutral-600 font-mono">
                Available: <span className="text-white font-bold">${(selWallet?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </span>
            </div>

            {!hasAddress ? (
              <div className="flex flex-col gap-3 bg-[#e4c126]/5 border border-[#e4c126]/20 rounded-lg p-4">
                <div className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-[#e4c126] fill-current flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <p className="text-xs text-[#e4c126] font-medium leading-relaxed">
                    No payout address is set for <span className="font-black">{selWallet?.currencyName}</span>. You need to add your {selWallet?.currencySymbol} wallet address before requesting a withdrawal.
                  </p>
                </div>
                <a
                  href="/dashboard/settings"
                  className="self-start text-[10px] font-extrabold uppercase tracking-wider bg-[#e4c126] text-neutral-900 px-4 py-2 rounded hover:bg-[#f1cf34] transition-colors"
                >
                  Go to Settings → Set Address
                </a>
              </div>
            ) : (
              <form onSubmit={handleWithdrawalSubmit} className="flex flex-col gap-4">
                <input
                  type="number"
                  required
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  min="0.01"
                  step="any"
                  className="w-full px-4 py-3.5 bg-[#0a0b0d] border border-neutral-850 rounded focus:outline-none focus:border-[#528574] text-sm text-white font-mono placeholder:text-neutral-700"
                  placeholder="Enter amount e.g. 1000"
                />
                <div className="flex items-center gap-2 bg-[#0a0b0d] border border-neutral-900 rounded px-3 py-2.5">
                  <svg className="w-3.5 h-3.5 text-neutral-600 fill-none stroke-current stroke-[2] flex-shrink-0" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                  <span className="text-[10px] text-neutral-500 font-mono truncate">{selWallet?.address}</span>
                </div>
                <button
                  type="submit"
                  disabled={withdrawalSubmitting}
                  className="w-full bg-[#528574] hover:bg-[#639b88] disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-extrabold text-sm py-4 rounded transition-colors uppercase tracking-wider"
                >
                  {withdrawalSubmitting ? "Submitting..." : "Request Withdrawal Payout"}
                </button>
              </form>
            )}
          </div>
        );
      })()}
    </div>
  );
}
