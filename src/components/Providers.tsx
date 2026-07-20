"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Toast from "@/components/Toast";

interface ProvidersProps {
  children: React.ReactNode;
}

function ReferralTracker() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("referredBy", ref.trim());
      console.log(`[Referral Tracker] Stored referrer "${ref}" in localStorage.`);
    }
  }, [searchParams]);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      <Suspense fallback={null}>
        <ReferralTracker />
      </Suspense>
      <Toast />
      {children}
    </>
  );
}

