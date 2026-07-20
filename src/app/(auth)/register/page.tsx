"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { useSettingStore } from "@/store/settingStore";
import { useCurrencyStore } from "@/store/currencyStore";

export default function RegisterPage() {
  const router = useRouter();
  
  // Zustand auth action and loading selectors
  const { registerUser, isLoading: apiLoading } = useUserStore();
  const { setting, fetchSettings } = useSettingStore();
  const { currencies, fetchCurrencies } = useCurrencyStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [walletAddresses, setWalletAddresses] = useState<{ [symbol: string]: string }>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch settings & currencies on load
  useEffect(() => {
    fetchSettings();
    fetchCurrencies();
  }, [fetchSettings, fetchCurrencies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Enforce terms agreement check
    if (!agreeTerms) {
      setValidationError("You must accept the Terms & Conditions and privacy rules to proceed.");
      return;
    }

    // 2. Validate username spacing
    if (username.includes(" ")) {
      setValidationError("Username must not contain any spaces.");
      return;
    }

    // 3. Validate password length
    if (password.length < 4) {
      setValidationError("Password must be at least 4 characters long.");
      return;
    }

    // 4. Confirm password match
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match. Please verify your credentials.");
      return;
    }

    // Build wallets array to submit
    const walletsToSubmit = setting?.showCurrency && currencies.length > 0
      ? currencies.map((curr) => ({
          currencyName: curr.name,
          currencySymbol: curr.symbol,
          walletAddress: walletAddresses[curr.symbol]?.trim() || "",
        }))
      : [];

    // Get referral from localStorage
    const referredBy = typeof window !== "undefined" ? localStorage.getItem("referredBy") || undefined : undefined;

    // 5. Run Zustand register action hitting the backend
    const result = await registerUser(username, email, password, walletsToSubmit, referredBy);

    if (result.success) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("referredBy");
      }
      router.push("/register-success"); // Redirect to custom registration successful screen!
    } else {
      setValidationError(result.error || "An error occurred during portfolio allocation.");
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full ">
      
      {/* Upper Headers */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-white tracking-tight">
          Create Account
        </h2>
        <p className="text-sm text-neutral-400 font-light">
          Open a secured clean-energy investment portal and start receiving daily dividends.
        </p>
      </div>

      {/* Interactive Validation Error Alert Banner */}
      {validationError && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs px-4 py-3 rounded flex items-start gap-2.5 animate-shake">
          <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span className="leading-normal">{validationError}</span>
        </div>
      )}

      {/* Main Register Form */}
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

        {/* Email Field */}
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

        {/* Password Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#16171d] border border-white/10 rounded pl-4 pr-10 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#e4c126] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors focus:outline-none"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? (
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
        </div>

        {/* Dynamic Registration Wallet Onboarding */}
        {setting?.showCurrency && currencies.length > 0 && (
          <div className="flex flex-col gap-4 mt-1 p-4 rounded bg-[#13151c]/70 border border-white/5 animate-fade-in">
            <div className="flex flex-col gap-1 pb-2 border-b border-white/5">
              <span className="text-xs font-black uppercase tracking-wider text-[#e4c126]">Personal Wallet Setup</span>
              <span className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                Add your personal crypto wallet addresses below to receive direct daily dividends. You can optionally fill these out now or configure them later in your dashboard.
              </span>
            </div>

            <div className="flex flex-col gap-3.5 mt-1">
              {currencies.map((curr) => {
                const currId = curr.id || curr._id || "";
                return (
                  <div key={currId} className="flex flex-col gap-1.5 animate-scale-up">
                    <label htmlFor={`wallet-${curr.symbol}`} className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                      {curr.image && (
                        <img src={curr.image} alt={curr.name} className="w-4 h-4 rounded-full object-cover" />
                      )}
                      {curr.name} ({curr.symbol}) Wallet Address
                    </label>
                    <input
                      id={`wallet-${curr.symbol}`}
                      type="text"
                      value={walletAddresses[curr.symbol] || ""}
                      onChange={(e) =>
                        setWalletAddresses({
                          ...walletAddresses,
                          [curr.symbol]: e.target.value,
                        })
                      }
                      placeholder={`Enter your ${curr.symbol} address`}
                      className="w-full bg-[#16171d] border border-white/10 rounded px-4 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126] transition-colors"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Terms Agreement Checkbox */}
        <div className="py-1">
          <label className="flex items-start gap-2.5 text-xs text-neutral-300 hover:text-white cursor-pointer leading-relaxed">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={() => setAgreeTerms(!agreeTerms)}
              className="accent-[#e4c126] mt-0.5 rounded bg-[#16171d] border border-white/10"
            />
            <span>
              I accept Capricorn Energy Ltd&apos;s{" "}
              <Link href="/terms" className="text-[#e4c126] hover:text-[#f1cf34] font-bold transition-colors">
                Terms & Conditions
              </Link>{" "}
              and privacy rules.
            </span>
          </label>
        </div>

        {/* Submit Register Button */}
        <button
          type="submit"
          disabled={apiLoading}
          className="w-full bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900 font-extrabold text-[12px] uppercase tracking-wider py-4 rounded transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {apiLoading ? (
            <>
              {/* Spinner SVG */}
              <svg className="animate-spin h-4 w-4 text-neutral-900" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Allocating Portfolio...</span>
            </>
          ) : (
            <span>CREATE SECURED ACCOUNT</span>
          )}
        </button>

      </form>

      {/* Redirect Footer */}
      <div className="text-center text-xs text-neutral-400 font-light pt-4 border-t border-white/5">
        Already have an account?{" "}
        <Link href="/login" className="text-[#e4c126] hover:text-[#f1cf34] font-bold transition-colors">
          Sign In
        </Link>
      </div>

    </div>
  );
}
