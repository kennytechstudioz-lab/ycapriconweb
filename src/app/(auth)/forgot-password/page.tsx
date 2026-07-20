"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/apiClient";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    setIsLoading(true);

    try {
      await apiCall("/api/users/forgot-password", {
        method: "POST",
        body: { email },
      });

      // Store email for subsequent steps
      sessionStorage.setItem("fp_email", email);
      router.push("/forgot-password/verify");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">

      {/* Upper Headers */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-white tracking-tight">
          Reset Password
        </h2>
        <p className="text-sm text-neutral-400 font-light">
          Enter your registered email address and we will send you a 6-digit verification code.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs px-4 py-3 rounded flex items-start gap-2.5">
          <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span className="leading-normal">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jason.ramos@example.com"
            className="w-full bg-[#16171d] border border-white/10 rounded px-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#e4c126] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900 font-extrabold text-[12px] uppercase tracking-wider py-4 rounded transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-neutral-900" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Sending Code...</span>
            </>
          ) : (
            <span>SEND VERIFICATION CODE</span>
          )}
        </button>

        <div className="text-center">
          <Link href="/login" className="text-xs text-neutral-400 hover:text-white font-medium transition-colors">
            Cancel and go back
          </Link>
        </div>

      </form>
    </div>
  );
}
