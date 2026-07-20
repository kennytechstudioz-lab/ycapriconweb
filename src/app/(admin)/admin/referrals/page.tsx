"use client";

import { useEffect, useState } from "react";
import { apiCall } from "@/lib/apiClient";

interface ReferralRecord {
  _id: string;
  username: string;
  referredBy: string;
  commission: number;
  createdAt: string;
}

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    apiCall<{ success: boolean; referrals: ReferralRecord[] }>("/api/users/referrals/all")
      .then((res) => { if (res.success) setReferrals(res.referrals || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const filtered = referrals.filter((r) => {
    const q = searchQuery.toLowerCase();
    return r.username.toLowerCase().includes(q) || r.referredBy.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Group stats: unique referrers and total commissions
  const referrers = Array.from(new Set(referrals.map((r) => r.referredBy)));
  const totalCommission = referrals.reduce((sum, r) => sum + (r.commission || 0), 0);

  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-6 w-full min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-black text-white tracking-tight">Referral Network</h1>
          <p className="text-xs text-neutral-400 font-medium">
            System-wide view of all user referrals and commissions.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Referrals", value: referrals.length.toString(), color: "text-white" },
          { label: "Active Referrers", value: referrers.length.toString(), color: "text-[#e4c126]" },
          { label: "Total Commission", value: `$${totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "text-[#528574]" },
          { label: "Avg Commission", value: referrals.length ? `$${(totalCommission / referrals.length).toFixed(2)}` : "$0.00", color: "text-white" },
        ].map((card) => (
          <div key={card.label} className="bg-[#0f1115] border border-neutral-900 rounded-lg p-5 flex flex-col gap-1">
            <span className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">{card.label}</span>
            <span className={`text-2xl font-black font-mono ${card.color}`}>{card.value}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="flex flex-col gap-0">
        {/* Search */}
        <div className="flex items-center justify-between bg-[#13151a]/60 border border-neutral-800/40 p-4 rounded-t-lg">
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
              <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800/80 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#e4c126] transition-colors"
              placeholder="Search by username or referrer..."
            />
          </div>
          <span className="text-[11px] text-neutral-500 font-bold ml-4 whitespace-nowrap">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="bg-[#13151a]/30 border border-t-0 border-neutral-800/40 rounded-b-lg overflow-x-auto w-full">
          {loading ? (
            <div className="py-20 flex flex-col gap-3 items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#e4c126] border-t-transparent animate-spin" />
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Loading referrals...</span>
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-500 gap-2">
              <svg className="w-8 h-8 opacity-40 stroke-current stroke-[1.5]" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235A8.91 8.91 0 019 18a8.91 8.91 0 015 1.235m-10.236 0A9.015 9.015 0 013 18c0-1.29.271-2.518.759-3.633m10.478 4.868A9.045 9.045 0 0019 18c0-1.29-.271-2.518-.759-3.633m-10.48 0a8.966 8.966 0 0110.48 0" />
              </svg>
              <span className="text-xs font-bold">No referrals found.</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800/80 text-sm text-neutral-400 font-semibold">
                  <th className="px-6 py-4">S/N</th>
                  <th className="px-6 py-4">Referred User</th>
                  <th className="px-6 py-4">Referred By</th>
                  <th className="px-6 py-4">Commission Earned</th>
                  <th className="px-6 py-4 text-right">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40 text-[14px]">
                {paginated.map((r, index) => (
                  <tr key={r._id} className="hover:bg-neutral-800/10 transition-colors">
                    <td className="px-6 py-4 text-neutral-500 font-semibold text-sm">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#528574]/20 border border-[#528574]/30 flex items-center justify-center text-[#528574] font-black text-xs flex-shrink-0">
                          {r.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-extrabold text-white text-sm">@{r.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#e4c126]/10 border border-[#e4c126]/20 flex items-center justify-center text-[#e4c126] font-black text-xs flex-shrink-0">
                          {r.referredBy.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-neutral-300 text-sm">@{r.referredBy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-black font-mono text-sm ${r.commission > 0 ? "text-[#528574]" : "text-neutral-600"}`}>
                        ${r.commission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[11px] text-neutral-500 font-semibold">
                          {new Date(r.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true })}
                        </span>
                        <span className="text-xs text-white font-extrabold">
                          {new Date(r.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {filtered.length > itemsPerPage && (
        <div className="flex justify-between items-center bg-[#13151a]/40 border border-neutral-800/40 p-4 rounded-lg">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 border rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              currentPage === 1 ? "border-neutral-850 text-neutral-600 bg-neutral-900/30 cursor-not-allowed" : "border-neutral-800 text-neutral-300 hover:text-white bg-[#0f1115] hover:bg-neutral-800"
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Previous
          </button>
          <span className="text-xs text-neutral-400 font-extrabold tracking-wider">
            Page <span className="text-[#e4c126]">{currentPage}</span> of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 border rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              currentPage === totalPages ? "border-neutral-850 text-neutral-600 bg-neutral-900/30 cursor-not-allowed" : "border-neutral-800 text-neutral-300 hover:text-white bg-[#0f1115] hover:bg-neutral-800"
            }`}
          >
            Next
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
