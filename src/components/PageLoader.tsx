"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function PageLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    let removeTimer: NodeJS.Timeout;
    const fadeTimer = setTimeout(() => {
      setFade(true);
      removeTimer = setTimeout(() => setIsVisible(false), 800);
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      if (removeTimer) clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes fallbackFadeOut {
          0% { opacity: 1; pointer-events: auto; }
          85% { opacity: 1; pointer-events: auto; }
          100% { opacity: 0; pointer-events: none; visibility: hidden; }
        }
        .animate-fallback-loader {
          animation: fallbackFadeOut 3.5s forwards ease-in-out;
        }
      `}</style>
      <div
        className={`fixed inset-0 z-[99999] bg-[#0d0e12] flex flex-col items-center justify-center gap-7 transition-all duration-700 ease-in-out animate-fallback-loader ${
          fade ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
      <div className="relative flex flex-col items-center gap-6">

        <div className="relative h-16 w-56 animate-pulse select-none">
          <Image
            src="/CapricornLogo.png"
            alt="Capricorn Energy Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute w-14 h-14 rounded-full border border-neutral-800" />
          <div className="absolute w-14 h-14 rounded-full border-2 border-t-transparent border-r-transparent border-[#e4c126] animate-spin" />
          <div className="absolute w-8 h-8 rounded-full border border-t-transparent border-l-transparent border-[#82b440] animate-spin" />
        </div>

        <div className="flex flex-col gap-1.5 items-center mt-2">
          <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-[0.25em] animate-pulse">
            Securing Clean Energy Future
          </span>
          <span className="text-[9px] text-[#e4c126]/60 font-bold uppercase tracking-wider">
            Verifying Secured Portals...
          </span>
        </div>

      </div>
    </div>
    </>
  );
}
