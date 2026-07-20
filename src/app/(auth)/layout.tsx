"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PATH_IMAGES: Record<string, string> = {
  "/login": "/images/ccus_tech.png",
  "/register": "/images/energy_transition.png",
  "/forgot-password": "/images/sustainability.png",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const bgImage = PATH_IMAGES[pathname] ?? "/images/ccus_tech.png";

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-neutral-950 text-white font-sans antialiased">

      {/* Left Column: Premium Brand Visuals (Desktop only) */}
      <div
        className="hidden lg:flex lg:col-span-7 relative bg-cover bg-center items-center p-16 overflow-hidden"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        {/* Deep dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-neutral-950/80 to-transparent z-10" />

        {/* Floating details and stats grid */}
        <div className="relative z-20 w-full max-w-xl flex flex-col gap-12">
          
          {/* Logo element */}
          <Link href="/" className="flex items-center gap-2 group self-start">
            <svg className="w-9 h-9 text-[#e4c126]" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M12 22C12 22 16.5 17 16.5 12C16.5 7 12 2 12 2C12 2 7.5 7 7.5 12C7.5 17 12 22 12 22Z"
                fill="#82b440"
                fillOpacity="0.85"
              />
              <path
                d="M12 22C12 22 14.5 17.5 14.5 12C14.5 6.5 12 2 12 2"
                stroke="#e4c126"
                strokeWidth="1.5"
              />
            </svg>
            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-[#e4c126] transition-colors">
              capricorn<span className="text-[#82b440]">.</span>
            </span>
          </Link>

          {/* Slogan details */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-extrabold tracking-[0.25em] text-[#e4c126] uppercase">
              Clean Energy Yields
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Securing the future of energy, yield by yield.
            </h1>
            <p className="text-sm text-white/70 leading-relaxed font-light mt-2">
              Join a verified global network of clean energy allocators, funding next-generation carbon capture technology, oil extraction pipelines, and high-efficiency wind reserves.
            </p>
          </div>

          {/* Floating diagnostic metric tranches */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Daily Payouts</span>
              <span className="text-2xl font-black text-[#82b440] mt-1 block">Up to 3.5% Daily</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Capital Backing</span>
              <span className="text-2xl font-black text-[#e4c126] mt-1 block">Physical Assets</span>
            </div>
          </div>

        </div>

        {/* Small branding watermark */}
        <div className="absolute bottom-8 left-16 z-20 text-xs text-white/35 font-light">
          © {new Date().getFullYear()} Capricorn Energy Ltd. All Rights Reserved.
        </div>
      </div>

      {/* Right Column: Portal Forms Content area */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center bg-[#0d0e12] px-[10px] py-8 sm:p-12 lg:p-16 relative">
        
        {/* Top-right helper text */}
        <div className="absolute top-8 right-8 z-20 text-xs">
          <Link href="/" className="text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="w-full max-w-md my-auto relative z-10 py-10">
          {children}
        </div>

      </div>

    </div>
  );
}
