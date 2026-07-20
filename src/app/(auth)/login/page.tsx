"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Basic validation
    if (!username || !password) {
      setValidationError("Please enter both your username and password.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. Trigger Client Auth Store login
      const result = await login(username, password);

      setIsLoading(false);

      if (!result.success) {
        setValidationError(result.error || "Authentication failed.");
      } else if (result.requires2FA) {
        // Store username for the 2FA page to read
        sessionStorage.setItem("2fa_username", result.username || username);
        router.push("/two-factor");
      } else {
        // Fetch session from store to determine user role
        const user = useAuthStore.getState().user;
        const userRole = user?.role;

        if (userRole === "staff") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      setValidationError("An unexpected error occurred during sign in. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full ">
      
      {/* Upper Headers */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-white tracking-tight">
          Welcome Back
        </h2>
        <p className="text-sm text-neutral-400 font-light">
          Enter your allocation credentials to access your secure portfolio dashboard.
        </p>
      </div>

      {/* Shake-animated red validation alert box */}
      {validationError && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs px-4 py-3 rounded flex items-start gap-2.5 animate-shake antialiased">
          <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span className="leading-normal">{validationError}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* Username Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Username
          </label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="jason_ramos"
            className="w-full bg-[#16171d] border border-white/10 rounded px-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#e4c126] transition-colors"
          />
        </div>

        {/* Password Field with Toggle */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Secure Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#16171d] border border-white/10 rounded pl-4 pr-10 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#e4c126] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors focus:outline-none"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Utility Bar: Remember me & Forgot Password */}
        <div className="flex items-center justify-between text-xs py-1">
          <label className="flex items-center gap-2 text-neutral-300 hover:text-white cursor-pointer ">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="accent-[#e4c126] rounded bg-[#16171d] border border-white/10"
            />
            <span>Remember device</span>
          </label>

          <Link href="/forgot-password" className="text-[#e4c126] hover:text-[#f1cf34] font-medium transition-colors">
            Forgot Password?
          </Link>
        </div>

        {/* Submit Portal Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900 font-extrabold text-[12px] uppercase tracking-wider py-4 rounded transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              {/* Spinner SVG */}
              <svg className="animate-spin h-4 w-4 text-neutral-900" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Verifying Telemetry...</span>
            </>
          ) : (
            <span>SECURE SIGN IN</span>
          )}
        </button>

      </form>

      {/* Redirect Footer */}
      <div className="text-center text-xs text-neutral-400 font-light pt-4 border-t border-white/5">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#e4c126] hover:text-[#f1cf34] font-bold transition-colors">
          Create Account
        </Link>
      </div>

    </div>
  );
}
