"use client";

import React, { useEffect, useState } from "react";
import { apiCall } from "@/lib/apiClient";

interface TermSection {
  _id: string;
  category: string;
  content: string;
}

function parseSection(content: string): { heading: string; body: string } {
  const idx = content.indexOf("\n\n");
  if (idx === -1) return { heading: "", body: content };
  return { heading: content.slice(0, idx).trim(), body: content.slice(idx + 2).trim() };
}

export default function PrivacyPolicyPage() {
  const [sections, setSections] = useState<TermSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall<{ success: boolean; terms: TermSection[] }>("/api/terms")
      .then((res) => {
        setSections((res.terms || []).filter((t) => t.category === "policy"));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full bg-white text-neutral-900 font-sans">

      {/* Banner */}
      <section className="relative w-full py-28 md:py-36 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/oil2.jpg')" }}>
        <div className="absolute inset-0 bg-neutral-950/75 z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-[10px] md:px-6 relative z-20 flex flex-col gap-6 items-start mt-10 md:mt-16">
          <span className="text-xs font-extrabold tracking-[0.25em] text-[#e4c126] uppercase block">
            Data Protection
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <div className="border-l-4 border-[#e4c126] pl-6 py-1 max-w-2xl">
            <p className="text-base sm:text-lg md:text-xl font-medium text-white/95 leading-relaxed">
              Your privacy matters to us. Learn how Capricorn Energy Ltd collects, uses, and protects your personal information.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative w-full py-16 md:py-24 bg-[#f8f9fa]">
        <div className="max-w-4xl mx-auto px-[10px] md:px-6">
          <div className="bg-white border border-neutral-200/50 rounded-lg p-8 sm:p-12 shadow-sm flex flex-col gap-10">

            {loading ? (
              <div className="flex items-center gap-3 py-12 justify-center">
                <div className="w-6 h-6 border-2 border-[#528574] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-neutral-400">Loading policy...</span>
              </div>
            ) : sections.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-10">No privacy policy available at this time.</p>
            ) : (
              sections.map((section, i) => {
                const { heading, body } = parseSection(section.content);
                return (
                  <div key={section._id} className="flex flex-col gap-3">
                    <h2 className="text-xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
                      <span className="text-[#528574] flex-shrink-0">{i + 1}.</span>
                      <span>{heading || `Section ${i + 1}`}</span>
                    </h2>
                    <p className="text-sm text-neutral-500 font-light leading-relaxed">{body || section.content}</p>
                  </div>
                );
              })
            )}

          </div>

          <p className="text-center text-xs text-neutral-400 mt-8">
            Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })} &mdash; Capricorn Energy Ltd
          </p>
        </div>
      </section>

    </div>
  );
}
