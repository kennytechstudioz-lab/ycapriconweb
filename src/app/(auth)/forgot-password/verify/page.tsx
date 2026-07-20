"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/apiClient";

export default function ForgotPasswordVerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("fp_email");
    if (!stored) {
      router.replace("/forgot-password");
      return;
    }
    setEmail(stored);
    inputRefs.current[0]?.focus();
  }, [router]);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) {
      setError("Please enter all 6 digits of your verification code.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      await apiCall("/api/users/forgot-password/verify-otp", {
        method: "POST",
        body: { email, otp },
      });
      // Store OTP for the reset step
      sessionStorage.setItem("fp_otp", otp);
      router.push("/forgot-password/reset");
    } catch (err: any) {
      setError(err.message || "Invalid code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    setResendMsg(null);
    try {
      await apiCall("/api/users/forgot-password", {
        method: "POST",
        body: { email },
      });
      setResendMsg("A new code has been sent to your email.");
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-white tracking-tight">
          Enter Verification Code
        </h2>
        <p className="text-sm text-neutral-400 font-light">
          We sent a 6-digit code to{" "}
          <span className="text-white font-semibold">{email}</span>. Enter it below to continue.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs px-4 py-3 rounded flex items-start gap-2.5">
          <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {resendMsg && (
        <div className="bg-[#142921]/60 border border-[#82b440]/30 text-[#82b440] text-xs px-4 py-3 rounded flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{resendMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* 6-digit OTP input */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Verification Code
          </label>
          <div className="flex gap-3 justify-between" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-2xl font-black text-white bg-[#16171d] border rounded transition-all focus:outline-none ${
                  d ? "border-[#e4c126]" : "border-white/10 focus:border-[#e4c126]/60"
                }`}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || digits.join("").length < 6}
          className="w-full bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900 font-extrabold text-[12px] uppercase tracking-wider py-4 rounded transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-neutral-900" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Verifying...</span>
            </>
          ) : (
            <span>VERIFY CODE</span>
          )}
        </button>

        {/* Resend + back links */}
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {isResending ? "Resending..." : "Resend code"}
          </button>
          <Link href="/forgot-password" className="hover:text-white transition-colors">
            Change email
          </Link>
        </div>

      </form>
    </div>
  );
}
