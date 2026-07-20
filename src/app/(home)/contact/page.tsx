"use client";

import React, { useState, useEffect } from "react";
import { useSettingStore } from "@/store/settingStore";
import { apiCall } from "@/lib/apiClient";

export default function ContactPage() {
  const { setting, fetchSettings } = useSettingStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await apiCall("/api/contact", {
        method: "POST",
        body: { name, email, subject, message },
      });
      setFormSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to send your inquiry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setError(null);
    setFormSubmitted(false);
  };

  const inputCls = "w-full px-4 py-3 bg-white border border-neutral-300/80 rounded focus:outline-none focus:border-[#528574] text-sm text-neutral-900 transition-colors";

  return (
    <div className="w-full bg-white text-neutral-900">

      {/* Banner Header */}
      <section className="relative w-full py-28 md:py-36 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/city.jpg')" }}>
        <div className="absolute inset-0 bg-neutral-950/75 z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-[10px] md:px-6 relative z-20 flex flex-col gap-6 items-start mt-10 md:mt-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
            Contact Us
          </h1>
          <div className="border-l-4 border-[#e4c126] pl-6 py-1 max-w-2xl">
            <p className="text-base sm:text-lg md:text-xl font-medium text-white/95 leading-relaxed">
              Get in touch with our global investment and operations support networks.
            </p>
          </div>
        </div>
      </section>

      {/* Two-Column Block */}
      <section className="relative w-full bg-white py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-[10px] md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* Left: Office details */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <span className="text-[12px] font-extrabold tracking-[0.25em] text-[#528574] uppercase block">
                  Office Info
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-none">
                  Reach Out To Us
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed mt-2">
                  Our dedicated support team is available to assist you with any inquiries regarding our investment packages, platform operations, or partnership opportunities. Reach out to us, and we will get back to you as soon as possible.
                </p>
              </div>

              <div className="flex flex-col gap-6 text-sm text-neutral-800">
                {setting?.address && (
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded bg-[#e4c126] text-black">
                      <svg className="w-5 h-5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </span>
                    <div>
                      <h4 className="font-extrabold text-neutral-900 mb-0.5">Headquarters</h4>
                      <p className="text-neutral-500 font-light">{setting.address}</p>
                    </div>
                  </div>
                )}

                {setting?.phone && (
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded bg-[#e4c126] text-black">
                      <svg className="w-5 h-5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.502-5.127-3.805-6.63-6.63l1.293-.97c.362-.271.528-.733.417-1.173L6.763 3.07a1.091 1.091 0 00-1.091-.852H4.25a2.25 2.25 0 00-2.25 2.25v2.25z" />
                      </svg>
                    </span>
                    <div>
                      <h4 className="font-extrabold text-neutral-900 mb-0.5">Direct Line</h4>
                      <a href={`tel:${setting.phone}`} className="text-neutral-500 font-light hover:text-[#528574] transition-colors">
                        {setting.phone}
                      </a>
                    </div>
                  </div>
                )}

                {setting?.email && (
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded bg-[#e4c126] text-black">
                      <svg className="w-5 h-5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </span>
                    <div>
                      <h4 className="font-extrabold text-neutral-900 mb-0.5">Corporate Email</h4>
                      <a href={`mailto:${setting.email}`} className="text-neutral-500 font-light hover:text-[#528574] transition-colors">
                        {setting.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-7 bg-[#f8f9fa] p-8 md:p-10 rounded border border-neutral-200/50">
              {formSubmitted ? (
                <div className="text-center py-12 flex flex-col items-center gap-4">
                  <span className="w-16 h-16 rounded-full bg-[#528574]/10 text-[#528574] flex items-center justify-center">
                    <svg className="w-8 h-8 fill-none stroke-current stroke-[3]" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <h4 className="text-2xl font-black text-neutral-900">Inquiry Sent Successfully!</h4>
                  <p className="text-sm text-neutral-500 leading-relaxed max-w-sm">
                    Thank you for reaching out to {setting?.companyName || ""}. One of our support managers will contact you shortly.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-4 bg-[#e4c126] hover:bg-neutral-900 hover:text-white text-neutral-900 font-extrabold text-[12px] uppercase tracking-wider py-3.5 px-6 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-extrabold uppercase text-neutral-600 tracking-wider">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputCls}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-extrabold uppercase text-neutral-600 tracking-wider">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold uppercase text-neutral-600 tracking-wider">Subject</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={inputCls}
                      placeholder="Investment inquiry"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold uppercase text-neutral-600 tracking-wider">Your Message</label>
                    <textarea
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={`${inputCls} resize-none`}
                      placeholder="Type your inquiry details here..."
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#e4c126] hover:bg-neutral-900 hover:text-white text-neutral-900 font-extrabold text-[12px] uppercase tracking-wider py-4 px-8 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending Inquiry...
                        </>
                      ) : (
                        "SUBMIT ENQUIRY"
                      )}
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Google Maps Section — only shown when valid embed is saved */}
      <MapSection embed={setting?.mapEmbed || ""} />

    </div>
  );
}

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function extractMapSrc(embed: string): string | null {
  if (!embed.trim()) return null;
  // Must be an iframe tag containing a Google Maps URL
  if (!embed.includes("<iframe") || !embed.includes("google.com/maps")) return null;
  const match = embed.match(/src=["']([^"']+)["']/);
  if (!match) return null;
  return decodeHTMLEntities(match[1]);
}

function MapSection({ embed }: { embed: string }) {
  const src = extractMapSrc(embed);
  if (!src) return null;

  return (
    <section className="w-full bg-white border-t border-neutral-200/40">
      <iframe
        src={src}
        width="100%"
        height="480"
        style={{ border: 0, display: "block" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Company Location Map"
      />
    </section>
  );
}
