"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { apiCall } from "@/lib/apiClient";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore } from "@/store/authStore";
import SmartsuppWidget from "@/components/SmartsuppWidget";
import PageLoader from "@/components/PageLoader";
import GoogleTranslate from "@/components/GoogleTranslate";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";



export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const username = user?.username;
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    setIsHydrated(useAuthStore.persist.hasHydrated());
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
    return () => unsubFinishHydration();
  }, []);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [isHydrated, isAuthenticated, router]);

  const { connectSocket, fetchNotifications, getUnreadBadge } = useNotificationStore();
  const unreadBadge = getUnreadBadge(false);

  useEffect(() => {
    if (isAuthenticated && username) {
      connectSocket(username);
      fetchNotifications(username);
    }
  }, [isAuthenticated, username, connectSocket, fetchNotifications]);

  if (!isHydrated || !isAuthenticated) return null;

  return (
    <div className="flex h-screen w-full bg-[#0a0b0d] text-white overflow-hidden font-sans relative">
      <PageLoader />
      
      <DashboardSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Workspace Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Workspace Top Header */}
        <header className="h-20 bg-[#0f1115] border-b border-neutral-900 px-[10px] md:px-8 flex items-center justify-between ">
          <div className="flex items-center gap-2 text-left">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 text-neutral-400 hover:text-white md:hidden cursor-pointer focus:outline-none"
              aria-label="Toggle Sidebar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {isSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <div className="flex flex-col gap-0.5 truncate">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-extrabold">Welcome back,</span>
              <h2 className="text-sm sm:text-base font-black text-white truncate">
                {username || "Investor"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button 
              onClick={() => router.push("/dashboard/notifications")}
              className="p-2 text-neutral-400 hover:text-white relative cursor-pointer" 
              title="Notifications"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unreadBadge && (
                <span className="absolute -top-1 -right-1 bg-[#e4c126] text-black text-[10px] font-black rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 border border-[#0f1115]">
                  {unreadBadge}
                </span>
              )}
            </button>

            {/* Profile Link Icon */}
            <Link
              href="/dashboard/profile"
              className="p-2 text-neutral-400 hover:text-white transition-colors"
              title="My Profile"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>

            {/* Logout Icon */}
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="p-2 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </header>

        {/* Scrollable Workspaces */}
        <main className="flex-1 overflow-y-auto bg-[#0a0b0d]">
          {children}
        </main>

      </div>
      <SmartsuppWidget />
    </div>
  );
}
