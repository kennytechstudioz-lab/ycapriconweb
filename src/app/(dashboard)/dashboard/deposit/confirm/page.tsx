"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { apiCall } from "@/lib/apiClient";
import { usePlanStore } from "@/store/planStore";

// Interface for backend responses
interface WalletItem {
  id: string;
  currencyId: string;
  currencyName: string;
  currencySymbol: string;
  currencyLogo: string;
  address: string;
  companyAddress: string;
  balance: number;
  totalDeposit: number;
  totalWithdrawal: number;
  activeDeposit: number;
}

function ConfirmDepositContent() {
  const { user } = useAuthStore();
  const username = user?.username;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search parameter values
  const amountStr = searchParams.get("amount") || "0";
  const planId = searchParams.get("planId") || "";
  const walletSymbol = searchParams.get("walletSymbol") || "";
  const source = searchParams.get("source") || "direct";

  const amountVal = parseFloat(amountStr) || 0;

  const { plans, fetchPlans, isLoading: loadingPlans } = usePlanStore();
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    if (username) {
      fetchWallets();
    }
  }, [username]);

  const fetchWallets = async () => {
    try {
      setLoadingWallets(true);
      const response = await apiCall<{ success: boolean; wallets: WalletItem[] }>(
        `/api/users/wallets?username=${username}`
      );
      if (response && response.success) {
        setWallets(response.wallets || []);
      }
    } catch (err) {
      console.error("✗ Failed to load wallets on confirmation page:", err);
    } finally {
      setLoadingWallets(false);
    }
  };

  const showToastMsg = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Find active selections
  const activeW = wallets.find((w) => w.currencySymbol === walletSymbol);
  const activePlan = plans.find((p) => (p.id || p._id) === planId);

  // Fallbacks if stores are still loading
  const loading = loadingPlans || loadingWallets;

  // Perform Calculations
  const percent = activePlan?.percent || 0;
  const duration = activePlan?.duration || 0;
  const dailyEarning = amountVal * (percent / 100);
  const weeklyEarning = dailyEarning * 7;
  const monthlyEarning = dailyEarning * 30;
  const totalEarning = dailyEarning * duration;

  const handleConfirm = async () => {
    if (amountVal <= 0 || !walletSymbol || !planId) {
      showToastMsg("Missing valid parameters. Please go back.", "error");
      return;
    }

    if (source === "balance" && activeW && activeW.balance < amountVal) {
      showToastMsg("Insufficient balance to deduct from this wallet.", "warning");
      return;
    }

    try {
      setConfirming(true);
      const response = await apiCall<{ success: boolean; message: string }>(
        "/api/users/deposit",
        {
          method: "POST",
          body: {
            username,
            walletSymbol,
            amount: amountVal,
            source,
            planId,
          },
        }
      );

      if (response && response.success) {
        showToastMsg(
          source === "balance"
            ? `Successfully allocated $${amountVal.toLocaleString()} to ${activePlan?.name}!`
            : `Clean energy deposit of $${amountVal.toLocaleString()} submitted successfully!`,
          "success"
        );
        router.push("/dashboard/transactions");
      } else {
        showToastMsg("Failed to process allocation request. Please try again.", "error");
      }
    } catch (err: any) {
      console.error("✗ Error completing deposit:", err);
      showToastMsg(err.message || "An unexpected error occurred during confirmation.", "error");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#e4c126] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-neutral-400 mt-4 font-semibold uppercase tracking-wider animate-pulse">
          Validating tranches and retrieving secure ledgers...
        </span>
      </div>
    );
  }

  if (!activePlan || !activeW) {
    return (
      <div className="bg-[#0f1115] border border-neutral-900 p-8 rounded-lg text-center flex flex-col items-center justify-center gap-4 max-w-xl mx-auto mt-12">
        <span className="text-base text-red-400 font-extrabold uppercase tracking-wide">Invalid or Corrupt Parameters</span>
        <p className="text-sm text-neutral-400">
          The parameters passed are incorrect or the selected assets could not be retrieved from the ledgers.
        </p>
        <button
          onClick={() => router.push("/dashboard/deposit")}
          className="px-6 py-3 bg-[#e4c126] hover:bg-[#c9a61b] text-neutral-950 font-black text-xs rounded uppercase tracking-wider transition-colors cursor-pointer"
        >
          Return to Deposit Selection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto mt-4 text-left">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-lg shadow-xl border flex items-center gap-3 animate-fade-in ${
            toast.type === "success"
              ? "bg-[#0c1512] border-[#528574] text-[#528574]"
              : toast.type === "warning"
              ? "bg-[#18150c] border-[#e4c126] text-[#e4c126]"
              : "bg-[#190e0e] border-red-950 text-red-400"
          }`}
        >
          <span className="text-sm font-extrabold">{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="px-[10px] md:px-0">
        <h3 className="text-xl font-black text-white tracking-tight uppercase">Confirm Capital Allocation</h3>
        <p className="text-[13px] text-neutral-400 mt-1">
          Review details carefully to authorize this clean energy allocation tranche.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-2">
        {/* Left Side: Summary and Source Information */}
        <div className="bg-[#0f1115] border border-neutral-900 px-[10px] py-6 md:p-8 rounded-lg flex flex-col gap-6 w-full">
          {/* QR Scan Code & Copy Address Box at the absolute top of the left side (only for direct transfer) */}
          {source !== "balance" && (
            <div className="flex flex-col items-center justify-center bg-neutral-950 px-[10px] py-6 md:p-6 rounded-lg border border-neutral-900/60 animate-fade-in gap-4 text-center w-full">
              <div className="flex flex-col items-center gap-3">
                <span className="text-[11px] font-extrabold uppercase text-[#e4c126] tracking-widest">Scan QR Code to Transfer</span>
                <div className="p-3 bg-white rounded flex items-center justify-center border border-neutral-850 shadow-md">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&color=0f1115&data=${encodeURIComponent(activeW.companyAddress || "")}`}
                    alt="Wallet Address QR"
                    className="w-[140px] h-[140px]"
                  />
                </div>
                <span className="text-[11px] text-neutral-500 font-medium">Scan with your camera or wallet application</span>
              </div>

              <div className="flex flex-col items-center mt-1">
                <span className="text-[11px] text-neutral-400 font-extrabold uppercase tracking-wider mb-1">Amount to Send</span>
                <span className="text-xl font-black text-white">${amountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className="text-xs text-[#e4c126] font-bold uppercase tracking-widest mt-0.5">{activeW.currencySymbol}</span>
              </div>

              {/* Copy Address bar directly below the QR code */}
              <div className="flex flex-col gap-1.5 w-full border-t border-neutral-900/60 pt-4 mt-1 text-left">
                <span className="text-[11px] font-extrabold uppercase text-neutral-500 tracking-wider">
                  Company Official Deposit Address
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs text-neutral-300 break-all select-all flex-1 py-2 px-3 bg-neutral-900 border border-neutral-850 rounded">
                    {activeW.companyAddress || "0x...AddressNotSetByAdmin"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeW.companyAddress || "");
                      showToastMsg("Official address copied to clipboard!");
                    }}
                    className="p-3 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-850"
                    title="Copy Address"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v10.125c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a1.5 1.5 0 00-1.5-1.5h-2.625a3.375 3.375 0 00-3.375 3.375V19.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-neutral-900 pb-3.5">
              1. Investment Summary
            </h4>
          </div>

          <div className="flex flex-col gap-4">
            {/* Plan Card */}
            <div className="bg-[#0a0b0d] border border-neutral-850 p-5 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                {activePlan.picture ? (
                  <img
                    src={activePlan.picture}
                    alt={activePlan.name}
                    className="w-10 h-10 rounded object-cover bg-neutral-950"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-[#e4c126]/10 border border-[#e4c126]/20 flex items-center justify-center text-sm font-black text-white">
                    {activePlan.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white">{activePlan.name}</span>
                  <span className="text-[13px] text-neutral-500 font-semibold">Selected Pool Plan</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-[#e4c126] block">{percent}% Daily</span>
                <span className="text-[13px] text-neutral-500 font-bold">{duration} Days duration</span>
              </div>
            </div>

            {/* Selected Wallet Card */}
            <div className="bg-[#0a0b0d] border border-neutral-850 p-5 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                {activeW.currencyLogo ? (
                  <img
                    src={activeW.currencyLogo}
                    alt={activeW.currencyName}
                    className="w-10 h-10 rounded-full object-cover bg-neutral-950"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-black text-white text-xs">
                    {activeW.currencySymbol.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white">{activeW.currencyName}</span>
                  <span className="text-[13px] text-neutral-500 font-semibold">Capital Ledger Wallet</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-white block uppercase">{activeW.currencySymbol}</span>
                <span className="text-[13px] text-neutral-500 font-bold">
                  Available: ${activeW.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Projections & Action Button */}
        <div className="bg-[#0f1115] border border-neutral-900 px-[10px] py-6 md:p-8 rounded-lg flex flex-col justify-between gap-8 w-full">
          <div className="flex flex-col gap-6">
            {/* Allocation Source & Transaction Ledger Details */}
            <div className="flex flex-col gap-4">
              <h5 className="text-[13px] font-extrabold uppercase text-white tracking-wider border-b border-neutral-900 pb-3.5">
                2. Funding & Payment Details
              </h5>

              {source === "balance" ? (
                <div className="bg-[#050608]/40 border border-neutral-900 p-5 rounded-lg flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-neutral-500">Allocation Method</span>
                    <span className="font-extrabold text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-850">
                      Deduct Balance
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-neutral-500">Current Wallet Balance</span>
                    <span className="font-bold text-neutral-300 font-mono">
                      ${activeW.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] border-t border-neutral-900/60 pt-2.5">
                    <span className="text-neutral-500 font-semibold">Tranche Deduct Amount</span>
                    <span className="font-extrabold text-red-400 font-mono">
                      -${amountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] border-t border-neutral-900/60 pt-2.5">
                    <span className="text-neutral-500 font-semibold">Remaining Wallet Balance</span>
                    <span className="font-black text-green-400 font-mono">
                      ${(activeW.balance - amountVal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#050608]/40 border border-neutral-900 p-5 rounded-lg flex flex-col gap-4">
                  <div className="flex justify-between items-center text-[13px] border-b border-neutral-900/60 pb-2.5">
                    <span className="text-neutral-500">Allocation Method</span>
                    <span className="font-extrabold text-[#e4c126] bg-[#e4c126]/5 px-2 py-0.5 rounded border border-[#e4c126]/20 uppercase">
                      Add Wallet (Direct Transfer)
                    </span>
                  </div>

                  <div className="text-[13px] text-neutral-400 bg-neutral-950 p-4 border border-neutral-900 rounded leading-relaxed">
                    <span className="text-[#e4c126] font-extrabold uppercase block mb-1">⚠️ Transfer Action Required</span>
                    Please make a transfer of exactly <strong className="text-white">${amountVal.toLocaleString()} USD equivalent</strong> in <strong className="text-white uppercase">{activeW.currencySymbol}</strong> to the official secure address above. Once submitted, our auditing team will verify the blockchain transaction hash to activate your green energy tranche.
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2">
              <h4 className="text-[13px] font-extrabold text-white uppercase tracking-wider border-b border-neutral-900 pb-3.5 flex items-center justify-between">
                <span>3. Real-Time Yield Projections</span>
                <span className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] uppercase font-bold tracking-widest animate-pulse">
                  Limits Verified
                </span>
              </h4>
            </div>

            {/* Projections Matrix */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#0a0b0d] border border-neutral-900 p-3.5 rounded flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold text-neutral-500 uppercase tracking-widest">Daily Yield</span>
                  <span className="text-sm font-black text-green-400 font-mono">
                    ${dailyEarning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="bg-[#0a0b0d] border border-neutral-900 p-3.5 rounded flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold text-neutral-500 uppercase tracking-widest">Weekly Yield</span>
                  <span className="text-sm font-black text-green-400 font-mono">
                    ${weeklyEarning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="bg-[#0a0b0d] border border-neutral-900 p-3.5 rounded flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold text-neutral-500 uppercase tracking-widest">Monthly Yield</span>
                  <span className="text-sm font-black text-green-400 font-mono">
                    ${monthlyEarning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[13px] text-neutral-400 pt-4 border-t border-neutral-900/60 mt-1">
                <span className="font-semibold">Tranche Investment Value</span>
                <span className="font-extrabold text-white font-mono text-sm">
                  ${amountVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-[13px] text-neutral-400 pt-3 border-t border-neutral-900/40">
                <span className="font-semibold">Total Net Pool Returns ({duration} Days)</span>
                <span className="font-black text-[#e4c126] font-mono text-base">
                  ${totalEarning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>


          </div>

          <div className="flex flex-col gap-3 w-full border-t border-neutral-900 pt-6">
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full bg-[#e4c126] hover:bg-[#c9a61b] text-neutral-950 font-black text-sm py-4 rounded transition-all uppercase tracking-wider text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#e4c126]/5"
            >
              {confirming ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Authorizing Allocation...</span>
                </div>
              ) : source === "balance" ? (
                "Authorize Balance Allocation"
              ) : (
                "Complete Direct Transfer Deposit"
              )}
            </button>

            <button
              onClick={() => router.push("/dashboard/deposit")}
              disabled={confirming}
              className="w-full bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 text-neutral-400 hover:text-white font-extrabold text-xs py-3 rounded transition-colors uppercase tracking-wider text-center cursor-pointer"
            >
              Cancel Allocation & Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmDepositPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-[#e4c126] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-neutral-400 mt-4 font-semibold uppercase tracking-wider animate-pulse">
            Loading secure payment interface...
          </span>
        </div>
      }
    >
      <ConfirmDepositContent />
    </Suspense>
  );
}
