"use client";
import React, { useState, useEffect } from "react";
import { apiCall } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { useWalletStore } from "@/store/walletStore";
import { useToastStore } from "@/store/toastStore";

export function SettingsTab() {
  const { user } = useAuthStore();
  const username = user?.username || "";
  const { profile, fetchProfile } = useUserStore();
  const { wallets, isLoading: loadingWallets, fetchWallets } = useWalletStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    if (username) {
      fetchWallets(username);
      fetchProfile(username);
    }
  }, [username, fetchWallets, fetchProfile]);
  const [walletAddresses, setWalletAddresses] = useState<Record<string, string>>({});
  const [isUpdatingWallet, setIsUpdatingWallet] = useState<Record<string, boolean>>({});
  
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isUpdating2FA, setIsUpdating2FA] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  useEffect(() => {
    if (wallets.length > 0) {
      setWalletAddresses((prev) => {
        const updated = { ...prev };
        wallets.forEach((w) => {
          if (updated[w.currencySymbol] === undefined) {
            updated[w.currencySymbol] = w.address || "";
          }
        });
        return updated;
      });
    }
  }, [wallets]);

  useEffect(() => {
    if (profile) {
      setIsTwoFactorEnabled(!!(profile as any).twoFactorEnabled);
    }
  }, [profile]);

  const handleAddressChange = (symbol: string, val: string) => {
    setWalletAddresses((prev) => ({
      ...prev,
      [symbol]: val,
    }));
  };

  const handleUpdateWalletAddress = async (walletId: string, symbol: string) => {
    const address = walletAddresses[symbol] || "";
    setIsUpdatingWallet((prev) => ({ ...prev, [symbol]: true }));
    try {
      const response = await apiCall<{ success: boolean; message: string }>("/api/users/wallets/address", {
        method: "PUT",
        body: {
          username,
          walletId,
          address,
        },
      });
      if (response.success) {
        showToast(response.message || `${symbol} payout address saved!`);
        fetchWallets(username);
      } else {
        showToast(response.message || "Failed to update address.", "warning");
      }
    } catch (error: any) {
      showToast(error.message || "Failed to update address.", "warning");
    } finally {
      setIsUpdatingWallet((prev) => ({ ...prev, [symbol]: false }));
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    setIsUpdating2FA(true);
    try {
      const response = await apiCall<{ success: boolean; message: string; twoFactorEnabled: boolean }>("/api/users/2fa", {
        method: "PUT",
        body: {
          username,
          enabled,
        },
      });
      if (response.success) {
        setIsTwoFactorEnabled(response.twoFactorEnabled);
        showToast(response.message || `2FA status updated!`);
        fetchProfile(username || "");
      } else {
        showToast(response.message || "Failed to update 2FA status.", "warning");
      }
    } catch (error: any) {
      showToast(error.message || "Failed to update 2FA status.", "warning");
    } finally {
      setIsUpdating2FA(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all password fields.", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "warning");
      return;
    }
    if (newPassword.length < 4) {
      showToast("New password must be at least 4 characters long.", "warning");
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const response = await apiCall<{ success: boolean; message: string }>("/api/users/password", {
        method: "PUT",
        body: {
          username,
          currentPassword,
          newPassword,
        },
      });
      if (response.success) {
        showToast(response.message || "Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast(response.message || "Failed to change password.", "warning");
      }
    } catch (error: any) {
      showToast(error.message || "Failed to change password.", "warning");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0f1115] border border-neutral-900 px-[10px] md:px-6 py-6 rounded flex flex-col gap-6">
          <div className="flex flex-col gap-1 border-b border-neutral-900 pb-4 text-left">
            <h4 className="text-base font-extrabold text-white tracking-wide">Payout Wallet Settings</h4>
            <p className="text-sm text-neutral-400 font-light">Set your personal destination addresses to receive yields and principal payouts.</p>
          </div>

          {loadingWallets ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-[#e4c126] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : wallets.length === 0 ? (
            <p className="text-sm text-neutral-500 italic">No wallets available.</p>
          ) : (
            <div className="flex flex-col gap-5 text-sm text-left">
              {wallets.map((w) => (
                <div key={(w as any)._id || w.id} className="flex flex-col gap-2 p-4 bg-neutral-950 border border-neutral-900/60 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {w.currencyLogo ? (
                        <img src={w.currencyLogo} alt={w.currencySymbol} className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center font-black text-white text-[9px]">
                          {w.currencySymbol?.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-extrabold text-white uppercase">{w.currencySymbol} Wallet</span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium">Balance: ${w.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Enter your personal ${w.currencyName} receive address`}
                      value={walletAddresses[w.currencySymbol] ?? ""}
                      onChange={(e) => handleAddressChange(w.currencySymbol, e.target.value)}
                      className="flex-1 bg-neutral-900 border border-neutral-800 p-2 rounded text-white text-xs focus:outline-none focus:border-[#e4c126] font-medium"
                    />
                    <button
                      type="button"
                      disabled={isUpdatingWallet[w.currencySymbol]}
                      onClick={() => handleUpdateWalletAddress((w as any)._id || w.id, w.currencySymbol)}
                      className="bg-[#528574] hover:bg-[#436e5f] text-white text-xs font-bold uppercase px-3 py-2 rounded transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center"
                    >
                      {isUpdatingWallet[w.currencySymbol] ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#0f1115] border border-neutral-900 p-6 rounded flex flex-col gap-6 text-left">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 border-b border-neutral-900 pb-4">
              <h4 className="text-base font-extrabold text-white tracking-wide">Multi-Factor Security (2FA)</h4>
              <p className="text-sm text-neutral-400 font-light">Secure your capital allocation with Two-Factor Authentication credentials.</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-900 rounded">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-white">Google Authenticator / 2FA</span>
                <span className="text-xs text-neutral-500 font-light">Enforce passcode challenges during withdrawals & transactions.</span>
              </div>
              <button
                type="button"
                disabled={isUpdating2FA}
                onClick={() => handleToggle2FA(!isTwoFactorEnabled)}
                className={`text-xs font-black uppercase px-4 py-2 rounded transition-colors cursor-pointer border ${
                  isTwoFactorEnabled
                    ? "bg-red-950/20 text-red-400 border-red-500/20 hover:bg-red-950/40"
                    : "bg-[#e4c126]/10 text-[#e4c126] border-[#e4c126]/20 hover:bg-[#e4c126]/20"
                }`}
              >
                {isUpdating2FA ? "Updating..." : isTwoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
              </button>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 border-b border-neutral-900 pb-4">
              <h4 className="text-base font-extrabold text-white tracking-wide">Change Password</h4>
              <p className="text-sm text-neutral-400 font-light">Update your login security credentials periodically to enforce protection.</p>
            </div>

            <div className="flex flex-col gap-1.5 text-sm">
              <label className="text-sm uppercase text-neutral-400 font-extrabold tracking-wider">Current Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-white focus:outline-none focus:border-[#e4c126] font-medium text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm uppercase text-neutral-400 font-extrabold tracking-wider">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-white focus:outline-none focus:border-[#e4c126] font-medium text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm uppercase text-neutral-400 font-extrabold tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-white focus:outline-none focus:border-[#e4c126] font-medium text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingPassword}
              className="bg-[#528574] hover:bg-[#436e5f] text-white font-extrabold uppercase py-3 rounded tracking-wider transition-colors disabled:opacity-50 cursor-pointer text-center text-sm"
            >
              {isSubmittingPassword ? "Changing Password..." : "Update Security Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
