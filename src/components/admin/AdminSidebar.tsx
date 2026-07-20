"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore } from "@/store/authStore";
import { apiCall } from "@/lib/apiClient";

export function AdminSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated } = useAuthStore();

  // Collapsible submenu states
  const [isPagesOpen, setIsPagesOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);

  // Real-time Notification Bindings
  const { fetchNotifications, connectSocket, getUnreadBadge, notifications } = useNotificationStore();
  const unreadBadge = getUnreadBadge(true); // isAdminRead = true flag

  const [pendingCount, setPendingCount] = useState(0);
  const prevNotifLen = useRef(0);

  const fetchPendingCount = async () => {
    try {
      const res = await apiCall<{ success: boolean; transactions: any[] }>("/api/users/transactions/all");
      if (res.success && res.transactions) {
        const pending = res.transactions.filter((t) => t.status === "pending").length;
        setPendingCount(pending);
      }
    } catch (err) {
      console.error("Failed to load pending transactions count:", err);
    }
  };

  // Initial setup — one fetch on mount, no polling
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket("admin");
      fetchNotifications("admin");
      fetchPendingCount();
    }
  }, [isAuthenticated, connectSocket, fetchNotifications]);

  // Re-fetch pending count only when a deposit-related socket notification arrives
  useEffect(() => {
    if (notifications.length <= prevNotifLen.current) {
      prevNotifLen.current = notifications.length;
      return;
    }
    const newOnes = notifications.slice(0, notifications.length - prevNotifLen.current);
    prevNotifLen.current = notifications.length;
    const hasDepositEvent = newOnes.some((n) =>
      n.notificationName.includes("deposit") || n.notificationName.includes("transaction")
    );
    if (hasDepositEvent) fetchPendingCount();
  }, [notifications]);

  return (
    <>
      {/* Sidebar Backdrop Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 h-full bg-[#13151a] border-r border-neutral-800 flex flex-col justify-between flex-shrink-0 overflow-y-auto transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static transition-transform duration-300 ease-in-out`}
      >
        {/* Top Branding & Nav */}
        <div className="flex flex-col">
          {/* Logo Brand */}
          <Link
            href="/"
            className="h-20 px-6 border-b border-neutral-800 flex items-center flex-shrink-0 group transition-all"
          >
            <div className="relative h-10 w-full">
              <Image
                src="/CapricornLogo.png"
                alt="Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="p-4 flex flex-col gap-1">
            {/* 1. Dashboard */}
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-4 py-2.5 rounded text-[15px] font-bold transition-colors ${
                pathname === "/admin"
                  ? "bg-[#e4c126] text-neutral-900"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
              }`}
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Dashboard
            </Link>

            {/* 2. Users */}
            <Link
              href="/admin/users"
              className={`flex items-center gap-3 px-4 py-2.5 rounded text-[15px] font-bold transition-colors ${
                pathname === "/admin/users"
                  ? "bg-[#e4c126] text-neutral-900"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
              }`}
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Users
            </Link>

            {/* 3. Active Deposits */}
            <Link
              href="/admin/active-deposits"
              className={`flex items-center gap-3 px-4 py-2.5 rounded text-[15px] font-bold transition-colors ${
                pathname === "/admin/active-deposits"
                  ? "bg-[#e4c126] text-neutral-900"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
              }`}
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l4 4m-4-4L8 7m4 14l4-4m-4 4l-4-4" />
              </svg>
              Active Deposits
            </Link>

            {/* 4. Transactions */}
            <Link
              href="/admin/transactions"
              className={`flex items-center justify-between px-4 py-2.5 rounded text-[15px] font-bold transition-colors ${
                pathname === "/admin/transactions"
                  ? "bg-[#e4c126] text-neutral-900"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
                Transactions
              </div>
              {pendingCount > 0 && (
                <span className="bg-[#f87171] text-white text-[10px] font-black rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 animate-pulse">
                  {pendingCount}
                </span>
              )}
            </Link>

            {/* 5. Plans */}
            <Link
              href="/admin/plans"
              className={`flex items-center gap-3 px-4 py-2.5 rounded text-[15px] font-bold transition-colors ${
                pathname === "/admin/plans"
                  ? "bg-[#e4c126] text-neutral-900"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
              }`}
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h12M6 12h12m-12 6h12" />
              </svg>
              Plans
            </Link>

            {/* 6. Currencies */}
            <Link
              href="/admin/currencies"
              className={`flex items-center gap-3 px-4 py-2.5 rounded text-[15px] font-bold transition-colors ${
                pathname === "/admin/currencies"
                  ? "bg-[#e4c126] text-neutral-900"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
              }`}
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879-.659c1.546-1.16 3.7-1.16 5.244 0l.879.66M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Currencies
            </Link>

            {/* 7. Earnings */}
            <Link
              href="/admin/earnings"
              className={`flex items-center gap-3 px-4 py-2.5 rounded text-[15px] font-bold transition-colors ${
                pathname === "/admin/earnings"
                  ? "bg-[#e4c126] text-neutral-900"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
              }`}
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              Earnings
            </Link>

            {/* 8. Referrals */}
            <Link
              href="/admin/referrals"
              className={`flex items-center gap-3 px-4 py-2.5 rounded text-[15px] font-bold transition-colors ${
                pathname === "/admin/referrals"
                  ? "bg-[#e4c126] text-neutral-900"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
              }`}
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235A8.91 8.91 0 019 18a8.91 8.91 0 015 1.236m-10.236 0A9.015 9.015 0 013 18c0-1.29.271-2.518.759-3.633m10.478 4.868A9.045 9.045 0 0019 18c0-1.29-.271-2.518-.759-3.633m-10.48 0a8.966 8.966 0 0110.48 0m-10.48 0l.003-.004L9.69 11.55" />
              </svg>
              Referrals
            </Link>

            {/* 1.5. Notifications (moved below Referrals) */}
            <Link
              href="/admin/notifications"
              className={`flex items-center justify-between px-4 py-2.5 rounded text-[15px] font-bold transition-colors ${
                pathname === "/admin/notifications"
                  ? "bg-[#e4c126] text-neutral-900"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                Notifications
              </div>
              {unreadBadge && (
                <span className="bg-[#e4c126] text-black text-[10px] font-black rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
                  {unreadBadge}
                </span>
              )}
            </Link>

            {/* 8.5. Reviews */}
            <Link
              href="/admin/reviews"
              className={`flex items-center gap-3 px-4 py-2.5 rounded text-[15px] font-bold transition-colors ${
                pathname === "/admin/reviews"
                  ? "bg-[#e4c126] text-neutral-900"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
              }`}
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c-.196-.399-.678-.399-.874 0L7.54 9.07l-6.136.89c-.44.064-.616.606-.298.917l4.44 4.328-1.048 6.11c-.075.44.384.773.778.567L10 18.822l5.42 2.853c.395.206.853-.127.778-.567l-1.048-6.11 4.44-4.328c.318-.311.142-.853-.298-.917l-6.136-.89L11.48 3.5z" />
              </svg>
              Reviews
            </Link>

            {/* 9. Pages Dropdown */}
            <div>
              <button
                onClick={() => setIsPagesOpen(!isPagesOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded text-[15px] font-bold transition-colors ${
                  pathname.startsWith("/admin/pages")
                    ? "bg-[#e4c126]/10 text-[#e4c126]"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/40 cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span>Pages</span>
                </div>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isPagesOpen ? "rotate-180 text-white" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Submenus: Faq, Blog, Terms */}
              {isPagesOpen && (
                <div className="pl-9 pr-2 py-1 flex flex-col gap-1 animate-fade-in">
                  <Link
                    href="/admin/pages/faq"
                    className={`block py-1.5 text-[15px] font-bold transition-colors ${
                      pathname === "/admin/pages/faq" ? "text-[#e4c126]" : "text-neutral-500 hover:text-white cursor-pointer"
                    }`}
                  >
                    Faq
                  </Link>
                  <Link
                    href="/admin/pages/blog"
                    className={`block py-1.5 text-[15px] font-bold transition-colors ${
                      pathname === "/admin/pages/blog" ? "text-[#e4c126]" : "text-neutral-500 hover:text-white cursor-pointer"
                    }`}
                  >
                    Blog
                  </Link>
                  <Link
                    href="/admin/pages/terms"
                    className={`block py-1.5 text-[15px] font-bold transition-colors ${
                      pathname === "/admin/pages/terms" ? "text-[#e4c126]" : "text-neutral-500 hover:text-white cursor-pointer"
                    }`}
                  >
                    Terms
                  </Link>
                </div>
              )}
            </div>

            {/* 10. Company Dropdown */}
            <div>
              <button
                onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded text-[15px] font-bold transition-colors ${
                  pathname.startsWith("/admin/company")
                    ? "bg-[#e4c126]/10 text-[#e4c126]"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/40 cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M21 21H3" />
                  </svg>
                  <span>Company</span>
                </div>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isCompanyOpen ? "rotate-180 text-white" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Submenus: Settings, Staffs, Notification Templates, Email Templates */}
              {isCompanyOpen && (
                <div className="pl-9 pr-2 py-1 flex flex-col gap-1 animate-fade-in">
                  <Link
                    href="/admin/company/settings"
                    className={`block py-1.5 text-[15px] font-bold transition-colors ${
                      pathname === "/admin/company/settings" ? "text-[#e4c126]" : "text-neutral-500 hover:text-white cursor-pointer"
                    }`}
                  >
                    Settings
                  </Link>
                  <Link
                    href="/admin/company/staffs"
                    className={`block py-1.5 text-[15px] font-bold transition-colors ${
                      pathname === "/admin/company/staffs" ? "text-[#e4c126]" : "text-neutral-500 hover:text-white cursor-pointer"
                    }`}
                  >
                    Staffs
                  </Link>
                  <Link
                    href="/admin/company/notification-templates"
                    className={`block py-1.5 text-[15px] font-bold transition-colors ${
                      pathname === "/admin/company/notification-templates" ? "text-[#e4c126]" : "text-neutral-500 hover:text-white cursor-pointer"
                    }`}
                  >
                    Notification Templates
                  </Link>
                  <Link
                    href="/admin/company/email-templates"
                    className={`block py-1.5 text-[15px] font-bold transition-colors ${
                      pathname === "/admin/company/email-templates" ? "text-[#e4c126]" : "text-neutral-500 hover:text-white cursor-pointer"
                    }`}
                  >
                    Email Templates
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Bottom Sign Out */}
        <div className="p-4 border-t border-neutral-800 flex-shrink-0">
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex items-center gap-3 px-4 py-3 rounded text-[15px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full cursor-pointer text-left focus:outline-none"
          >
            <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
