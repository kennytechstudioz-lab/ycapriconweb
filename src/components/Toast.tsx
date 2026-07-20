"use client";

import React, { useEffect } from "react";
import { useToastStore } from "@/store/toastStore";

export default function Toast() {
  const { message, type, hideToast } = useToastStore();

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      hideToast();
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, hideToast]);

  if (!message) return null;

  let indicatorColor = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
  let borderGlow = "border-red-500/30 shadow-[0_4px_30px_rgba(239,68,68,0.1)]";
  if (type === "success") {
    indicatorColor = "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]";
    borderGlow = "border-green-500/30 shadow-[0_4px_30px_rgba(34,197,94,0.1)]";
  } else if (type === "warning") {
    indicatorColor = "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
    borderGlow = "border-amber-500/30 shadow-[0_4px_30px_rgba(245,158,11,0.1)]";
  }

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-toast {
          animation: toastSlideIn 0.3s ease-out forwards;
        }
      `}</style>
      <div className={`fixed bottom-6 right-6 z-[999999] max-w-sm w-[calc(100vw-3rem)] bg-[#0f1115]/95 backdrop-blur-md border ${borderGlow} rounded p-5 flex items-start gap-3.5 animate-toast`}>
        {/* Glow indicator pulse */}
        <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${indicatorColor}`} />
        
        {/* Message body */}
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest">
            {type === "error" ? "System Alert" : type === "warning" ? "Notice" : "Success"}
          </span>
          <p className="text-sm font-semibold text-white/95 leading-relaxed pr-2">
            {message}
          </p>
        </div>

        {/* Interactive close button */}
        <button
          onClick={hideToast}
          className="text-neutral-500 hover:text-white transition-colors cursor-pointer p-0.5 mt-0.5 focus:outline-none"
          aria-label="Dismiss toast"
        >
          <svg className="w-4 h-4 stroke-current stroke-[2.5]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </>
  );
}
