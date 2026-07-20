"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { apiCall } from "@/lib/apiClient";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore } from "@/store/authStore";

function SidebarNav() {
  const pathname = usePathname();
  const pathParts = pathname ? pathname.split("/") : [];
  const tab = pathParts[2] || "portfolio";
  const { user } = useAuthStore();
  const username = user?.username;

  const { getUnreadBadge } = useNotificationStore();
  const unreadBadge = getUnreadBadge(false);

  const [activeDeposits, setActiveDeposits] = useState<number | null>(null);

  useEffect(() => {
    if (username) {
      apiCall<{ success: boolean; wallets: any[] }>(`/api/users/wallets?username=${username}`)
        .then((res) => {
          if (res.success && res.wallets) {
            const sum = res.wallets.reduce((acc, curr) => acc + (curr.activeDeposit || 0), 0);
            setActiveDeposits(sum);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [username]);

  const navItems = [
    {
      name: "My Portfolio",
      href: "/dashboard",
      active: tab === "portfolio",
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      )
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      active: tab === "profile",
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      )
    },
    {
      name: "Deposit",
      href: "/dashboard/deposit",
      active: tab === "deposit",
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" />
        </svg>
      )
    },
    {
      name: "Withdrawal",
      href: "/dashboard/withdrawal",
      active: tab === "withdrawal",
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
        </svg>
      )
    }
  ];

  const secondaryNavItems = [
    {
      name: "Active Deposit",
      href: "/dashboard/active-deposit",
      active: tab === "active-deposit",
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.214-.145A3.75 3.75 0 0112 11.584V11.58a3.75 3.75 0 00-2.786-3.64l-.214-.145L12 6.516v.513c2.021.124 3.75 1.7 3.75 3.722v.003c0 2.022-1.729 3.598-3.75 3.722v.513z" />
        </svg>
      )
    },
    {
      name: "Transactions",
      href: "/dashboard/transactions",
      active: tab === "transactions",
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: "Earnings",
      href: "/dashboard/earnings",
      active: tab === "earnings",
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941" />
        </svg>
      )
    },
    {
      name: "Referral",
      href: "/dashboard/referral",
      active: tab === "referral",
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.25-9h16.5" />
        </svg>
      )
    },
    {
      name: "Notifications",
      href: "/dashboard/notifications",
      active: tab === "notifications",
      badge: unreadBadge,
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      )
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      active: tab === "settings",
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <nav className="p-4 flex flex-col gap-1.5 mt-4">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded text-[15px] font-bold transition-colors ${
            item.active
              ? "bg-[#528574] text-white"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/40"
          }`}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            {item.name}
          </div>
          {item.name === "Notifications" && unreadBadge && (
            <span className="bg-[#e4c126] text-black text-[10px] font-black rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
              {unreadBadge}
            </span>
          )}
        </Link>
      ))}

      {secondaryNavItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded text-[15px] font-bold transition-colors ${
            item.active
              ? "bg-[#528574] text-white"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/40"
          }`}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            {item.name}
          </div>
          {item.name === "Notifications" && unreadBadge && (
            <span className="bg-[#e4c126] text-black text-[10px] font-black rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
              {unreadBadge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

import GoogleTranslate from "@/components/GoogleTranslate";

export function DashboardSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
}) {
  const router = useRouter();
  const { logout } = useAuthStore();

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
        className={`fixed inset-y-0 left-0 z-40 w-64 h-full bg-[#0f1115] border-r border-neutral-900 flex flex-col justify-between flex-shrink-0 overflow-y-auto transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col">
          {/* Logo Brand */}
          <Link
            href="/"
            className="h-20 px-6 border-b border-neutral-900 flex items-center flex-shrink-0 group transition-all"
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

          {/* Language Translator */}
          <div className="px-4 pt-3 pb-1 border-b border-neutral-900">
            <GoogleTranslate elementId="gt-dashboard" />
          </div>

          {/* Nav Links with Suspense */}
          <Suspense
            fallback={<div className="p-4 text-xs text-neutral-500">Loading Navigation...</div>}
          >
            <SidebarNav />
          </Suspense>
        </div>

        {/* Bottom Sign Out */}
        <div className="p-4 border-t border-neutral-900">
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex items-center gap-3 px-4 py-3 rounded text-[15px] font-bold text-neutral-400 hover:text-white hover:bg-neutral-900/40 transition-colors w-full text-left cursor-pointer focus:outline-none"
          >
            <svg
              className="w-4 h-4 fill-none stroke-current stroke-[2]"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
