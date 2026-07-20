"use client";

import React, { useEffect, Suspense } from "react";
import { useAuthStore } from "@/store/authStore";
import { useTransactionStore } from "@/store/transactionStore";

interface TransactionItem {
  _id: string;
  currencyId: string;
  currencyLogo: string;
  currencyName: string;
  currencySymbol: string;
  walletId: string;
  username: string;
  planDuration: number;
  planPercentage: number;
  planReferralPercent: number;
  amount: number;
  transactionType: "deposit" | "withdrawal" | "referral" | "bonus" | "capital_access";
  method: "direct" | "balance";
  status: "pending" | "completed" | "rejected";
  createdAt: string;
  updatedAt: string;
}

function TransactionsContent() {
  const { user } = useAuthStore();
  const username = user?.username;

  const { transactions, totalPages, isLoading: loading, fetchTransactions, deleteTransaction } = useTransactionStore();

  const [currentPage, setCurrentPage] = React.useState(1);

  useEffect(() => {
    if (username) {
      fetchTransactions(username, currentPage);
    }
  }, [username, currentPage, fetchTransactions]);

  // Custom toast/modal warning confirm state
  const [toastConfirm, setToastConfirm] = React.useState<{
    show: boolean;
    message: string;
    id: string;
  } | null>(null);

  const [toastMsg, setToastMsg] = React.useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const requestDeleteTransaction = (id: string) => {
    setToastConfirm({
      show: true,
      message: "Are you sure you want to delete this transaction from your ledger permanently? This action cannot be undone.",
      id,
    });
  };

  const proceedDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
    } catch (err: any) {
      showToast(err.message || "Failed to delete transaction.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="px-2.5 py-1 bg-[#122319] text-[#4ade80] border border-[#1e3a29] text-[10px] font-black uppercase tracking-widest rounded">Completed</span>;
      case "pending":
        return <span className="px-2.5 py-1 bg-[#262112] text-[#e4c126] border border-[#3e361c] text-[10px] font-black uppercase tracking-widest rounded animate-pulse">Pending</span>;
      case "rejected":
        return <span className="px-2.5 py-1 bg-[#241315] text-[#f87171] border border-[#3d1e22] text-[10px] font-black uppercase tracking-widest rounded">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 bg-neutral-900 text-neutral-400 border border-neutral-800 text-[10px] font-black uppercase tracking-widest rounded">{status}</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return (
          <div className="w-8 h-8 rounded-full bg-[#122319] border border-[#1e3a29] flex items-center justify-center text-[#4ade80]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </div>
        );
      case "withdrawal":
        return (
          <div className="w-8 h-8 rounded-full bg-[#241315] border border-[#3d1e22] flex items-center justify-center text-[#f87171]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
          </div>
        );
      case "referral":
        return (
          <div className="w-8 h-8 rounded-full bg-[#1e1c2e] border border-[#2d2a45] flex items-center justify-center text-[#a78bfa]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
        );
      case "bonus":
        return (
          <div className="w-8 h-8 rounded-full bg-[#262112] border border-[#3e361c] flex items-center justify-center text-[#e4c126]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
        );
      case "capital_access":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getPlanName = (tx: any) => {
    if (tx.transactionType === "withdrawal") {
      return "Withdrawal";
    }
    if (tx.transactionType === "referral") {
      return "Referral Commission";
    }
    if (tx.transactionType === "bonus") {
      return "Affiliate Bonus";
    }
    if (tx.transactionType === "capital_access") {
      return "Capital Access Request";
    }
    if (tx.planDuration === 15) return "CCUS Technology Fund";
    if (tx.planDuration === 30) return "Sovereign Carbon Fund";
    if (tx.planDuration === 60) return "Sustainable Forestry Fund";
    return `Clean Energy Plan (${tx.planDuration || 0} Days)`;
  };

  const paginatedTransactions = transactions;

  return (
    <div className="px-[10px] md:px-8 py-8 flex flex-col gap-6 w-full text-left">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl border text-xs font-bold flex items-center gap-2 bg-[#10141a]/95 border-red-500/50 text-red-500">
          ✗ {toastMsg}
        </div>
      )}
      {/* Header */}
      <div>
        <h3 className="text-xl font-black text-white tracking-tight uppercase">Transaction History</h3>
        <p className="text-[13px] text-neutral-400 mt-1">
          Monitor your asset allocation and capital ledger activities.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#0f1115] border border-neutral-900 rounded-lg w-full overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-[#e4c126] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-neutral-400 mt-4 font-semibold uppercase tracking-wider animate-pulse">
              Retrieving ledger records...
            </span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
            <div className="w-16 h-16 bg-neutral-900/50 rounded-full flex items-center justify-center mb-4 border border-neutral-800">
              <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-white font-black uppercase tracking-wider">No Transactions Found</span>
            <span className="text-xs text-neutral-500 mt-2 max-w-sm">
              Your transaction ledger is currently empty. Any deposits, withdrawals, or bonuses will appear here.
            </span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#050608]/80 border-b border-neutral-900 text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Currency</th>
                    <th className="py-4 px-6">Plan Name</th>
                    <th className="py-4 px-6 text-right">Amount</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900/50">
                  {paginatedTransactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-neutral-900/20 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(tx.transactionType)}
                          <span className="text-sm font-extrabold text-white capitalize">{tx.transactionType}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {tx.currencyLogo ? (
                            <img src={tx.currencyLogo} alt={tx.currencySymbol} className="w-7 h-7 rounded-full bg-neutral-900 object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center font-black text-white text-[10px]">
                              {tx.currencySymbol?.substring(0, 2).toUpperCase() || "??"}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-neutral-200">{tx.currencyName}</span>
                            <span className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">{tx.currencySymbol}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-bold text-neutral-300">{getPlanName(tx)}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`text-sm font-black font-mono ${tx.transactionType === "withdrawal" ? "text-white" : "text-[#4ade80]"}`}>
                          {tx.transactionType === "withdrawal" ? "-" : "+"}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-3.5">
                          {getStatusBadge(tx.status)}
                          <button
                            onClick={() => requestDeleteTransaction(tx._id)}
                            className="text-neutral-500 hover:text-red-500 transition-colors cursor-pointer p-1 rounded hover:bg-neutral-800/60"
                            title="Delete Transaction Permanently"
                          >
                            <svg className="w-4 h-4 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[13px] font-bold text-neutral-300">
                            {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                          </span>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            {new Date(tx.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Premium Pagination Control Footer */}
            <div className="flex justify-between items-center bg-[#0a0b0d]/40 border-t border-neutral-900/60 p-4 rounded-b-lg w-full mt-auto">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  currentPage === 1
                    ? "border-neutral-950 text-neutral-600 bg-neutral-900/30 cursor-not-allowed"
                    : "border-neutral-800 text-neutral-300 hover:text-white bg-[#0f1115] hover:bg-neutral-800"
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
                  currentPage === totalPages
                    ? "border-neutral-950 text-neutral-600 bg-neutral-900/30 cursor-not-allowed"
                    : "border-neutral-800 text-neutral-300 hover:text-white bg-[#0f1115] hover:bg-neutral-800"
                }`}
              >
                Next
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Premium warning dialog toast overlay */}
      {toastConfirm && toastConfirm.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-[#0f1115] border-2 border-[#e4c126]/60 rounded-xl max-w-md w-full p-6 md:p-8 flex flex-col gap-6 shadow-[0_0_50px_rgba(228,193,38,0.15)] transform scale-100 transition-transform">
            <div className="flex items-center gap-3 border-b border-neutral-900 pb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#241315] text-[#f87171] border border-[#3d1e22]">
                <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">Delete Ledger Record</h4>
            </div>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">{toastConfirm.message}</p>
            <div className="flex items-center justify-end gap-3.5 mt-2">
              <button
                onClick={() => setToastConfirm(null)}
                className="px-4 py-2 rounded border border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/30 hover:bg-neutral-800/60 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const { id } = toastConfirm;
                  setToastConfirm(null);
                  await proceedDeleteTransaction(id);
                }}
                className="px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer bg-red-600 hover:bg-red-500 text-white"
              >
                Confirm and Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-[#e4c126] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-neutral-400 mt-4 font-semibold uppercase tracking-wider animate-pulse">
            Loading...
          </span>
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
}
