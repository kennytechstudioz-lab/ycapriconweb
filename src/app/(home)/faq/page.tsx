"use client";

import React, { useEffect, useState } from "react";
import { apiCall } from "@/lib/apiClient";

interface FaqItem {
  _id: string;
  category: string;
  question: string;
  answer: string;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    apiCall<{ success: boolean; faqs: FaqItem[] }>("/api/faqs")
      .then((res) => { if (res.success) setFaqs(res.faqs || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category)))];
  const filtered = activeCategory === "All" ? faqs : faqs.filter((f) => f.category === activeCategory);

  const grouped = filtered.reduce<Record<string, FaqItem[]>>((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <div className="w-full bg-white text-neutral-900 font-sans">

      {/* Banner */}
      <section className="relative w-full py-28 md:py-36 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/oil4.jpg')" }}>
        <div className="absolute inset-0 bg-neutral-950/75 z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-[10px] md:px-6 relative z-20 flex flex-col gap-6 items-start mt-10 md:mt-16">
          <span className="text-xs font-extrabold tracking-[0.25em] text-[#e4c126] uppercase block">Support Center</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">Frequently Asked Questions</h1>
          <div className="border-l-4 border-[#e4c126] pl-6 py-1 max-w-2xl">
            <p className="text-base sm:text-lg md:text-xl font-medium text-white/95 leading-relaxed">
              Find detailed explanations regarding capital lock periods, verified yields, audited reserves, and carbon metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative w-full py-16 md:py-24 bg-[#f8f9fa]">
        <div className="max-w-4xl mx-auto px-[10px] md:px-6">

          {loading ? (
            <div className="py-20 flex flex-col gap-3 items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#528574] border-t-transparent animate-spin" />
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Loading...</span>
            </div>
          ) : faqs.length === 0 ? (
            <p className="text-center text-neutral-400 py-20">No FAQs available yet.</p>
          ) : (
            <>
              {/* Category filter tabs */}
              {categories.length > 2 && (
                <div className="flex flex-wrap gap-2 mb-12">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setOpenId(null); }}
                      className={`px-4 py-2 rounded text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
                        activeCategory === cat
                          ? "bg-[#528574] text-white"
                          : "bg-white text-neutral-600 border border-neutral-200 hover:border-[#528574] hover:text-[#528574]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Grouped FAQ sections */}
              <div className="flex flex-col gap-10">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category} className="flex flex-col gap-4">

                    {/* Category header */}
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-5 bg-[#528574] rounded-full flex-shrink-0" />
                      <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#528574]">{category}</span>
                      <div className="flex-1 h-px bg-neutral-200" />
                      <span className="text-[10px] text-neutral-400 font-bold flex-shrink-0">
                        {items.length} {items.length === 1 ? "question" : "questions"}
                      </span>
                    </div>

                    {/* Accordion items */}
                    <div className="flex flex-col gap-3">
                      {items.map((faq) => {
                        const isOpen = openId === faq._id;
                        return (
                          <div key={faq._id} className="bg-white rounded border border-neutral-200/50 shadow-sm overflow-hidden">
                            <button
                              onClick={() => setOpenId(isOpen ? null : faq._id)}
                              className="w-full px-[10px] md:px-6 py-5 flex items-center justify-between text-left focus:outline-none hover:bg-neutral-50/50 transition-colors cursor-pointer"
                            >
                              <span className="font-extrabold text-sm sm:text-base text-neutral-900 pr-4">{faq.question}</span>
                              <span className="flex-shrink-0 text-[#528574]">
                                {isOpen
                                  ? <svg className="w-5 h-5 stroke-current stroke-[2.5]" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
                                  : <svg className="w-5 h-5 stroke-current stroke-[2.5]" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                }
                              </span>
                            </button>
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[400px] border-t border-neutral-100 opacity-100" : "max-h-0 opacity-0"}`}>
                              <p className="p-6 text-sm text-neutral-500 font-light leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
