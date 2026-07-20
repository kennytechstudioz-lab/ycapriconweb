"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/apiClient";
import { useSettingStore } from "@/store/settingStore";
import { useUserStore } from "@/store/userStore";
import { usePlanStore } from "@/store/planStore";
import { useTransactionStore } from "@/store/transactionStore";

import { WarningToast } from "./WarningToast";
import { CapitalAccessModal } from "./CapitalAccessModal";
import { FundAccountModal } from "./FundAccountModal";
import { MetricCardsGrid } from "./MetricCardsGrid";
import { RecentCapitalTranches } from "./RecentCapitalTranches";

export interface WalletItem {
  id: string;
  currencyId: string;
  currencyName: string;
  currencySymbol: string;
  currencyLogo: string;
  address: string;
  balance: number;
  totalDeposit: number;
  totalWithdrawal: number;
  activeDeposit: number;
}

// TradingView commodities chart widget
function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    // Clear any existing children to prevent duplicates on rerender
    container.current.innerHTML = "";
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": [
        [
          "Crude Oil WTI (USOIL)",
          "TVC:USOIL|240"
        ],
        [
          "Brent Crude Oil (UKOIL)",
          "TVC:UKOIL|240"
        ],
        [
          "Gold Spot (XAUUSD)",
          "OANDA:XAUUSD|240"
        ],
        [
          "Silver Spot (XAGUSD)",
          "OANDA:XAGUSD|240"
        ]
      ],
      "chartOnly": false,
      "width": "100%",
      "height": "400",
      "locale": "en",
      "colorTheme": "dark",
      "autosize": true,
      "showVolume": false,
      "showMA": false,
      "hideDateRanges": false,
      "hideMarketStatus": false,
      "hideSymbolLogo": false,
      "scalePosition": "right",
      "scaleMode": "Normal",
      "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      "fontSize": "10",
      "noHeader": false,
      "valuesTracking": "1",
      "changeMode": "price-and-percent",
      "chartType": "area",
      "maLineColor": "#2962FF",
      "maLineWidth": 1,
      "maLength": 9,
      "lineWidth": 2,
      "lineColor": "#e4c126",
      "topColor": "rgba(228, 193, 38, 0.3)",
      "bottomColor": "rgba(228, 193, 38, 0)"
    });
    container.current.appendChild(script);
  }, []);

  return (
    <div className="flex flex-col gap-3 bg-[#0f1115] border border-neutral-900 p-6 rounded text-left">
      <div className="flex flex-col gap-0.5">
        <h4 className="text-base font-extrabold text-white tracking-wide">Commodities Market Overview</h4>
        <p className="text-xs text-neutral-400 font-light">Real-time TradingView tracking of active energy commodities (4-Hour interval).</p>
      </div>
      <div className="tradingview-widget-container w-full" ref={container}>
        <div className="tradingview-widget-container__widget w-full"></div>
      </div>
    </div>
  );
}

function DashboardContent({ tab }: { tab: string }) {
  const { user } = useAuthStore();
  const username = user?.username;
  const router = useRouter();

  const { setting, fetchSettings } = useSettingStore();
  const { profile, fetchProfile, updateProfile } = useUserStore();
  const { plans, fetchPlans: fetchStorePlans, isLoading: loadingPlans } = usePlanStore();
  const { transactions: storeTransactions, fetchTransactions, isLoading: isLoadingTxns } = useTransactionStore();

  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(true);


  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [depositSource, setDepositSource] = useState<"balance" | "direct">("direct");

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchStorePlans();
  }, [fetchStorePlans]);

  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id || plans[0]._id || "");
    }
  }, [plans, selectedPlanId]);


  useEffect(() => {
    if (username) {
      fetchProfile(username);
      fetchTransactions(username);
    }
  }, [username, fetchTransactions]);






  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "warning">("success");
 
  

  // Earnings tracking states
  const [earningsList, setEarningsList] = useState<any[]>([]);

  const fetchEarnings = async () => {
    if (!username) return;
    try {
      const response = await apiCall<{ success: boolean; earnings: any[] }>(
        `/api/users/earnings?username=${username}`
      );
      if (response.success) {
        setEarningsList(response.earnings || []);
      }
    } catch (error) {
      console.error("✗ Failed to load earnings:", error);
    }
  };








  // Fetch wallets on mount / username load
  useEffect(() => {
    if (username) {
      fetchWallets();
      fetchEarnings();
    } else {
      setLoadingWallets(false);
    }
  }, [username, tab]);



  const showToast = (message: string, type: "success" | "warning" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };



  const fetchWallets = async () => {
    try {
      setLoadingWallets(true);
      const response = await apiCall<{ success: boolean; wallets: WalletItem[] }>(
        `/api/users/wallets?username=${username}`
      );
      if (response.success) {
        setWallets(response.wallets || []);
      }
    } catch (error) {
      console.error("✗ Failed to load investor wallets:", error);
    } finally {
      setLoadingWallets(false);
    }
  };

  // Calculations across wallets
  const numWallets = wallets.length;
  const walletsLabel = numWallets === 1 ? "1 Wallet" : `${numWallets} Wallets`;

  const totalBalance = wallets.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const activeDeposits = wallets.reduce((acc, curr) => acc + (curr.activeDeposit || 0), 0);
  const totalDeposits = wallets.reduce((acc, curr) => acc + (curr.totalDeposit || 0), 0);

  const totalWithdrawals = storeTransactions
    .filter((t) => t.transactionType === "withdrawal")
    .reduce((acc, t) => acc + (t.amount || 0), 0);
  const pendingWithdrawals = storeTransactions
    .filter((t) => t.transactionType === "withdrawal" && t.status === "pending")
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const totalEarnings = earningsList.reduce((acc, e) => acc + (e.earning || 0), 0);


  // Capital Access states
  const [showCapitalAccessModal, setShowCapitalAccessModal] = useState(false);
  const [capitalAccessWalletSymbol, setCapitalAccessWalletSymbol] = useState("");
  const [capitalAccessSubmitting, setCapitalAccessSubmitting] = useState(false);

  // Fund Account states
  const [showFundModal, setShowFundModal] = useState(false);


  const rawDomain = setting?.domainName || "oeelco.com";
  const domainUrl = rawDomain.startsWith("http://") || rawDomain.startsWith("https://")
    ? rawDomain
    : `https://${rawDomain}`;
  const inviteLink = `${domainUrl}?ref=${username || ""}`;


  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-8 text-left relative min-h-screen">
      
      {/* Dynamic Toast warning/success banner */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded border shadow-2xl flex items-center gap-3 animate-fade-in ${
          toastType === "warning" 
            ? "bg-[#13151a] border-red-500/30 text-red-400" 
            : "bg-[#13151a] border-green-500/30 text-green-400"
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${toastType === "warning" ? "bg-red-500" : "bg-green-500"}`} />
          <span className="text-sm font-extrabold tracking-wide uppercase">{toastMessage}</span>
        </div>
      )}

      {/* Welcome & Overview headings with inline Referral Link on the right */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-black text-white tracking-tight capitalize">
            {tab === "portfolio" ? "Investor Portfolio" : tab === "settings" ? "Security Settings" : `${tab} Workspace`}
          </h3>
          <p className="text-sm text-neutral-400 font-light">
            {tab === "portfolio" 
              ? "Track clean energy yields, CCUS dividends, and carbon certificates from registered wallets."
              : tab === "settings"
              ? "Manage your multi-factor security, change password, and configure payout destination addresses."
              : `Manage your ${tab} parameters, history, and Capricorn Energy sustainable tranches.`}
          </p>
        </div>

        {tab === "portfolio" && username && (
          <div className="flex items-center gap-3 bg-[#e4c126]/5 border border-[#e4c126]/20 rounded-lg px-4 py-2 text-sm self-start md:self-auto">
            <div className="flex flex-col text-left">
              <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-black">My Referral Link</span>
              <span className="font-mono text-[#e4c126] font-bold">
                {inviteLink}
              </span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                showToast("Referral link copied to clipboard!");
              }}
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Copy Invite Link"
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v10.125c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a1.5 1.5 0 00-1.5-1.5h-2.625a3.375 3.375 0 00-3.375 3.375V19.5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Promo banner — portfolio tab only */}
      {tab === "portfolio" && (
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-[#528574]/10 border border-[#528574]/25 rounded-xl px-6 py-6 overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-6 -right-6 w-40 h-40 bg-[#528574]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="w-14 h-14 rounded-full bg-[#528574]/20 border border-[#528574]/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-[#528574] fill-current" viewBox="0 0 24 24">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
          </div>

          <div className="flex flex-col gap-1.5 relative z-10">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#528574]">🎁 Limited Time Promo</span>
            <p className="text-base sm:text-lg font-black text-white leading-snug">
              100% Capital Guarantee & Insurance
            </p>
            <p className="text-sm text-neutral-400 font-medium">
              Start investing today and watch your portfolio grow faster. This offer is available for new investors on their first plan activation.
            </p>
          </div>
          <button
            onClick={() => {
              if (totalBalance > 0) {
                setShowCapitalAccessModal(true);
              } else {
                showToast(`Insufficient balance to access capital.`, "warning");
              }
            }}
            className="relative z-10 ml-auto whitespace-nowrap bg-[#528574] hover:bg-[#436e5f] text-white text-sm font-bold px-6 py-3 rounded transition-colors"
          >
            Access 300% Capital
          </button>
        </div>
      )}

      {/* Capital Access Modal */}
      {showCapitalAccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#13151a] border border-neutral-800 rounded-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-lg font-black text-white">Access 300% Capital</h3>
              <button onClick={() => setShowCapitalAccessModal(false)} className="text-neutral-500 hover:text-white transition">
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
                      setShowCapitalAccessModal(false);
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
      )}

      {/* Fund Account Modal */}
      <FundAccountModal
        isOpen={showFundModal}
        onClose={() => setShowFundModal(false)}
        wallets={wallets}
        plans={plans}
        username={username}
        showToast={showToast}
      />

      {/* Dynamic Tabs Renderer */}
      {tab === "portfolio" && (
        <div className="flex flex-col gap-8">
          {/* Grid of Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Total Balance from N wallets */}
            <div className="bg-[#0f1115] border border-neutral-900 p-6 rounded relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#e4c126]" />
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-3">
                    Total Wallet Balance
                  </span>
                  <h4 className="text-2xl font-black text-white">
                    ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h4>
                </div>
                <button
                  onClick={() => setShowFundModal(true)}
                  className="bg-[#e4c126] hover:bg-[#c9a61b] text-neutral-950 text-[10px] font-black px-2.5 py-1.5 rounded transition-colors uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Fund Account
                </button>
              </div>
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

          {/* Full-width Stock Chart Widget from TradingView of top commodities */}
          <div className="w-full">
            <TradingViewWidget />
          </div>

          {/* Recent Capital Tranches */}
          <div className="bg-[#0f1115] border border-neutral-900 p-6 rounded flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-4">
              <h4 className="text-base font-extrabold text-white tracking-wide">
                Recent Capital Transactions
              </h4>
              {username && (
                <button
                  onClick={() => fetchTransactions(username)}
                  className="text-[10px] text-neutral-500 hover:text-white font-bold uppercase transition-colors cursor-pointer"
                >
                  Refresh List
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
              {isLoadingTxns ? (
                <span className="text-neutral-500 text-xs py-4 animate-pulse">Syncing tranches...</span>
              ) : storeTransactions.length === 0 ? (
                <span className="text-neutral-500 text-xs py-4 font-medium">No recent transactions found.</span>
              ) : (
                storeTransactions.slice(0, 5).map((txn) => (
                  <div key={txn._id} className="bg-[#0a0b0d] border border-neutral-900 p-4 rounded flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        txn.transactionType === "deposit" ? "bg-[#528574]/15 text-[#528574]" : txn.transactionType === "withdrawal" ? "bg-red-500/15 text-red-500" : txn.transactionType === "capital_access" ? "bg-blue-500/15 text-blue-500" : "bg-[#e4c126]/15 text-[#e4c126]"
                      }`}>
                        {txn.transactionType === "deposit" ? "↓" : txn.transactionType === "withdrawal" ? "↑" : txn.transactionType === "capital_access" ? "⚡" : "⇄"}
                      </span>
                      <div className="flex flex-col gap-0.5 text-left">
                        <h5 className="text-sm font-extrabold text-white capitalize">{txn.transactionType.replace("_", " ")} ({txn.currencySymbol})</h5>
                        <span className="text-[11px] text-neutral-500 font-medium">
                          {txn._id.slice(-8).toUpperCase()} • {new Date(txn.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-black text-white">
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
        </div>
      )}



    </div>
  );
}

export default function DashboardView({ tab }: { tab: string }) {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-500 text-xs">Querying Capricorn Energy secure session...</div>}>
      <DashboardContent tab={tab} />
    </Suspense>
  );
}
