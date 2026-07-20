"use client";

import React, { useEffect, useState } from "react";
import AboutSection from "@/components/home/AboutSection";
import TeamSection from "@/components/home/TeamSection";
import { apiCall } from "@/lib/apiClient";

interface Doc { name: string; url: string; }

function isPdf(url: string) {
  return url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("pdf");
}

export default function AboutPage() {
  const [registrationLink, setRegistrationLink] = useState<string>("");
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [docsLoaded, setDocsLoaded] = useState(false);

  useEffect(() => {
    apiCall<{ success: boolean; setting: any }>("/api/settings")
      .then((res) => {
        if (res.success && res.setting) {
          setRegistrationLink(res.setting.registrationLink || "");
          setDocuments(res.setting.documents || []);
        }
      })
      .catch(() => {})
      .finally(() => setDocsLoaded(true));
  }, []);

  const hasLink = !!registrationLink;
  const hasDocs = documents.length > 0;
  const showSection = docsLoaded && (hasLink || hasDocs);

  return (
    <div className="w-full bg-white text-neutral-900">

      {/* Banner Header */}
      <section className="relative w-full py-28 md:py-36 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/oil1.jpg')" }}>
        <div className="absolute inset-0 bg-neutral-950/75 z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-[10px] md:px-6 relative z-20 flex flex-col gap-6 items-start mt-10 md:mt-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
            About Us
          </h1>
          <div className="border-l-4 border-[#e4c126] pl-6 py-1 max-w-2xl">
            <p className="text-base sm:text-lg md:text-xl font-medium text-white/95 leading-relaxed">
              From the most remote corners of the Earth comes the fuel that makes modern life possible.
            </p>
          </div>
        </div>
      </section>

      <AboutSection hideReadMore />
      <TeamSection />

      {/* Registration & Documents — only shown when data exists */}
      {showSection && (
        <section className="w-full bg-[#f4f5f6] border-t border-neutral-200/40 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-[10px] md:px-6 flex flex-col gap-12">

            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-extrabold tracking-[0.25em] text-[#528574] uppercase">
                Transparency & Compliance
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
                Company Registration & Official Documents
              </h2>
              <p className="text-sm text-neutral-500 max-w-2xl leading-relaxed">
                Capricorn Energy Ltd operates with full regulatory transparency. Below you will find our official company registration record and supporting compliance documents for your review.
              </p>
            </div>

            {/* Registration Link */}
            {hasLink && (
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-500">Company Registration</h3>
                <a
                  href={registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-white border border-neutral-200 rounded p-5 hover:border-[#528574] hover:shadow-md transition-all duration-200 group w-full sm:w-auto"
                >
                  <div className="w-10 h-10 rounded bg-[#528574]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#528574]/20 transition-colors">
                    <svg className="w-5 h-5 text-[#528574]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-neutral-900 group-hover:text-[#528574] transition-colors">View Official Registration Record</span>
                    <span className="text-[11px] text-neutral-400 truncate max-w-xs">{registrationLink}</span>
                  </div>
                </a>
              </div>
            )}

            {/* Documents Grid */}
            {hasDocs && (
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-500">Official Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc, i) => (
                    <a
                      key={i}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 bg-white border border-neutral-200 rounded p-5 hover:border-[#528574] hover:shadow-md transition-all duration-200 group"
                    >
                      {/* Icon */}
                      <div className="w-12 h-12 rounded bg-neutral-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#528574]/10 transition-colors overflow-hidden">
                        {isPdf(doc.url) ? (
                          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        ) : (
                          // Image thumbnail
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={doc.url} alt={doc.name} className="w-full h-full object-cover rounded" />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-extrabold text-neutral-900 group-hover:text-[#528574] transition-colors leading-snug truncate">
                          {doc.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-1">
                          {isPdf(doc.url) ? "PDF Document" : "Image Document"}
                        </span>
                      </div>

                      <svg className="w-4 h-4 text-neutral-300 group-hover:text-[#528574] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>
      )}

    </div>
  );
}
