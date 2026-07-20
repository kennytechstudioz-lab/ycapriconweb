"use client";

import React from "react";
import Link from "next/link";

export default function RegisterSuccessPage() {
  return (
    <div className="flex flex-col items-center text-center gap-8 w-full py-4 animate-fade-in antialiased">
      
      {/* Animated Success Check Icon */}
      <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-[#528574]/20 border border-[#82b440]/30 shadow-lg shadow-[#528574]/10 mb-2">
        <svg className="w-12 h-12 text-[#82b440] stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
        <span className="absolute inset-0 rounded-full border border-[#82b440]/40 animate-ping opacity-25 duration-1000" />
      </div>

      {/* Message Copy */}
      <div className="flex flex-col gap-3">
        <h2 className="text-3xl font-black text-white tracking-tight">
          PORTFOLIO SECURED
        </h2>
        <span className="text-xs font-extrabold tracking-[0.2em] text-[#e4c126] uppercase">
          Registration Successful!
        </span>
        <p className="max-w-md mx-auto text-sm text-neutral-400 font-light leading-relaxed mt-2">
          Your Capricorn Energy Ltd oil & gas allocation keys have been generated. You are now ready to activate your portfolio and start earning physical oil & gas-backed daily dividends.
        </p>
      </div>

      {/* Call to Actions */}
      <div className="w-full flex flex-col gap-4 pt-4 border-t border-white/5 mt-4">
        <Link
          href="/login"
          className="w-full bg-[#82b440] hover:bg-[#729e37] text-neutral-950 font-black text-[12px] uppercase tracking-wider py-4 rounded transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#82b440]/20 cursor-pointer"
        >
          <span>PROCEED TO SIGN IN</span>
          <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

    </div>
  );
}
