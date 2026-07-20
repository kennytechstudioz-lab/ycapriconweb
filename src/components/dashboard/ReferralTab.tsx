"use client";
import React, { useState, useEffect } from "react";
import { apiCall } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { useSettingStore } from "@/store/settingStore";
import { useToastStore } from "@/store/toastStore";

export function ReferralTab() {
  const { user } = useAuthStore();
  const username = user?.username || "";
  const { setting, fetchSettings } = useSettingStore();
  const { showToast } = useToastStore();

  const [referrals, setReferrals] = useState<any[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (username) {
      const fetchReferrals = async () => {
        try {
          setLoadingReferrals(true);
          const response = await apiCall<{ success: boolean; referrals: any[] }>(
            `/api/users/referrals?username=${username}`
          );
          if (response.success) {
            setReferrals(response.referrals || []);
          }
        } catch (error) {
          console.error("Failed to load referrals:", error);
        } finally {
          setLoadingReferrals(false);
        }
      };
      fetchReferrals();
    }
  }, [username]);

  const rawDomain = setting?.domainName || "oeelco.com";
  const domainUrl = rawDomain.startsWith("http://") || rawDomain.startsWith("https://")
    ? rawDomain
    : `https://${rawDomain}`;
  const inviteLink = `${domainUrl}?ref=${username}`;
  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in text-left overflow-x-hidden">
      {/* Centered Referral Code Scanner & Link Card */}
      <div className="bg-[#0f1115] border border-neutral-900 px-[10px] md:px-8 py-8 rounded-lg flex flex-col items-center justify-center text-center gap-6 w-full relative overflow-hidden">
        {/* Custom Scanline CSS */}
        <style>{`
          @keyframes scanline {
            0% { top: 0%; opacity: 0; }
            5% { opacity: 1; }
            95% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          .animate-scan-line {
            animation: scanline 2.5s linear infinite;
          }
        `}</style>

        <div className="max-w-md flex flex-col items-center">
          <h4 className="text-xl font-black text-white tracking-tight uppercase">Investor Referral Network</h4>
          <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
            Invite fellow clean tech investors to Capricorn Energy. Share your dynamic QR code or invite link below to secure premium percentage compounding rewards on their initial active deposits.
          </p>
        </div>

        {/* Premium QR Code Scan Box */}
        <div className="relative p-4 bg-[#0a0b0d] border border-neutral-850 rounded-xl shadow-[0_0_40px_rgba(82,133,116,0.06)] group hover:border-[#528574]/40 transition-all duration-300">
          {/* Glowing Corner Accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#528574] rounded-tl"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#528574] rounded-tr"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#528574] rounded-bl"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#528574] rounded-br"></div>
          
          {/* Scan Beam animation */}
          <div className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-transparent via-[#528574] to-transparent animate-scan-line z-10 pointer-events-none"></div>

          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(inviteLink)}&color=ffffff&bgcolor=0a0b0d`}
            alt="Referral QR Code"
            className="w-36 h-36 object-contain rounded"
          />
        </div>

        {/* Centered Copyable Referral Invite Link */}
        <div className="flex flex-col gap-2 w-full items-center">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-black">My Personal Invite Link</span>
          <div className="flex items-center gap-2 bg-[#050608] border border-neutral-900 rounded pl-4 pr-1.5 py-1.5 w-full max-w-md justify-between group hover:border-neutral-850 transition-all">
            <span className="text-xs font-mono font-bold text-[#e4c126] select-all break-all text-left truncate mr-2">
              {inviteLink}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                showToast("Referral link copied to clipboard!");
              }}
              className="text-[10px] bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900 transition-all font-black px-4 py-2.5 rounded cursor-pointer shrink-0 uppercase tracking-wider"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Referral Registry Table */}
      <div className="bg-[#0f1115] border border-neutral-900 rounded-lg overflow-hidden flex flex-col w-full">
        <div className="p-6 flex flex-col gap-1 border-b border-neutral-900">
          <h4 className="text-lg font-black text-white tracking-tight">Referrals Registry</h4>
          <p className="text-xs text-neutral-400 font-light">Comprehensive tree listing all clean tech investors registered through your invite network.</p>
        </div>

        {loadingReferrals ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[300px]">
            <div className="w-8 h-8 border-3 border-[#528574] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-neutral-500 text-xs mt-3 animate-pulse">Syncing your network tree...</span>
          </div>
        ) : referrals.length === 0 ? (
          <div className="py-20 text-center flex flex-col gap-3 items-center justify-center min-h-[300px] p-6">
            <div className="w-12 h-12 bg-neutral-900/60 rounded-full flex items-center justify-center mb-1 border border-neutral-800">
              <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-white font-extrabold text-sm uppercase tracking-wider">Your Referral Network is Empty</span>
            <span className="text-neutral-500 text-xs">Share your personal invite link or QR code above to start expanding your tree.</span>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#050608]/80 border-b border-neutral-900 text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                  <th className="py-4 px-6">Referred Username</th>
                  <th className="py-4 px-6 text-center">Reward Commission</th>
                  <th className="py-4 px-6 text-right">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/50">
                {referrals.map((ref: any, idx: number) => (
                  <tr key={ref._id || idx} className="hover:bg-neutral-900/20 transition-colors group">
                    <td className="py-4 px-6">
                      <span className="text-sm font-extrabold text-white">{ref.username}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-xs font-black font-mono text-[#4ade80] bg-[#162a1f] border border-[#224832] px-2.5 py-1 rounded">
                        +${(ref.commission || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[13px] font-bold text-neutral-300">
                          {new Date(ref.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                        </span>
                        <span className="text-[11px] text-neutral-500 font-medium">
                          {new Date(ref.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
