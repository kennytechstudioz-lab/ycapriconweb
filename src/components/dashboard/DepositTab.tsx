"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletStore } from "@/store/walletStore";
import { usePlanStore } from "@/store/planStore";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";

export function DepositTab() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { wallets, fetchWallets } = useWalletStore();
  const { plans, isLoading: loadingPlans, fetchPlans } = usePlanStore();
  const { showToast } = useToastStore();

  const [loadingWallets, setLoadingWallets] = useState(true);

  useEffect(() => {
    if (user?.username) {
      fetchWallets(user.username).finally(() => setLoadingWallets(false));
      fetchPlans();
    }
  }, [user?.username, fetchWallets, fetchPlans]);

  const [selectedWalletSymbol, setSelectedWalletSymbol] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [depositSource, setDepositSource] = useState<"balance" | "direct">("direct");
  const [depositAmount, setDepositAmount] = useState("");

  // Auto-select defaults
  React.useEffect(() => {
    if (wallets.length > 0 && !selectedWalletSymbol) {
      setSelectedWalletSymbol(wallets[0].currencySymbol);
    }
  }, [wallets, selectedWalletSymbol]);

  React.useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id || plans[0]._id || "");
    }
  }, [plans, selectedPlanId]);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(depositAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      showToast("Please enter a valid investment amount.", "warning");
      return;
    }

    const activeW = wallets.find((w: any) => w.currencySymbol === selectedWalletSymbol);
    const activePlan = plans.find((p: any) => (p.id || p._id) === selectedPlanId);

    if (!activePlan) {
      showToast("Please select an investment plan first.", "warning");
      return;
    }

    if (amountVal < activePlan.min) {
      showToast(`The minimum deposit for ${activePlan.name} is $${activePlan.min.toLocaleString()}.`, "warning");
      return;
    }

    if (activePlan.max > 0 && amountVal > activePlan.max) {
      showToast(`The maximum deposit for ${activePlan.name} is $${activePlan.max.toLocaleString()}.`, "warning");
      return;
    }

    if (depositSource === "balance") {
      if (activeW && activeW.balance < amountVal) {
        showToast(`Insufficient balance in your ${selectedWalletSymbol} wallet to deposit from balance.`, "warning");
        return;
      }
    }
    const planId = activePlan.id || activePlan._id || "";
    router.push(
      `/dashboard/deposit/confirm?amount=${amountVal}&planId=${planId}&walletSymbol=${selectedWalletSymbol}&source=${depositSource}`
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in text-left">
      {loadingWallets ? (
        <span className="text-neutral-500 text-[13px] animate-pulse">Syncing energy ledgers...</span>
      ) : wallets.length === 0 ? (
        <div className="py-12 text-center flex flex-col gap-3 items-center justify-center border border-neutral-900/50 bg-[#0a0b0d]/50 rounded-lg">
          <span className="text-neutral-500 text-[13px]">No active wallets or currencies found. Please contact an admin.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-8 w-full">
          
          {/* Top Side: Synchronized Wallets Grid */}
          <div className="flex flex-col gap-3 w-full">
            <span className="text-[13px] font-extrabold uppercase text-neutral-500 tracking-wider">Select wallet to deposit to</span>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
              {wallets.map((w: any, index: number) => {
                const isSelected = w.currencySymbol === selectedWalletSymbol;
                return (
                  <div
                    key={w.id || w.currencySymbol || `wallet-${index}`}
                    onClick={() => setSelectedWalletSymbol(w.currencySymbol)}
                    className={`bg-[#0f1115] border rounded-lg p-5 flex flex-col gap-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#e4c126] shadow-lg shadow-[#e4c126]/5 bg-[#0f1115]/90"
                        : "border-neutral-900 hover:border-neutral-800"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-neutral-900/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        {w.currencyLogo ? (
                          <img
                            src={w.currencyLogo}
                            alt={w.currencyName}
                            className="w-8 h-8 rounded-full object-cover bg-neutral-950"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-black text-white text-sm">
                            {w.currencySymbol.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white">{w.currencyName}</span>
                          <span className="text-[13px] text-neutral-500 uppercase tracking-widest font-bold">{w.currencySymbol}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        isSelected 
                          ? "bg-[#e4c126]/10 border border-[#e4c126]/20 text-[#e4c126]" 
                          : "bg-neutral-800 border border-neutral-900 text-neutral-400"
                      }`}>
                        {isSelected ? "Active" : "Select"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-neutral-400 font-medium">Wallet Balance</span>
                      <span className="text-sm font-black text-white">${w.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between items-center text-[13px] text-neutral-500 border-t border-neutral-900/40 pt-2.5 font-mono">
                      <span>Address</span>
                      <span className="truncate max-w-[120px]" title={w.address}>{w.address || "No address assigned"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Middle Side: Structured Investment Plans Board */}
          <div className="flex flex-col gap-3 w-full border-t border-neutral-900/60 pt-6">
            <span className="text-[13px] font-extrabold uppercase text-neutral-500 tracking-wider">Select an investment plan</span>
            {loadingPlans ? (
              <div className="py-8 flex flex-col gap-3 items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-[#e4c126] border-t-transparent animate-spin" />
                <span className="text-[13px] text-neutral-500 font-extrabold uppercase tracking-wider">Hydrating plans board...</span>
              </div>
            ) : plans.length === 0 ? (
              <div className="py-8 border border-neutral-900/50 bg-[#0a0b0d]/50 rounded-lg text-center flex flex-col items-center justify-center gap-2">
                <span className="text-[13px] text-neutral-500 font-semibold">No active investment plans found. Please contact support.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {plans.map((plan: any, index: number) => {
                  const isPlanSelected = (plan.id || plan._id) === selectedPlanId;
                  return (
                    <div
                      key={plan.id || plan._id || `plan-${index}`}
                      onClick={() => setSelectedPlanId(plan.id || plan._id || "")}
                      className={`bg-[#0f1115] border rounded-lg flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 ${
                        isPlanSelected
                          ? "border-[#e4c126] shadow-lg shadow-[#e4c126]/5 bg-[#0f1115]/90 translate-y-[-2px]"
                          : "border-neutral-900 hover:border-neutral-800"
                      }`}
                    >
                      {plan.picture && (
                        <div className="relative h-32 w-full overflow-hidden bg-neutral-900 border-b border-neutral-900/60">
                          <img
                            src={plan.picture}
                            alt={plan.name}
                            className="w-full h-full object-cover animate-fade-in"
                          />
                        </div>
                      )}
                      <div className="p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-0.5">
                            <h4 className="text-base font-black text-white">{plan.name}</h4>
                            <span className="text-[13px] text-neutral-500 font-extrabold uppercase tracking-wider">
                              Structured Pool
                            </span>
                          </div>
                          <span className="bg-[#528574]/15 border border-[#528574]/30 text-[#528574] text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {plan.percent}% Daily
                          </span>
                        </div>

                        <p className="text-[13px] text-neutral-400 font-light leading-relaxed truncate">
                          {plan.description}
                        </p>

                        <div className="grid grid-cols-2 gap-3 border-t border-neutral-900/60 pt-3 text-[13px]">
                          <div className="flex flex-col">
                            <span className="text-neutral-500 uppercase tracking-widest font-bold">Min Deposit</span>
                            <span className="font-extrabold text-white text-sm">${plan.min.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-neutral-500 uppercase tracking-widest font-bold">Max Deposit</span>
                            <span className="font-extrabold text-white text-sm">
                              {plan.max === 0 ? "Unlimited" : `$${plan.max.toLocaleString()}`}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-neutral-500 uppercase tracking-widest font-bold">Duration</span>
                            <span className="font-extrabold text-[#e4c126] text-sm">{plan.duration} Days</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-neutral-500 uppercase tracking-widest font-bold">Ref Bonus</span>
                            <span className="font-extrabold text-white text-sm">{plan.referralPercent}%</span>
                          </div>
                        </div>
                      </div>

                      <div className={`px-5 py-3 border-t border-neutral-900/40 flex justify-between items-center text-[13px] font-bold uppercase tracking-wider ${
                        isPlanSelected ? "bg-[#e4c126]/5 text-[#e4c126]" : "text-neutral-500"
                      }`}>
                        <span>Status</span>
                        <span>{isPlanSelected ? "Selected" : "Select Plan"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Side: Deposit / Allocation Form (Full Width Split Layout) */}
          <div className="w-full bg-[#0f1115] border border-neutral-900 px-[10px] md:px-8 py-8 rounded-lg flex flex-col gap-6 mt-4">
            <div>
              <h5 className="text-base font-extrabold text-white">Deposit & Capital Allocation</h5>
              <p className="text-[13px] text-neutral-400 mt-1">Specify your capital investment tranche for the selected currency wallet.</p>
            </div>

            {(() => {
              const activeW = wallets.find((w: any) => w.currencySymbol === selectedWalletSymbol) || wallets[0];
              const activePlan = plans.find((p: any) => (p.id || p._id) === selectedPlanId) || plans[0];

              const typedAmount = parseFloat(depositAmount) || 0;
              const dailyEarning = activePlan ? typedAmount * (activePlan.percent / 100) : 0;
              const weeklyEarning = dailyEarning * 7;
              const monthlyEarning = dailyEarning * 30;
              const totalEarning = activePlan ? dailyEarning * activePlan.duration : 0;

              return (
                <form onSubmit={handleDepositSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm w-full">
                  
                  {/* Left Column: Account Selection, Payment Method & Investment Amount */}
                  <div className="flex flex-col gap-5 w-full">
                    {/* Active Selection Display */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-950/60 p-4 rounded border border-neutral-900/60">
                      <div className="flex items-center gap-3">
                        {activeW.currencyLogo ? (
                          <img
                            src={activeW.currencyLogo}
                            alt={activeW.currencyName}
                            className="w-8 h-8 rounded-full object-cover bg-neutral-950"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-black text-white text-sm">
                            {activeW.currencySymbol.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white">{activeW.currencyName}</span>
                          <span className="text-[13px] text-neutral-500 font-bold">Selected Wallet</span>
                        </div>
                      </div>

                      {activePlan && (
                        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-neutral-900/60 pt-3 sm:pt-0 sm:pl-4">
                          {activePlan.picture ? (
                            <img
                              src={activePlan.picture}
                              alt={activePlan.name}
                              className="w-8 h-8 rounded object-cover bg-neutral-950"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-[#528574]/20 border border-[#528574]/30 flex items-center justify-center text-xs font-black text-white">
                              {activePlan.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-white">{activePlan.name}</span>
                            <span className="text-[13px] text-[#e4c126] font-bold">{activePlan.percent}% Daily Yield</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Deposit Payment Method (Balance or Add) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-extrabold uppercase text-neutral-400 tracking-wider">Deposit Payment Method</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          onClick={() => setDepositSource("direct")}
                          className={`p-3.5 rounded border text-left cursor-pointer transition-all flex flex-col gap-1.5 ${
                            depositSource === "direct"
                              ? "bg-neutral-950 border-[#e4c126] text-white"
                              : "bg-neutral-950/40 border-neutral-900 text-neutral-400 hover:border-neutral-800"
                          }`}
                        >
                          <span className="text-sm font-bold">Add to Wallet</span>
                          <span className="text-[13px] text-neutral-500">Transfer directly to company address</span>
                        </div>
                        <div
                          onClick={() => setDepositSource("balance")}
                          className={`p-3.5 rounded border text-left cursor-pointer transition-all flex flex-col gap-1.5 ${
                            depositSource === "balance"
                              ? "bg-neutral-950 border-[#e4c126] text-white"
                              : "bg-neutral-950/40 border-neutral-900 text-neutral-400 hover:border-neutral-800"
                          }`}
                        >
                          <span className="text-sm font-bold">From Wallet Balance</span>
                          <span className="text-[13px] text-neutral-500">Deduct from ${activeW.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} balance</span>
                        </div>
                      </div>
                    </div>


                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-extrabold uppercase text-neutral-400 tracking-wider">Investment Amount ($ USD equivalent)</label>
                      <input
                        type="number"
                        required
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full px-3 py-3.5 bg-[#0a0b0d] border border-neutral-850 rounded focus:outline-none focus:border-[#e4c126] text-sm text-white font-mono"
                        placeholder={activePlan ? `Min: $${activePlan.min.toLocaleString()} | Max: ${activePlan.max === 0 ? "Unlimited" : `$${activePlan.max.toLocaleString()}`}` : "e.g. 5000"}
                      />
                    </div>
                  </div>

                  {/* Right Column: Projections Calculator & Submission Action */}
                  <div className="flex flex-col justify-between bg-neutral-950/30 px-[10px] md:px-6 py-6 rounded-lg border border-neutral-900/60 w-full gap-6">
                    <div className="flex flex-col gap-4">
                      <span className="text-[13px] font-extrabold uppercase text-neutral-500 tracking-wider">Real-Time Yield Projections</span>
                      
                      {activePlan && typedAmount > 0 ? (
                        <div className="flex flex-col gap-4 animate-fade-in">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-[#0f1115] border border-neutral-900 p-2.5 rounded flex flex-col gap-0.5">
                              <span className="text-[13px] font-bold text-neutral-500 uppercase tracking-widest">Daily Yield</span>
                              <span className="text-sm font-black text-green-400 font-mono">${dailyEarning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            
                            <div className="bg-[#0f1115] border border-neutral-900 p-2.5 rounded flex flex-col gap-0.5">
                              <span className="text-[13px] font-bold text-neutral-500 uppercase tracking-widest">Weekly Yield</span>
                              <span className="text-sm font-black text-green-400 font-mono">${weeklyEarning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>

                            <div className="bg-[#0f1115] border border-neutral-900 p-2.5 rounded flex flex-col gap-0.5">
                              <span className="text-[13px] font-bold text-neutral-500 uppercase tracking-widest">Monthly Yield</span>
                              <span className="text-sm font-black text-green-400 font-mono">${monthlyEarning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[13px] text-neutral-400 pt-3 border-t border-neutral-900/60 mt-1">
                            <span className="font-semibold">Total Pool Returns ({activePlan.duration} Days)</span>
                            <span className="font-black text-[#e4c126] font-mono text-sm">${totalEarning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center px-4 border border-dashed border-neutral-900/60 rounded bg-[#0a0b0d]/20 text-neutral-500 gap-2">
                          <svg className="w-8 h-8 text-neutral-600 animate-pulse fill-none stroke-current stroke-[1.5]" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-[13px] font-semibold text-neutral-400">Yield calculator stands ready</span>
                          <p className="text-xs text-neutral-500 max-w-[280px] mt-0.5 leading-relaxed">Enter an investment tranche amount on the left to calculate real-time daily, weekly, and monthly yield returns.</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 mt-auto">
                      <div className="text-[13px] text-neutral-400 leading-relaxed border-t border-neutral-900/40 pt-4 flex flex-col gap-1">
                        <span className="font-extrabold text-white uppercase tracking-wider">💡 Allocation Policy</span>
                        <span>Funds allocated are automatically integrated into active green energy pools. Yield payouts are released every 24 hours.</span>
                      </div>
                      
                      <button type="submit" className="w-full bg-[#e4c126] hover:bg-[#c9a61b] text-neutral-950 font-black text-sm py-4 rounded transition-colors uppercase tracking-wider mt-2 cursor-pointer text-center">
                        Proceed to Confirm Deposit →
                      </button>
                    </div>
                  </div>

                </form>
              );
            })()}
          </div>

        </div>
      )}
    </div>
  );
}
