"use client";
import React from 'react';

interface WarningToastProps {
  message: string | null;
  type: "success" | "warning";
}

export function WarningToast({ message, type }: WarningToastProps) {
  if (!message) return null;

  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded border shadow-2xl flex items-center gap-3 animate-fade-in ${
      type === "warning" 
        ? "bg-[#13151a] border-red-500/30 text-red-400" 
        : "bg-[#13151a] border-green-500/30 text-green-400"
    }`}>
      <span className={`w-2.5 h-2.5 rounded-full ${type === "warning" ? "bg-red-500" : "bg-green-500"}`} />
      <span className="text-sm font-extrabold tracking-wide uppercase">{message}</span>
    </div>
  );
}
