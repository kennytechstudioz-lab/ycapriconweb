"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSettingStore } from "@/store/settingStore";
import { useAuthStore } from "@/store/authStore";
import GoogleTranslate from "@/components/GoogleTranslate";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const userRole = user?.role;

  const { setting, fetchSettings } = useSettingStore();

  const [isSticky, setIsSticky] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleDropdown = (menu: string) => {
    if (activeDropdown === menu) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(menu);
    }
  };

  // Helper function to check path active states
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  // Helper class resolver for nav items
  const navItemClass = (path: string) => {
    const active = isActive(path);
    if (active) {
      return isSticky ? "text-[#528574] font-extrabold" : "text-[#e4c126] font-extrabold";
    }
    return isSticky
      ? "text-neutral-800 hover:text-[#528574] transition-colors"
      : "text-white hover:text-[#e4c126] transition-colors";
  };

  return (
    <>
      <header
        className={`left-0 w-full z-50 transition-all duration-300 ease-in-out ${
          isSticky
            ? "fixed top-0 bg-white/95 backdrop-blur-md shadow-md py-0 md:py-3 text-neutral-900"
            : "absolute top-0 bg-gradient-to-b from-black/60 to-transparent py-0 md:py-5 text-white"
        }`}
      >
        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-[10px] md:px-6 py-2 md:py-4 flex justify-between items-center">
          {/* Logo + Translator stacked */}
          <div className="flex flex-col gap-1.5">
            <Link href="/" className="flex items-center group">
              <div className="relative h-[52px] w-[187px]">
                <Image
                  src="/CapricornLogo.png"
                  alt="Capricorn"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
            <GoogleTranslate elementId="gt-home-desktop" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-bold tracking-wider">
            <Link href="/" className={navItemClass("/")}>
              HOME
            </Link>

            <Link href="/about" className={navItemClass("/about")}>
              ABOUT US
            </Link>

            <Link href="/plans" className={navItemClass("/plans")}>
              INVESTMENT PLANS
            </Link>

            <Link href="/projects" className={navItemClass("/projects")}>
              PROJECTS
            </Link>

            <Link href="/contact" className={navItemClass("/contact")}>
              CONTACT US
            </Link>

            {/* Pages Dropdown with FAQ, Blog, Terms & Conditions */}
            <div className="relative group">
              <button
                onClick={() => toggleDropdown("pages")}
                className={`flex items-center gap-1 focus:outline-none ${
                  isSticky
                    ? "text-neutral-800 hover:text-[#528574]"
                    : "text-white hover:text-[#e4c126]"
                }`}
              >
                <span>PAGES</span>
                <svg className="w-3.5 h-3.5 text-current" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-52 rounded bg-neutral-900 border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 py-2">
                <Link href="/faq" className="block px-4 py-2 hover:bg-neutral-800 hover:text-[#e4c126] text-white transition-colors text-left">
                  FAQ
                </Link>
                <Link href="/blog" className="block px-4 py-2 hover:bg-neutral-800 hover:text-[#e4c126] text-white transition-colors text-left">
                  Blog
                </Link>
                <Link href="/terms" className="block px-4 py-2 hover:bg-neutral-800 hover:text-[#e4c126] text-white transition-colors text-left">
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-4">
            {/* Sign In & Sign Up Buttons */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-5">
                <Link
                  href={userRole === "staff" ? "/admin" : "/dashboard"}
                  className={`font-extrabold text-[12px] uppercase tracking-wider py-2.5 px-5 transition-all duration-300 ${
                    isSticky
                      ? "bg-[#528574] hover:bg-[#436c5e] text-white"
                      : "bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900"
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = "/";
                  }}
                  className={`font-bold text-[12px] uppercase tracking-wider transition-colors cursor-pointer ${
                    isSticky
                      ? "text-neutral-800 hover:text-red-500"
                      : "text-white hover:text-red-400"
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-5">
                <Link
                  href="/login"
                  className={`font-bold text-[12px] uppercase tracking-wider transition-colors ${
                    isSticky
                      ? "text-neutral-800 hover:text-[#528574]"
                      : "text-white hover:text-[#e4c126]"
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className={`font-extrabold text-[12px] uppercase tracking-wider py-2.5 px-5 transition-all duration-300 ${
                    isSticky
                      ? "bg-[#528574] hover:bg-[#436c5e] text-white"
                      : "bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900"
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Icon (Hamburger) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden transition-colors focus:outline-none ${
                isSticky ? "text-neutral-900 hover:text-[#528574]" : "text-white hover:text-[#e4c126]"
              }`}
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6 stroke-current"
                fill="none"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Mobile Menu Drawer - always mounted so GoogleTranslate initialises once */}
      <div
        className={`fixed inset-0 bg-neutral-950/98 z-[999] flex flex-col p-[10px] md:p-8 text-white overflow-y-auto antialiased transition-opacity duration-200 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
          
          {/* Drawer Header */}
          <div className="flex justify-between items-center mb-10 mt-2">
            {/* Logo */}
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center group"
            >
              <div className="relative h-[52px] w-[187px]">
                <Image
                  src="/CapricornLogo.png"
                  alt="Capricorn"
                  fill
                  className="object-contain object-left brightness-0 invert"
                />
              </div>
            </Link>

            {/* Close Trigger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white hover:text-[#e4c126] transition-colors focus:outline-none"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Translator — below logo in mobile drawer */}
          <div className="mb-6">
            <GoogleTranslate elementId="gt-home-mobile" />
          </div>

          {/* Drawer Menu Navigation Links */}
          <nav className="flex flex-col gap-6 text-2xl font-black tracking-wider mb-8">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-[#e4c126] transition-colors"
            >
              HOME
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-[#e4c126] transition-colors"
            >
              ABOUT US
            </Link>
            <Link
              href="/plans"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-[#e4c126] transition-colors"
            >
              INVESTMENT PLANS
            </Link>
            <Link
              href="/projects"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-[#e4c126] transition-colors"
            >
              PROJECTS
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-[#e4c126] transition-colors"
            >
              CONTACT US
            </Link>

            {/* Utility Sub-Nav Items */}
            <div className="border-t border-white/10 pt-4 flex flex-col gap-4 text-base font-bold text-neutral-400">
              <span className="text-[10px] font-extrabold tracking-wider text-neutral-500 uppercase">
                Utility Pages
              </span>
              <Link
                href="/faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-[#e4c126] transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-[#e4c126] transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/terms"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-[#e4c126] transition-colors"
              >
                Terms & Conditions
              </Link>
            </div>
          </nav>

          {/* Drawer Actions */}
          <div className="flex flex-col gap-4 border-t border-white/10 pt-6 mt-auto mb-6">
            {isAuthenticated ? (
              <>
                <Link
                  href={userRole === "staff" ? "/admin" : "/dashboard"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900 py-3.5 font-extrabold uppercase tracking-wider text-sm transition-all"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                    window.location.href = "/";
                  }}
                  className="w-full text-center border border-red-500/30 text-red-400 hover:border-red-500 hover:text-red-300 py-3.5 font-bold uppercase tracking-wider text-sm transition-all cursor-pointer bg-red-950/10 hover:bg-red-950/20"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center border border-white/20 hover:border-[#e4c126] hover:text-[#e4c126] py-3.5 font-bold uppercase tracking-wider text-sm transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900 py-3.5 font-extrabold uppercase tracking-wider text-sm transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

      </div>
    </>
  );
}
