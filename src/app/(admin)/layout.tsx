"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore } from "@/store/authStore";
import { apiCall } from "@/lib/apiClient";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
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
    if (isHydrated && (!isAuthenticated || user?.role !== "staff")) {
      router.push("/login");
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const { getUnreadBadge } = useNotificationStore();
  const unreadBadge = getUnreadBadge(true); // isAdminRead = true flag

  if (!isHydrated || !isAuthenticated || user?.role !== "staff") return null;

  return (
    <div className="flex h-screen w-full bg-[#0d0e12] text-white overflow-hidden font-sans relative">
      
      <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Workspace Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Workspace Top Header */}
        <header className="h-20 bg-[#13151a] border-b border-neutral-800 px-[10px] md:px-8 flex items-center justify-between ">
          <div className="flex items-center gap-2">
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
            <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-white tracking-wide truncate">
              Administrative Control Panel
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button 
              onClick={() => router.push("/admin/notifications")}
              className="p-2 text-neutral-400 hover:text-white relative cursor-pointer"
              title="Notifications"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unreadBadge && (
                <span className="absolute -top-1 -right-1 bg-[#e4c126] text-black text-[10px] font-black rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 border border-[#13151a]">
                  {unreadBadge}
                </span>
              )}
            </button>

            {/* Settings Icon */}
            <button 
              onClick={() => router.push("/admin/company/settings")}
              className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer" 
              title="Company Settings"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

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
        <main className="flex-1 overflow-y-auto bg-[#0d0e12]">
          {children}
        </main>

      </div>
    </div>
  );
}
