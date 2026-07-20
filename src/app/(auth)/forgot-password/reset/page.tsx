"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/apiClient";

export default function ForgotPasswordResetPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("fp_email");
    const storedOtp = sessionStorage.getItem("fp_otp");
    if (!storedEmail || !storedOtp) {
      router.replace("/forgot-password");
      return;
    }
    setEmail(storedEmail);
    setOtp(storedOtp);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await apiCall("/api/users/forgot-password/reset", {
        method: "POST",
        body: { email, otp, newPassword },
      });

      // Clean up session storage
      sessionStorage.removeItem("fp_email");
      sessionStorage.removeItem("fp_otp");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col gap-8 w-full">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black text-white tracking-tight">Password Updated</h2>
          <p className="text-sm text-neutral-400 font-light">Your password has been successfully reset.</p>
        </div>
        <div className="bg-[#142921]/60 border border-[#82b440]/30 p-6 rounded flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#82b440]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-bold text-white">Reset Successful</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed font-light">
            Your account password has been updated. You can now sign in with your new credentials.
          </p>
          <Link
            href="/login"
            className="w-full bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900 text-center font-extrabold text-[11px] uppercase tracking-wider py-3 rounded block transition-colors"
          >
            SIGN IN NOW
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-white tracking-tight">
          Set New Password
        </h2>
        <p className="text-sm text-neutral-400 font-light">
          Create a strong new password for your Capricorn Energy Ltd account.
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* New Password */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#16171d] border border-white/10 rounded pl-4 pr-10 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#e4c126] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
            >
              {showNew ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className={`w-full bg-[#16171d] border rounded pl-4 pr-10 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                confirmPassword && confirmPassword !== newPassword
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-white/10 focus:border-[#e4c126]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
            >
              {showConfirm ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          {confirmPassword && confirmPassword !== newPassword && (
            <p className="text-[11px] text-red-400 font-medium">Passwords do not match.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !newPassword || !confirmPassword}
          className="w-full bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900 font-extrabold text-[12px] uppercase tracking-wider py-4 rounded transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-neutral-900" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Updating Password...</span>
            </>
          ) : (
            <span>RESET PASSWORD</span>
          )}
        </button>

        <div className="text-center">
          <Link href="/forgot-password" className="text-xs text-neutral-400 hover:text-white font-medium transition-colors">
            Start over
          </Link>
        </div>

      </form>
    </div>
  );
}
