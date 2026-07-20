"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/apiClient";

export function FundAccountModal({
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
  const [fundAccountStep, setFundAccountStep] = useState<1 | 2>(1);
  const [fundAccountAmount, setFundAccountAmount] = useState("");
  const [fundAccountWalletSymbol, setFundAccountWalletSymbol] = useState("");
  const [fundAccountSubmitting, setFundAccountSubmitting] = useState(false);
  const [fundAccountError, setFundAccountError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFundAccountStep(1);
      setFundAccountAmount("");
      setFundAccountWalletSymbol("");
      setFundAccountError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#13151a] border border-neutral-800 rounded-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
          <h3 className="text-lg font-black text-white">Fund Account</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {fundAccountStep === 1 ? (
          <div className="p-6 flex flex-col gap-5">
            <p className="text-sm text-neutral-400">
              Select a wallet and enter the amount you wish to fund. The minimum amount is ${plans[0]?.min?.toLocaleString() || 0}.
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Select Wallet</label>
              <div className="relative">
                <select
                  value={fundAccountWalletSymbol}
                  onChange={(e) => setFundAccountWalletSymbol(e.target.value)}
                  className="w-full bg-[#0a0b0d] border border-neutral-800 text-white text-sm rounded px-4 py-3 appearance-none focus:outline-none focus:border-[#e4c126]"
                >
                  <option value="" disabled>Select Wallet</option>
                  {wallets.map((w) => (
                    <option key={w.id || w.currencyId || w.currencySymbol} value={w.currencySymbol}>
                      {w.currencyName} ({w.currencySymbol})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Amount (USD)</label>
              <input
                type="number"
                value={fundAccountAmount}
                onChange={(e) => {
                  setFundAccountAmount(e.target.value);
                  if (fundAccountError) setFundAccountError("");
                }}
                placeholder={`Min: $${plans[0]?.min?.toLocaleString() || 0}`}
                className={`w-full bg-[#0a0b0d] border ${fundAccountError ? 'border-red-500/50 focus:border-red-500' : 'border-neutral-800 focus:border-[#e4c126]'} text-white text-sm rounded px-4 py-3 focus:outline-none`}
              />
              {fundAccountError && (
                <span className="text-xs font-bold text-red-400 mt-0.5">{fundAccountError}</span>
              )}
            </div>

            <button
              onClick={() => {
                setFundAccountError("");
                if (!fundAccountWalletSymbol) {
                  showToast("Please select a wallet first.", "warning");
                  return;
                }
                if (!fundAccountAmount) {
                  setFundAccountError("Please enter an amount.");
                  return;
                }
                const minAmount = plans[0]?.min || 0;
                if (parseFloat(fundAccountAmount) < minAmount) {
                  setFundAccountError(`The minimum funding amount is $${minAmount.toLocaleString()}.`);
                  return;
                }
                setFundAccountStep(2);
              }}
              className="w-full bg-[#e4c126] hover:bg-[#c9a61b] text-neutral-950 font-bold py-3 rounded transition-colors mt-2 cursor-pointer"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-5 text-center">
            <p className="text-sm text-neutral-400">
              Please send exactly <strong className="text-white">${parseFloat(fundAccountAmount).toLocaleString()} USD equivalent</strong> to the address below.
            </p>
            
            {wallets.find(w => w.currencySymbol === fundAccountWalletSymbol)?.companyAddress ? (
              <>
                <div className="flex justify-center my-2">
                  <div className="p-3 bg-white rounded border border-neutral-850 shadow-md">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&color=0f1115&data=${encodeURIComponent(wallets.find(w => w.currencySymbol === fundAccountWalletSymbol)?.companyAddress || "")}`}
                      alt="Wallet Address QR"
                      className="w-[140px] h-[140px]"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 text-left bg-[#0a0b0d] p-4 rounded border border-neutral-800">
                  <span className="text-[11px] font-extrabold uppercase text-neutral-500 tracking-wider">Company Address</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-neutral-300 break-all select-all flex-1">
                      {wallets.find(w => w.currencySymbol === fundAccountWalletSymbol)?.companyAddress}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(wallets.find(w => w.currencySymbol === fundAccountWalletSymbol)?.companyAddress || "");
                        showToast("Address copied to clipboard!");
                      }}
                      className="p-2 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 transition-colors"
                    >
                      <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded text-sm">
                No company address set for {fundAccountWalletSymbol}. Please contact support.
              </div>
            )}

            <button
              disabled={fundAccountSubmitting || !wallets.find(w => w.currencySymbol === fundAccountWalletSymbol)?.companyAddress}
              onClick={async () => {
                setFundAccountSubmitting(true);
                try {
                  const response = await apiCall<{success: boolean; error?: string}>("/api/users/fund", {
                    method: "POST",
                    body: { 
                      username, 
                      walletSymbol: fundAccountWalletSymbol, 
                      amount: parseFloat(fundAccountAmount)
                    },
                  });
                  
                  if (response.success) {
                    showToast("Funding request submitted successfully! Pending admin approval.");
                    onClose();
                    router.push("/dashboard/transactions");
                  } else {
                    showToast(response.error || "Failed to submit funding request.", "warning");
                  }
                } catch (err: any) {
                  showToast(err.message || "Failed to submit funding request.", "warning");
                } finally {
                  setFundAccountSubmitting(false);
                }
              }}
              className="w-full bg-[#528574] hover:bg-[#436e5f] text-white font-bold py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
            >
              {fundAccountSubmitting ? "Submitting..." : "I have made the transfer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
