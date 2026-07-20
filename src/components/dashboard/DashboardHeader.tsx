"use client";

import React from "react";

export function DashboardHeader({ tab }: { tab: string }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-black text-white tracking-tight capitalize">
          {tab === "portfolio" ? "Investor Portfolio" : tab === "settings" ? "Security Settings" : `${tab.replace("-", " ")} Workspace`}
        </h3>
        <p className="text-sm text-neutral-400 font-light">
          {tab === "portfolio"
            ? "Track clean energy yields, CCUS dividends, and carbon certificates from registered wallets."
            : tab === "settings"
            ? "Manage your multi-factor security, change password, and configure payout destination addresses."
            : `Manage your ${tab.replace("-", " ")} parameters, history, and Capricorn Energy sustainable tranches.`}
        </p>
      </div>
    </div>
  );
}
