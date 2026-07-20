"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/apiClient";

export function CapitalAccessModal({
  isOpen,
  onClose,
  wallets,
  plans,
  username,
  showToast
}: {
  isOpen: boolean;
  onClose: () => void;
  wallets: any[];
  plans: any[];
  username?: string;
  showToast: (msg: string, type?: "success" | "warning") => void;
}) {
  const router = useRouter();
  const [capitalAccessWalletSymbol, setCapitalAccessWalletSymbol] = useState("");
  const [capitalAccessSubmitting, setCapitalAccessSubmitting] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#13151a] border border-neutral-800 rounded-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
          <h3 className="text-lg font-black text-white">Access 300% Capital</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <p className="text-sm text-neutral-400">
            Select a wallet to receive your 300% Capital Access. This will create a pending transaction for admin approval.
          </p>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Select Wallet</label>
            <div className="relative">
              <select
                value={capitalAccessWalletSymbol}
                onChange={(e) => setCapitalAccessWalletSymbol(e.target.value)}
                className="w-full bg-[#0a0b0d] border border-neutral-800 text-white text-sm rounded px-4 py-3 appearance-none focus:outline-none focus:border-[#528574]"
              >
                <option value="" disabled>Select Wallet</option>
                {wallets.filter(w => w.balance > 0).map((w) => (
                  <option key={w.id || w.currencyId || w.currencySymbol} value={w.currencySymbol}>
                    {w.currencyName} ({w.currencySymbol}) - Balance: ${w.balance.toLocaleString()}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>
          </div>
          
          <button
            disabled={!capitalAccessWalletSymbol || capitalAccessSubmitting}
            onClick={async () => {
              setCapitalAccessSubmitting(true);
              try {
                const firstPlan = plans[0];
                if (!firstPlan) throw new Error("No plans available.");
                
                const selectedWallet = wallets.find(w => w.currencySymbol === capitalAccessWalletSymbol);
                if (!selectedWallet || selectedWallet.balance <= 0) {
                  showToast("Selected wallet has no balance.", "warning");
                  setCapitalAccessSubmitting(false);
                  return;
                }
                
                const amountVal = selectedWallet.balance * 3;
                
                const response = await apiCall<{success: boolean; error?: string}>("/api/users/capital-access", {
                  method: "POST",
                  body: { 
                    username, 
                    walletSymbol: capitalAccessWalletSymbol, 
                    amount: amountVal,
                    planId: firstPlan.id || (firstPlan as any)._id
                  },
                });
                
                if (response.success) {
                  showToast("access transaction is created successfully waiting for admin aproval");
                  onClose();
                  router.push("/dashboard/transactions");
                } else {
                  showToast(response.error || "Failed to request capital access.", "warning");
                }
              } catch (err: any) {
                showToast(err.message || "Failed to request capital access.", "warning");
              } finally {
                setCapitalAccessSubmitting(false);
              }
            }}
            className="w-full bg-[#528574] hover:bg-[#436e5f] text-white font-bold py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {capitalAccessSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
