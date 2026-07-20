"use client";

import React, { useEffect, useState } from "react";
import { apiCall } from "@/lib/apiClient";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: "user" | "staff";
  status: "Active" | "Suspended";
  balance: number;
  passKey: string;
  createdAt: string;
  isVerifying: boolean;
  isVerified: boolean;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  phoneNumber: string;
  country: string;
  occupation: string;
  idType: string;
  idImage: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; label: string } | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("error");
  const showToast = (msg: string, type: "success" | "error" = "error") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Modal States
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserProfile | null>(null);
  const [selectedUserForTransactions, setSelectedUserForTransactions] = useState<UserProfile | null>(null);

  // Verification modal states
  const [verifUser, setVerifUser] = useState<UserProfile | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [verifActionLoading, setVerifActionLoading] = useState(false);
  const [verifImageZoom, setVerifImageZoom] = useState<string | null>(null);
  
  // Single and bulk action loading state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Selected user IDs for bulk activities
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Create Transaction modal
  const [createTxnUser, setCreateTxnUser] = useState<UserProfile | null>(null);
  const [txnForm, setTxnForm] = useState({ transactionType: "deposit", amount: "", currencySymbol: "", method: "direct", planId: "" });
  const [userWallets, setUserWallets] = useState<Array<{ currencySymbol: string; currencyName: string; balance: number }>>([]);
  const [loadingUserWallets, setLoadingUserWallets] = useState(false);
  const [txnSubmitting, setTxnSubmitting] = useState(false);
  const [plans, setPlans] = useState<Array<{ _id: string; name: string; duration: number; percent: number; min: number; max: number; referralPercent: number }>>([]);

  // Bulk notification template picker
  const [bulkNotifModal, setBulkNotifModal] = useState(false);
  const [notifTemplates, setNotifTemplates] = useState<Array<{ _id: string; name: string; title: string; content: string }>>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [bulkComposing, setBulkComposing] = useState(false);
  const [notifSearch, setNotifSearch] = useState("");

  // Bulk email template picker
  const [bulkEmailModal, setBulkEmailModal] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState<Array<{ _id: string; name: string; title: string; greeting: string; content: string }>>([]);
  const [loadingEmailTemplates, setLoadingEmailTemplates] = useState(false);
  const [selectedEmailTemplateId, setSelectedEmailTemplateId] = useState<string | null>(null);
  const [bulkEmailing, setBulkEmailing] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");

  // Pagination parameters
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset page focus back to 1 whenever search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    setSelectedUserIds([]);
    try {
      const response = await apiCall<{ success: boolean; users: UserProfile[] }>("/api/users");
      setUsers(response.users || []);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve user accounts database.");
    } finally {
      setIsLoading(false);
    }
  };

  // Modify a single user's account attributes
  const handleUpdateUser = async (userId: string, updates: { status?: string; role?: string }) => {
    setActionLoadingId(userId);
    try {
      const response = await apiCall<{ success: boolean; user: UserProfile }>(`/api/users/${userId}`, {
        method: "PATCH",
        body: updates,
      });

      // Update local state smoothly
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userId ? { ...u, ...response.user } : u))
      );
    } catch (err: any) {
      showToast(err.message || "Failed to update user account.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete a single user account
  const handleDeleteUser = (userId: string, username: string) => {
    setDeleteConfirm({ id: userId, label: username });
  };

  const proceedDeleteUser = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setDeleteConfirm(null);
    setActionLoadingId(id);
    try {
      await apiCall(`/api/users/${id}`, { method: "DELETE" });
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== id));
      setSelectedUserIds((prevSelected) => prevSelected.filter((uid) => uid !== id));
    } catch (err: any) {
      showToast(err.message || "Failed to delete user account.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Bulk Operations (Batch suspends, activations, role toggles, deletions)
  const handleBulkAction = async (actionType: "status-active" | "status-suspended" | "role-user" | "role-staff" | "delete") => {
    if (selectedUserIds.length === 0) return;

    if (actionType === "delete") {
      setBulkDeleteConfirm(true);
      return;
    }

    setBulkActionLoading(true);
    try {
      let bodyPayload: any = { ids: selectedUserIds };

      if (actionType === "status-active") {
        bodyPayload.status = "Active";
      } else if (actionType === "status-suspended") {
        bodyPayload.status = "Suspended";
      } else if (actionType === "role-user") {
        bodyPayload.role = "user";
      } else if (actionType === "role-staff") {
        bodyPayload.role = "staff";
      }

      await apiCall("/api/users/bulk", {
        method: "PATCH",
        body: bodyPayload,
      });

      // Hydrate directory lists or map updates locally
      setUsers((prev) =>
        prev.map((u) => {
          if (selectedUserIds.includes(u.id)) {
            const updatedFields: any = {};
            if (bodyPayload.status) updatedFields.status = bodyPayload.status;
            if (bodyPayload.role) updatedFields.role = bodyPayload.role;
            return { ...u, ...updatedFields };
          }
          return u;
        })
      );
      setSelectedUserIds([]);
    } catch (err: any) {
      showToast(err.message || "Failed to perform bulk operations.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const proceedBulkDelete = async () => {
    setBulkDeleteConfirm(false);
    setBulkActionLoading(true);
    try {
      await apiCall("/api/users/bulk", { method: "PATCH", body: { ids: selectedUserIds, action: "delete" } });
      setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
      setSelectedUserIds([]);
    } catch (err: any) {
      showToast(err.message || "Failed to delete selected accounts.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Selection check modifiers
  const handleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleAll = () => {
    const visibleIds = paginatedUsers.map((u) => u.id);
    const allSelectedOnPage = visibleIds.every((id) => selectedUserIds.includes(id));

    if (allSelectedOnPage) {
      // Unselect all items on the current page
      setSelectedUserIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Select all items on the current page (avoiding duplicate checks)
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Open create transaction modal and fetch user wallets + plans
  const openCreateTxn = async (user: UserProfile) => {
    setCreateTxnUser(user);
    setTxnForm({ transactionType: "deposit", amount: "", currencySymbol: "", method: "direct", planId: "" });
    setLoadingUserWallets(true);
    try {
      const [walletsRes, plansRes] = await Promise.all([
        apiCall<{ success: boolean; wallets: any[] }>(`/api/users/wallets?username=${user.username}`),
        apiCall<{ success: boolean; plans: any[] }>("/api/plans"),
      ]);
      const wallets = walletsRes.wallets || [];
      const fetchedPlans = plansRes.plans || [];
      setUserWallets(wallets);
      setPlans(fetchedPlans);
      setTxnForm((f) => ({
        ...f,
        currencySymbol: wallets.length ? wallets[0].currencySymbol : "",
        planId: fetchedPlans.length ? fetchedPlans[0]._id : "",
      }));
    } catch { setUserWallets([]); setPlans([]); }
    finally { setLoadingUserWallets(false); }
  };

  const handleCreateTxnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTxnUser) return;
    const amountVal = parseFloat(txnForm.amount);
    if (isNaN(amountVal) || amountVal <= 0) return showToast("Enter a valid amount.", "error");
    setTxnSubmitting(true);
    try {
      await apiCall("/api/users/transactions/admin", {
        method: "POST",
        body: { username: createTxnUser.username, ...txnForm, amount: amountVal },
      });
      showToast("Transaction created successfully.", "success");
      const isDeposit = txnForm.transactionType === "deposit";
      const isFromBalance = txnForm.method === "balance";
      const isCredit = ["bonus", "referral"].includes(txnForm.transactionType) || (isDeposit && !isFromBalance);
      const isDebit = ["withdrawal", "reduction"].includes(txnForm.transactionType) || (isDeposit && isFromBalance);
      setUsers((prev) =>
        prev.map((u) =>
          u.username === createTxnUser.username
            ? { ...u, balance: isCredit ? u.balance + amountVal : isDebit ? u.balance - amountVal : u.balance }
            : u
        )
      );
      setCreateTxnUser(null);
    } catch (err: any) {
      showToast(err.message || "Failed to create transaction.", "error");
    } finally { setTxnSubmitting(false); }
  };

  const openBulkNotifModal = async () => {
    setBulkNotifModal(true);
    setSelectedTemplateId(null);
    setNotifSearch("");
    setLoadingTemplates(true);
    try {
      const res = await apiCall<{ success: boolean; templates: any[] }>("/api/admin/notification-templates");
      setNotifTemplates(res.templates || []);
    } catch { setNotifTemplates([]); }
    finally { setLoadingTemplates(false); }
  };

  const handleBulkNotify = async () => {
    const tpl = notifTemplates.find((t) => t._id === selectedTemplateId);
    if (!tpl) return showToast("Please select a notification template.", "error");
    setBulkComposing(true);
    try {
      const usernames = users.map((u) => u.username);
      await apiCall("/api/users/bulk-notify", { method: "POST", body: { usernames, title: tpl.title, message: tpl.content } });
      showToast(`Notification sent to all ${usernames.length} users.`, "success");
      setBulkNotifModal(false);
      setSelectedTemplateId(null);
    } catch (err: any) {
      showToast(err.message || "Failed to send notifications.", "error");
    } finally { setBulkComposing(false); }
  };

  const openBulkEmailModal = async () => {
    setBulkEmailModal(true);
    setSelectedEmailTemplateId(null);
    setEmailSearch("");
    setLoadingEmailTemplates(true);
    try {
      const res = await apiCall<{ success: boolean; templates: any[] }>("/api/admin/email-templates");
      setEmailTemplates(res.templates || []);
    } catch { setEmailTemplates([]); }
    finally { setLoadingEmailTemplates(false); }
  };

  const handleBulkEmail = async () => {
    const tpl = emailTemplates.find((t) => t._id === selectedEmailTemplateId);
    if (!tpl) return showToast("Please select an email template.", "error");
    setBulkEmailing(true);
    try {
      const usernames = users.filter((u) => selectedUserIds.includes(u.id)).map((u) => u.username);
      await apiCall("/api/users/bulk-email", { method: "POST", body: { usernames, templateName: tpl.name } });
      showToast(`Email sent to ${usernames.length} selected user${usernames.length > 1 ? "s" : ""}.`, "success");
      setBulkEmailModal(false);
      setSelectedEmailTemplateId(null);
    } catch (err: any) {
      showToast(err.message || "Failed to send emails.", "error");
    } finally { setBulkEmailing(false); }
  };

  // Filter users by search input query
  const handleApproveVerification = async () => {
    if (!verifUser) return;
    setVerifActionLoading(true);
    try {
      await apiCall("/api/users/verification/approve", { method: "POST", body: { username: verifUser.username } });
      setUsers((prev) => prev.map((u) => u.id === verifUser.id ? { ...u, isVerifying: false, isVerified: true } : u));
      setVerifUser(null);
      showToast("Verification approved successfully.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to approve verification.", "error");
    } finally {
      setVerifActionLoading(false);
    }
  };

  const handleRejectVerification = async () => {
    if (!verifUser || !rejectReason.trim()) return;
    setVerifActionLoading(true);
    try {
      await apiCall("/api/users/verification/reject", { method: "POST", body: { username: verifUser.username, reason: rejectReason.trim() } });
      setUsers((prev) => prev.map((u) => u.id === verifUser.id ? { ...u, isVerifying: false, isVerified: false } : u));
      setVerifUser(null);
      setRejectReason("");
      setShowRejectInput(false);
      showToast("Verification rejected and user notified.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to reject verification.", "error");
    } finally {
      setVerifActionLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute Paginated Slicing
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Handle page transitions safely
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-8 w-full relative min-h-screen pb-32">

      {toastMsg && (
        <div className={`fixed top-6 right-6 z-[9999] px-4 py-3 rounded-lg shadow-xl border text-xs font-bold flex items-center gap-2 ${
          toastType === "success" ? "bg-[#10141a]/95 border-[#528574] text-[#528574]" : "bg-[#10141a]/95 border-red-500/50 text-red-500"
        }`}>
          {toastType === "success" ? "✓" : "✗"} {toastMsg}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1115] border-2 border-red-500/60 rounded-xl max-w-md w-full p-6 md:p-8 flex flex-col gap-6 shadow-[0_0_50px_rgba(239,68,68,0.15)]">
            <div className="flex items-center gap-3 border-b border-neutral-900 pb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#241315] text-[#f87171] border border-[#3d1e22]">
                <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">Delete Account</h4>
            </div>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              Are you sure you want to permanently delete the account <span className="font-bold text-white">@{deleteConfirm.label}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3.5">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded border border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/30 hover:bg-neutral-800/60 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={proceedDeleteUser} className="px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer bg-red-600 hover:bg-red-500 text-white">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1115] border-2 border-red-500/60 rounded-xl max-w-md w-full p-6 md:p-8 flex flex-col gap-6 shadow-[0_0_50px_rgba(239,68,68,0.15)]">
            <div className="flex items-center gap-3 border-b border-neutral-900 pb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#241315] text-[#f87171] border border-[#3d1e22]">
                <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">Bulk Delete</h4>
            </div>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              Are you absolutely sure you want to permanently delete <span className="font-bold text-white">{selectedUserIds.length} selected accounts</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3.5">
              <button onClick={() => setBulkDeleteConfirm(false)} className="px-4 py-2 rounded border border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/30 hover:bg-neutral-800/60 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={proceedBulkDelete} className="px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer bg-red-600 hover:bg-red-500 text-white">
                Delete All Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upper Title (Stats Card Fully Removed) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Registered Investors Directory
          </h1>
          <p className="text-xs text-neutral-400 font-medium">
            Retrieve, monitor, and configure all investor access parameters and profiles.
          </p>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded p-4 flex items-center justify-between">
          <span className="text-xs text-red-400 font-bold">{error}</span>
          <button
            onClick={fetchUsers}
            className="text-[10px] bg-red-500/20 text-red-300 font-bold px-3 py-1.5 rounded hover:bg-red-500/30 transition-colors"
          >
            Retry Query
          </button>
        </div>
      )}

      {/* Main Grid Filters & User Board */}
      <div className="flex flex-col gap-4 w-full">
        {/* Search Filter Header */}
        <div className="flex justify-between items-center bg-[#13151a]/60 border border-neutral-800/40 p-4 rounded-t-lg w-full">
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
              placeholder="Search by username or email address..."
            />
          </div>

          <div className="text-[11px] text-neutral-500 font-bold">
            Showing {startIndex + 1}-{Math.min(startIndex + paginatedUsers.length, filteredUsers.length)} of {filteredUsers.length} accounts
          </div>
        </div>

        {/* User Directory Table (Occupies 100% full screen width boundary) */}
        <div className="bg-[#13151a]/30 border border-t-0 border-neutral-800/40 rounded-b-lg overflow-x-auto w-full">
          {isLoading ? (
            <div className="py-20 flex flex-col gap-3 items-center justify-center w-full">
              <div className="w-8 h-8 rounded-full border-2 border-[#e4c126] border-t-transparent animate-spin" />
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Hydrating directory logs...</span>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-500 gap-2 w-full">
              <svg className="w-8 h-8 opacity-40 stroke-current stroke-[1.5]" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className="text-xs font-bold">No user accounts found matching your query.</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800/80 text-sm text-neutral-400 font-semibold normal-case">
                  <th className="px-6 py-4 w-24">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={
                          paginatedUsers.length > 0 &&
                          paginatedUsers.every((u) => selectedUserIds.includes(u.id))
                        }
                        onChange={handleToggleAll}
                        className="w-4 h-4 accent-[#e4c126] rounded border-neutral-800 bg-[#0f1115] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span>S/N</span>
                    </div>
                  </th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Standing status</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Total balance</th>
                  <th className="px-6 py-4">Registered date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40 text-[14px]">
                {paginatedUsers.map((user, index) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  const serialNo = startIndex + index + 1;
                  return (
                    <tr
                      key={user.id}
                      className={`transition-colors ${
                        isSelected ? "bg-[#e4c126]/5 hover:bg-[#e4c126]/10" : "hover:bg-neutral-800/10"
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-neutral-400">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectUser(user.id)}
                            className="w-4 h-4 accent-[#e4c126] rounded border-neutral-800 bg-[#0f1115] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          <span>{serialNo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setVerifUser(user); setShowRejectInput(false); setRejectReason(""); }}
                            className={`font-extrabold transition-colors text-left focus:outline-none cursor-pointer hover:underline ${user.isVerifying ? "text-[#e4c126]" : "text-white hover:text-[#e4c126]"}`}
                            title="View Profile & Verification"
                          >
                            {user.username}
                          </button>
                          <button
                            onClick={() => setSelectedUserForTransactions(user)}
                            className="text-neutral-500 hover:text-[#e4c126] transition-colors focus:outline-none cursor-pointer p-1 rounded hover:bg-neutral-800/50"
                            title="View Transaction History Log"
                          >
                            <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-300 font-medium">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            user.status === "Active"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isVerified ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-400">Verified</span>
                        ) : user.isVerifying ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#e4c126]/10 text-[#e4c126]">Processing</span>
                        ) : (
                          <span className="text-neutral-600 text-[10px] font-bold">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white font-extrabold">
                        ${user.balance.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {/* Registration Date Column: Stacked Time above Date */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-neutral-500 font-semibold tracking-wider">
                            {new Date(user.createdAt).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                          <span className="text-white font-extrabold text-xs">
                            {new Date(user.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-4 justify-end items-center">
                          {/* Suspension Status Toggle Icon */}
                          <button
                            disabled={actionLoadingId !== null}
                            onClick={() =>
                              handleUpdateUser(user.id, {
                                status: user.status === "Active" ? "Suspended" : "Active",
                              })
                            }
                            title={user.status === "Active" ? "Suspend Account" : "Activate Account"}
                            className={`${
                              user.status === "Active" ? "text-neutral-400 hover:text-red-400" : "text-green-400 hover:text-green-300"
                            } transition-colors cursor-pointer`}
                          >
                            <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                              {user.status === "Active" ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h16.5a1.5 1.5 0 001.5-1.5V12a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 12v8.25a1.5 1.5 0 001.5 1.5z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                              )}
                            </svg>
                          </button>

                          {/* Create Transaction Icon */}
                          <button
                            onClick={() => openCreateTxn(user)}
                            title="Create Transaction for User"
                            className="text-neutral-400 hover:text-[#e4c126] transition-colors cursor-pointer"
                          >
                            <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                            </svg>
                          </button>

                          {/* Delete Account Icon */}
                          <button
                            disabled={actionLoadingId !== null}
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            title="Delete User Permanently"
                            className="text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Bulk Actions Bar — shown below table when users are selected */}
        {selectedUserIds.length > 0 && (
          <div className="bg-[#13151a] border border-neutral-800/60 rounded-lg p-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e4c126] animate-pulse" />
              <span className="text-xs font-black text-white">{selectedUserIds.length} user{selectedUserIds.length > 1 ? "s" : ""} selected</span>
            </div>
            <div className="h-5 w-px bg-neutral-800" />
            <button
              disabled={bulkActionLoading}
              onClick={() => handleBulkAction("status-active")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-black uppercase tracking-wider rounded hover:bg-green-500/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3 h-3 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              Activate
            </button>
            <button
              disabled={bulkActionLoading}
              onClick={() => handleBulkAction("status-suspended")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e4c126]/10 text-[#e4c126] border border-[#e4c126]/20 text-[10px] font-black uppercase tracking-wider rounded hover:bg-[#e4c126]/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3 h-3 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              Suspend
            </button>
            <button
              onClick={openBulkNotifModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#528574]/10 text-[#528574] border border-[#528574]/20 text-[10px] font-black uppercase tracking-wider rounded hover:bg-[#528574]/20 transition-colors cursor-pointer"
            >
              <svg className="w-3 h-3 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
              Send Notification
            </button>
            <button
              onClick={openBulkEmailModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800/60 text-neutral-300 border border-neutral-700/40 text-[10px] font-black uppercase tracking-wider rounded hover:bg-neutral-700/60 transition-colors cursor-pointer"
            >
              <svg className="w-3 h-3 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
              Send Email
            </button>
            <button
              disabled={bulkActionLoading}
              onClick={() => handleBulkAction("delete")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-black uppercase tracking-wider rounded hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3 h-3 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              Delete
            </button>
            <button
              onClick={() => setSelectedUserIds([])}
              className="ml-auto text-[10px] text-neutral-500 hover:text-neutral-300 font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Premium Pagination Control Footer */}
        {filteredUsers.length > 0 && (
          <div className="flex justify-between items-center bg-[#13151a]/40 border border-neutral-800/40 p-4 rounded-lg w-full mt-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 border rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                currentPage === 1
                  ? "border-neutral-850 text-neutral-600 bg-neutral-900/30 cursor-not-allowed"
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
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 border rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                currentPage === totalPages
                  ? "border-neutral-850 text-neutral-600 bg-neutral-900/30 cursor-not-allowed"
                  : "border-neutral-800 text-neutral-300 hover:text-white bg-[#0f1115] hover:bg-neutral-800"
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

      {/* Bulk Notification Template Picker Modal */}
      {bulkNotifModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1115] border border-neutral-800 rounded-xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 flex-shrink-0">
              <div>
                <h3 className="text-base font-black text-white">Send Notification to All Users</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">Select a template — it will be sent to all {users.length} registered users.</p>
              </div>
              <button onClick={() => setBulkNotifModal(false)} className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer">
                <svg className="w-4 h-4 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Search */}
            <div className="px-6 pt-4 pb-2 flex-shrink-0">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500 pointer-events-none">
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={notifSearch}
                  onChange={(e) => setNotifSearch(e.target.value)}
                  placeholder="Search by name, title or content..."
                  className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#528574] transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 px-6 py-3 overflow-y-auto flex-1 min-h-0">
              {loadingTemplates ? (
                <div className="flex items-center gap-3 py-8 justify-center">
                  <div className="w-5 h-5 border-2 border-[#528574] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-neutral-500">Loading templates...</span>
                </div>
              ) : (() => {
                const q = notifSearch.toLowerCase();
                const filtered = notifTemplates.filter(
                  (t) =>
                    t.name.toLowerCase().includes(q) ||
                    t.title.toLowerCase().includes(q) ||
                    t.content.toLowerCase().includes(q)
                );
                if (notifTemplates.length === 0) return (
                  <div className="py-8 text-center">
                    <p className="text-sm text-neutral-500">No notification templates found.</p>
                    <p className="text-[11px] text-neutral-600 mt-1">Create templates in Company → Notification Templates.</p>
                  </div>
                );
                if (filtered.length === 0) return (
                  <div className="py-8 text-center">
                    <p className="text-sm text-neutral-500">No templates match your search.</p>
                  </div>
                );
                return filtered.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl._id;
                  return (
                    <button
                      key={tpl._id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tpl._id)}
                      className={`text-left px-4 py-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "border-[#528574] bg-[#528574]/10 shadow-[0_0_0_1px_#528574]"
                          : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700"
                      }`}
                    >
                      <span className="text-sm font-extrabold text-white truncate">{tpl.title}</span>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                        isSelected ? "border-[#528574] bg-[#528574]" : "border-neutral-700"
                      }`}>
                        {isSelected && (
                          <svg className="w-full h-full fill-none stroke-white stroke-[3]" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                });
              })()}
            </div>

            <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-end gap-3 flex-shrink-0">
              <button onClick={() => setBulkNotifModal(false)} className="px-4 py-2 rounded border border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleBulkNotify}
                disabled={!selectedTemplateId || bulkComposing}
                className="px-5 py-2 rounded bg-[#528574] hover:bg-[#436e5f] disabled:bg-neutral-700 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
              >
                {bulkComposing ? (
                  <><div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending...</>
                ) : "Send to All Users"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Email Template Picker Modal */}
      {bulkEmailModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1115] border border-neutral-800 rounded-xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 flex-shrink-0">
              <div>
                <h3 className="text-base font-black text-white">Send Email to Selected Users</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">Select a template — it will be sent to {selectedUserIds.length} selected user{selectedUserIds.length > 1 ? "s" : ""}.</p>
              </div>
              <button onClick={() => setBulkEmailModal(false)} className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer">
                <svg className="w-4 h-4 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-6 pt-4 pb-2 flex-shrink-0">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500 pointer-events-none">
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  placeholder="Search by name or title..."
                  className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 px-6 py-3 overflow-y-auto flex-1 min-h-0">
              {loadingEmailTemplates ? (
                <div className="flex items-center gap-3 py-8 justify-center">
                  <div className="w-5 h-5 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-neutral-500">Loading templates...</span>
                </div>
              ) : (() => {
                const q = emailSearch.toLowerCase();
                const filtered = emailTemplates.filter(
                  (t) =>
                    t.name.toLowerCase().includes(q) ||
                    t.title.toLowerCase().includes(q)
                );
                if (emailTemplates.length === 0) return (
                  <div className="py-8 text-center">
                    <p className="text-sm text-neutral-500">No email templates found.</p>
                    <p className="text-[11px] text-neutral-600 mt-1">Create templates in Company → Email Templates.</p>
                  </div>
                );
                if (filtered.length === 0) return (
                  <div className="py-8 text-center">
                    <p className="text-sm text-neutral-500">No templates match your search.</p>
                  </div>
                );
                return filtered.map((tpl) => {
                  const isSelected = selectedEmailTemplateId === tpl._id;
                  return (
                    <button
                      key={tpl._id}
                      type="button"
                      onClick={() => setSelectedEmailTemplateId(tpl._id)}
                      className={`text-left px-4 py-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "border-neutral-500 bg-neutral-800/50 shadow-[0_0_0_1px_#6b7280]"
                          : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700"
                      }`}
                    >
                      <span className="text-sm font-extrabold text-white truncate">{tpl.title}</span>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                        isSelected ? "border-neutral-400 bg-neutral-400" : "border-neutral-700"
                      }`}>
                        {isSelected && (
                          <svg className="w-full h-full fill-none stroke-white stroke-[3]" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                });
              })()}
            </div>

            <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-end gap-3 flex-shrink-0">
              <button onClick={() => setBulkEmailModal(false)} className="px-4 py-2 rounded border border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleBulkEmail}
                disabled={!selectedEmailTemplateId || bulkEmailing}
                className="px-5 py-2 rounded bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
              >
                {bulkEmailing ? (
                  <><div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending...</>
                ) : `Send to ${selectedUserIds.length} User${selectedUserIds.length > 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Transaction Modal */}
      {createTxnUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1115] border border-neutral-800 rounded-xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-black text-white">Create Transaction</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">Creating for @{createTxnUser.username}</p>
              </div>
              <button onClick={() => setCreateTxnUser(null)} className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer">
                <svg className="w-4 h-4 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateTxnSubmit} className="flex flex-col gap-4 px-6 py-6">
              {/* Currency wallet selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Currency Wallet</label>
                {loadingUserWallets ? (
                  <div className="h-10 bg-neutral-900 rounded border border-neutral-800 animate-pulse" />
                ) : userWallets.length === 0 ? (
                  <p className="text-xs text-red-400 font-medium">No wallets found for this user.</p>
                ) : (
                  <select
                    value={txnForm.currencySymbol}
                    onChange={(e) => setTxnForm((f) => ({ ...f, currencySymbol: e.target.value }))}
                    className="bg-neutral-950 border border-neutral-800 p-2.5 rounded text-white text-sm focus:outline-none focus:border-[#e4c126] font-medium"
                  >
                    {userWallets.map((w) => (
                      <option key={w.currencySymbol} value={w.currencySymbol}>
                        {w.currencyName} ({w.currencySymbol}) — ${w.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {/* Transaction type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Transaction Type</label>
                <select
                  value={txnForm.transactionType}
                  onChange={(e) => setTxnForm((f) => ({ ...f, transactionType: e.target.value }))}
                  className="bg-neutral-950 border border-neutral-800 p-2.5 rounded text-white text-sm focus:outline-none focus:border-[#e4c126] font-medium"
                >
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="bonus">Bonus</option>
                  <option value="reduction">Reduction</option>
                </select>
              </div>
              {/* Plan — only for deposit */}
              {txnForm.transactionType === "deposit" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Investment Plan</label>
                  {loadingUserWallets ? (
                    <div className="h-10 bg-neutral-900 rounded border border-neutral-800 animate-pulse" />
                  ) : plans.length === 0 ? (
                    <p className="text-xs text-red-400 font-medium">No plans found.</p>
                  ) : (
                    <select
                      value={txnForm.planId}
                      onChange={(e) => setTxnForm((f) => ({ ...f, planId: e.target.value }))}
                      className="bg-neutral-950 border border-neutral-800 p-2.5 rounded text-white text-sm focus:outline-none focus:border-[#e4c126] font-medium"
                    >
                      {plans.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} — {p.duration}d @ {p.percent}%
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Amount (USD)</label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  placeholder="e.g. 500"
                  value={txnForm.amount}
                  onChange={(e) => setTxnForm((f) => ({ ...f, amount: e.target.value }))}
                  className="bg-neutral-950 border border-neutral-800 p-2.5 rounded text-white text-sm focus:outline-none focus:border-[#e4c126] font-mono"
                />
              </div>
              {/* Method — only for deposit */}
              {txnForm.transactionType === "deposit" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Method</label>
                  <select
                    value={txnForm.method}
                    onChange={(e) => setTxnForm((f) => ({ ...f, method: e.target.value }))}
                    className="bg-neutral-950 border border-neutral-800 p-2.5 rounded text-white text-sm focus:outline-none focus:border-[#e4c126] font-medium"
                  >
                    <option value="direct">Direct</option>
                    <option value="balance">From Balance</option>
                  </select>
                </div>
              )}
              <button
                type="submit"
                disabled={txnSubmitting || userWallets.length === 0}
                className="w-full py-3 bg-[#e4c126] hover:bg-[#d8b520] disabled:bg-neutral-700 disabled:cursor-not-allowed text-neutral-900 font-extrabold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                {txnSubmitting ? "Creating..." : "Create Transaction"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ID Image Zoom Lightbox */}
      {verifImageZoom && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setVerifImageZoom(null)}
        >
          <img
            src={verifImageZoom}
            alt="ID Document Full"
            className="max-w-full max-h-full object-contain rounded shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setVerifImageZoom(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Verification Profile Modal */}
      {verifUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1115] border border-neutral-800 rounded-xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 flex-shrink-0">
              <div>
                <h3 className="text-base font-black text-white">Investor Profile</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">@{verifUser.username}</p>
              </div>
              <button onClick={() => { setVerifUser(null); setShowRejectInput(false); setRejectReason(""); }} className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer">
                <svg className="w-4 h-4 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0 px-6 py-5 flex flex-col gap-5">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">Email</span>
                  <span className="text-white font-semibold break-all">{verifUser.email}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">Balance</span>
                  <span className="text-[#e4c126] font-extrabold">${verifUser.balance.toFixed(2)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">Status</span>
                  <span className={`text-xs font-black uppercase inline-block self-start px-2 py-0.5 rounded ${verifUser.status === "Active" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>{verifUser.status}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">Verification</span>
                  {verifUser.isVerified ? (
                    <span className="text-xs font-black uppercase inline-block self-start px-2 py-0.5 rounded bg-green-500/10 text-green-400">Verified</span>
                  ) : verifUser.isVerifying ? (
                    <span className="text-xs font-black uppercase inline-block self-start px-2 py-0.5 rounded bg-[#e4c126]/10 text-[#e4c126]">Processing</span>
                  ) : (
                    <span className="text-xs font-bold text-neutral-500">Not submitted</span>
                  )}
                </div>
              </div>

              {/* PassKey */}
              <div className="bg-neutral-900/60 border border-neutral-800 p-4 rounded flex flex-col gap-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">PassKey</span>
                <span className="text-xs font-mono text-[#e4c126] break-all select-all">{verifUser.passKey || "N/A"}</span>
              </div>

              {/* KYC fields */}
              {(verifUser.firstName || verifUser.lastName || verifUser.country) ? (
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold border-b border-neutral-800 pb-2">KYC Details</span>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-500 uppercase font-extrabold">First Name</span>
                      <span className="text-white font-semibold">{verifUser.firstName || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-500 uppercase font-extrabold">Last Name</span>
                      <span className="text-white font-semibold">{verifUser.lastName || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-500 uppercase font-extrabold">Date of Birth</span>
                      <span className="text-white font-semibold">{verifUser.dateOfBirth ? new Date(verifUser.dateOfBirth).toLocaleDateString() : "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-500 uppercase font-extrabold">Gender</span>
                      <span className="text-white font-semibold">{verifUser.gender || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-500 uppercase font-extrabold">Marital Status</span>
                      <span className="text-white font-semibold">{verifUser.maritalStatus || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-500 uppercase font-extrabold">Phone Number</span>
                      <span className="text-white font-semibold">{verifUser.phoneNumber || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-500 uppercase font-extrabold">Country</span>
                      <span className="text-white font-semibold">{verifUser.country || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <span className="text-[10px] text-neutral-500 uppercase font-extrabold">Occupation</span>
                      <span className="text-white font-semibold">{verifUser.occupation || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <span className="text-[10px] text-neutral-500 uppercase font-extrabold">ID Type</span>
                      <span className="text-white font-semibold">{verifUser.idType || "—"}</span>
                    </div>
                  </div>
                  {verifUser.idImage && (
                    <div className="flex flex-col gap-2 mt-1">
                      <span className="text-[10px] text-neutral-500 uppercase font-extrabold">ID Document</span>
                      <button
                        type="button"
                        onClick={() => setVerifImageZoom(verifUser.idImage)}
                        className="self-start cursor-zoom-in focus:outline-none group"
                        title="Click to zoom"
                      >
                        <img
                          src={verifUser.idImage}
                          alt="ID Document"
                          className="h-12 w-auto object-contain rounded border border-neutral-700 bg-neutral-950 group-hover:border-[#e4c126]/60 transition-colors"
                        />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-neutral-500 italic">No KYC details submitted yet.</p>
              )}

              {/* Reject reason input */}
              {showRejectInput && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">Rejection Reason</label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Write the reason for rejection..."
                    className="bg-neutral-950 border border-neutral-800 p-3 rounded text-white text-sm focus:outline-none focus:border-red-500 resize-none font-medium"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
                      className="flex-1 py-2 rounded border border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectVerification}
                      disabled={verifActionLoading || !rejectReason.trim()}
                      className="flex-1 py-2 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {verifActionLoading ? "Rejecting..." : "Send Rejection"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            {!verifUser.isVerified && verifUser.isVerifying && !showRejectInput && (
              <div className="px-6 py-4 border-t border-neutral-800 flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowRejectInput(true)}
                  disabled={verifActionLoading}
                  className="flex-1 py-2.5 rounded border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={handleApproveVerification}
                  disabled={verifActionLoading}
                  className="flex-1 py-2.5 rounded bg-[#528574] hover:bg-[#436e5f] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {verifActionLoading ? "Approving..." : "Approve"}
                </button>
              </div>
            )}
            {(verifUser.isVerified || !verifUser.isVerifying) && !showRejectInput && (
              <div className="px-6 py-4 border-t border-neutral-800 flex justify-end flex-shrink-0">
                <button onClick={() => setVerifUser(null)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white rounded transition-colors cursor-pointer">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. User Details Modal Popup */}
      {selectedUserForDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#13151a] border border-neutral-800 rounded-lg w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800">
              <h3 className="text-base font-black text-white tracking-tight">Investor Account Profile</h3>
              <button
                onClick={() => setSelectedUserForDetails(null)}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Details Content */}
            <div className="p-6 flex flex-col gap-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">Username</span>
                  <span className="text-sm font-extrabold text-white">{selectedUserForDetails.username}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">Account Role</span>
                  <span className="text-sm font-extrabold text-white uppercase">{selectedUserForDetails.role}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">Email Address</span>
                <span className="text-sm font-extrabold text-white">{selectedUserForDetails.email}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">Standing Status</span>
                  <span className={`text-xs font-black inline-block uppercase tracking-wide self-start mt-0.5 px-2 py-0.5 rounded ${
                    selectedUserForDetails.status === "Active" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    {selectedUserForDetails.status}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">Total Balance</span>
                  <span className="text-sm font-extrabold text-[#e4c126]">${selectedUserForDetails.balance.toFixed(2)}</span>
                </div>
              </div>

              {/* PassKey parameter displaying user password plaintext */}
              <div className="flex flex-col gap-1 bg-neutral-900/60 border border-neutral-850 p-4 rounded mt-2">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">User PassKey (Plaintext Password)</span>
                <div className="flex items-center justify-between gap-3 mt-1">
                  <span className="text-xs font-mono font-bold text-[#e4c126] tracking-wider select-all break-all">
                    {selectedUserForDetails.passKey || "N/A"}
                  </span>
                  {selectedUserForDetails.passKey && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedUserForDetails.passKey);
                        showToast("Passkey copied to clipboard!", "success");
                      }}
                      className="text-[10px] bg-[#e4c126]/10 text-[#e4c126] hover:bg-[#e4c126]/20 transition-all font-bold px-2 py-1 rounded cursor-pointer"
                    >
                      Copy
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">Registration Date</span>
                <span className="text-xs text-neutral-300 font-medium">
                  {new Date(selectedUserForDetails.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
            {/* Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-neutral-800 bg-[#0f1115]">
              <button
                onClick={() => setSelectedUserForDetails(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white rounded transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. User Transaction History Modal Popup */}
      {selectedUserForTransactions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#13151a] border border-neutral-800 rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800">
              <div className="flex flex-col gap-0.5 text-left">
                <h3 className="text-base font-black text-white tracking-tight">Investor Transaction History</h3>
                <span className="text-[11px] text-neutral-500">Record overview for @{selectedUserForTransactions.username}</span>
              </div>
              <button
                onClick={() => setSelectedUserForTransactions(null)}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Content Table */}
            <div className="p-6 overflow-y-auto max-h-[400px] text-left">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-[12px] text-neutral-400 font-semibold normal-case">
                    <th className="py-2.5">TXN ID</th>
                    <th className="py-2.5">Asset / Technology Pipeline</th>
                    <th className="py-2.5">Type</th>
                    <th className="py-2.5">Amount</th>
                    <th className="py-2.5">Standing Status</th>
                    <th className="py-2.5 text-right">Allocation Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/40 text-xs">
                  {[
                    {
                      id: "TXN-7089",
                      fund: "Tranche A CCUS Pipeline Seed",
                      amount: selectedUserForTransactions.balance * 0.6 || 12000,
                      type: "deposit",
                      status: "completed",
                      date: "May 12, 2026",
                    },
                    {
                      id: "TXN-7088",
                      fund: "Offshore Carbon Capture Refinery",
                      amount: selectedUserForTransactions.balance * 0.1 || 1450,
                      type: "yield",
                      status: "completed",
                      date: "May 08, 2026",
                    },
                    {
                      id: "TXN-7087",
                      fund: "Carbon Certificate Offset Purchase",
                      amount: selectedUserForTransactions.balance * 0.05 || 320,
                      type: "offset",
                      status: "completed",
                      date: "Apr 28, 2026",
                    },
                    {
                      id: "TXN-7086",
                      fund: "Sustainable Methane Pipeline B",
                      amount: selectedUserForTransactions.balance * 0.25 || 25000,
                      type: "deposit",
                      status: "completed",
                      date: "Apr 15, 2026",
                    },
                  ].map((t) => (
                    <tr key={t.id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="py-3 font-mono font-bold text-neutral-400">{t.id}</td>
                      <td className="py-3 font-extrabold text-white">{t.fund}</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold uppercase ${
                          t.type === "deposit" ? "text-green-400" : t.type === "yield" ? "text-[#e4c126]" : "text-blue-400"
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 font-black text-white">
                        ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3">
                        <span className="text-[9px] text-[#528574] font-extrabold bg-[#528574]/15 px-2 py-0.5 rounded uppercase">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-neutral-500 font-semibold">{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-neutral-800 bg-[#0f1115]">
              <button
                onClick={() => setSelectedUserForTransactions(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white rounded transition-colors cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
