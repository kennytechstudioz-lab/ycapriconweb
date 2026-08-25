"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSettingStore } from "@/store/settingStore";

interface StrategicPillar {
  id: string;
  badge: string;
  title: string;
  shortDesc: string;
  heading: string;
  description: string;
  image: string;
  highlights: string[];
  metric: { value: string; label: string };
}

const pillars: StrategicPillar[] = [
  {
    id: "infrastructure",
    badge: "01. Core Operations",
    title: "Energy Infrastructure",
    shortDesc: "Refining, extraction & terminal pipelines",
    heading: "Institutional-Grade Energy Infrastructure",
    description:
      "We own and operate mission-critical energy assets spanning oil refining, strategic storage facilities, and high-efficiency crude extraction fields. This physical asset foundation delivers dependable, steady revenue streams across all commodity cycles.",
    image: "/oil3.jpg",
    highlights: [
      "Modern high-throughput refining plants with 98.4% operational uptime",
      "Strategic crude storage reserves buffering market price volatility",
      "Direct pipeline logistics reducing intermediary costs and maximizing margins",
      "Full supply chain integration from field extraction to global distribution",
    ],
    metric: { value: "$1.8B+", label: "Physical Infrastructure Asset Base" },
  },
  {
    id: "transition",
    badge: "02. Sustainability",
    title: "Clean Transition & ESG",
    shortDesc: "Renewable power & carbon capture technology",
    heading: "Pioneering the Next-Generation Clean Energy Transition",
    description:
      "Bridging the bridge to a cleaner tomorrow, our capital allocation integrates sustainable energy grids, utility-scale solar arrays, wind infrastructure, and advanced Carbon Capture, Utilization & Storage (CCUS) solutions.",
    image: "/images/energy_transition.png",
    highlights: [
      "Over 450 MW of clean solar and wind capacity actively deployed",
      "Cutting-edge carbon capture and sequestration reducing industrial footprints",
      "ESG-compliant green bonds generating eco-positive dividend yields",
      "Hybrid energy systems powering remote facilities with zero waste",
    ],
    metric: { value: "450+ MW", label: "Clean Power Output Under Management" },
  },
  {
    id: "security",
    badge: "03. Risk Management",
    title: "Capital Protection",
    shortDesc: "Reserve guarantees & segregated asset custody",
    heading: "Uncompromising Risk Mitigation & Capital Safeguards",
    description:
      "Every investment tier is shielded by comprehensive capital preservation mechanisms. We maintain dedicated liquidity reserve funds and tier-1 institutional custodial vaults to ensure investor principal security under any market condition.",
    image: "/aerial.jpg",
    highlights: [
      "Multi-tiered capital reserve buffer backing 100% of investor allocations",
      "Segregated client accounts preventing operational cross-collateralization",
      "Continuous algorithmic risk monitoring and dynamic hedging strategies",
      "Full regulatory transparency with verified international audit reports",
    ],
    metric: { value: "100%", label: "Capital Allocation Backing Guarantee" },
  },
  {
    id: "technology",
    badge: "04. Investor Experience",
    title: "FinTech Yield Engine",
    shortDesc: "Instant automated daily payouts & 24/7 access",
    heading: "Automated Daily Payout Engine & Real-Time Portfolio Intelligence",
    description:
      "Our proprietary wealth platform empowers investors with automated daily dividend calculations, frictionless zero-fee deposits and withdrawals, and real-time asset tracking accessible anywhere on any device.",
    image: "/reactor.jpg",
    highlights: [
      "Algorithmic daily dividend calculation credited precisely every 24 hours",
      "Frictionless multi-currency deposit and swift automated withdrawal settlement",
      "Comprehensive live analytics and downloadable yield breakdown reports",
      "Dedicated 24/7 multilingual institutional support and account management",
    ],
    metric: { value: "99.85%", label: "Historical On-Time Payout Execution Rate" },
  },
];

const keyMetrics = [
  {
    number: "$2.4B+",
    label: "Total Asset Value Managed",
    detail: "Across physical & clean energy projects",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: "99.85%",
    label: "On-Time Dividend Payout Rate",
    detail: "Unbroken daily yield distribution record",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: "140+",
    label: "Active Global Projects",
    detail: "Spanning energy, refining & green tech",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    number: "45+",
    label: "Global Jurisdictions",
    detail: "Serving private and corporate partners",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const valuePropositions = [
  {
    tag: "Security First",
    title: "Tangible Asset Collateral",
    description:
      "Unlike speculative equities or unbacked instruments, your capital is tied directly to physical, high-demand energy infrastructure, strategic reserves, and real-world cash flows.",
    icon: (
      <svg className="w-7 h-7 text-[#528574]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    tag: "Predictable Yield",
    title: "Daily Dividend Engine",
    description:
      "Enjoy transparent liquidity without confusing vesting locks. Daily earnings are credited straight to your dashboard every 24 hours, ready for compounding or immediate withdrawal.",
    icon: (
      <svg className="w-7 h-7 text-[#528574]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    tag: "Governance",
    title: "Strict Compliance & Audits",
    description:
      "We operate under rigorous international regulatory standards, holding certified licenses and conducting periodic independent audits for complete investor peace of mind.",
    icon: (
      <svg className="w-7 h-7 text-[#528574]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
];

export default function CompanyOverviewSection() {
  const { setting } = useSettingStore();
  const companyName = setting?.companyName || "Capricorn Energy";
  const [activePillarId, setActivePillarId] = useState<string>("infrastructure");

  const activePillar = pillars.find((p) => p.id === activePillarId) || pillars[0];

  return (
    <section className="relative w-full bg-[#f4f5f6] text-neutral-900 py-16 md:py-24 overflow-hidden border-t border-neutral-200/50">
      
      {/* Subtle geometric dot grid background texture */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none -z-10 bg-[radial-gradient(#528574_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

      <div className="max-w-7xl mx-auto px-[10px] md:px-6">

        {/* Section Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-14">
          
          {/* Left Title Block */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#528574]/10 text-[#528574] rounded-full text-[11px] font-extrabold tracking-[0.2em] uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-[#528574] animate-pulse" />
              Corporate Leadership &amp; Strength
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-[1.15]">
              Engineering Sustainable Wealth Through Energy Excellence
            </h2>
          </div>

          {/* Right Description & Action */}
          <div className="lg:col-span-6 flex flex-col gap-6 pt-1 lg:pt-6">
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              At <strong className="text-neutral-900 font-bold">{companyName}</strong>, we transform institutional energy infrastructure into dependable, high-yield wealth generation. By pairing high-efficiency hydrocarbon refining with next-generation renewables and algorithmic capital management, we deliver proven, transparent returns to our global investor community.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/about"
                className="inline-flex items-center justify-center bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900 font-extrabold text-[12px] uppercase tracking-wider py-3.5 px-7 transition-all duration-200 shadow-sm hover:shadow"
              >
                DISCOVER OUR STORY
              </Link>
              <Link
                href="/plans"
                className="inline-flex items-center justify-center border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white text-neutral-900 font-extrabold text-[12px] uppercase tracking-wider py-3.5 px-7 transition-all duration-200"
              >
                VIEW INVESTMENT PLANS
              </Link>
            </div>
          </div>
        </div>

        {/* Key Metrics / Highlights Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
          {keyMetrics.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg border border-neutral-200/70 shadow-sm hover:shadow-md hover:border-[#528574]/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#528574]/10 text-[#528574] group-hover:bg-[#528574] group-hover:text-white transition-colors duration-300 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                  Verified
                </span>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight mb-1 group-hover:text-[#528574] transition-colors">
                  {item.number}
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-neutral-800 mb-1">
                  {item.label}
                </h4>
                <p className="text-[11px] text-neutral-500 font-medium">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive 4-Pillar Strategic Explorer */}
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-md p-6 sm:p-8 md:p-10 mb-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-neutral-100">
            <div>
              <span className="text-xs font-extrabold tracking-[0.2em] text-[#528574] uppercase block mb-1">
                Strategic Foundation
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                Our Four Pillars of Institutional Strength
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md font-medium">
              Explore the strategic verticals that power steady capital preservation and maximized daily returns.
            </p>
          </div>

          {/* Tab Selection Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {pillars.map((pillar) => {
              const isActive = pillar.id === activePillarId;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillarId(pillar.id)}
                  type="button"
                  className={`text-left p-4 rounded-lg transition-all duration-200 flex flex-col justify-between border cursor-pointer ${
                    isActive
                      ? "bg-[#528574] text-white border-[#528574] shadow-md shadow-[#528574]/20 scale-[1.01]"
                      : "bg-[#f8f9fa] text-neutral-800 border-neutral-200/60 hover:bg-neutral-100/80 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        isActive ? "text-[#e4c126]" : "text-[#528574]"
                      }`}
                    >
                      {pillar.badge}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? "bg-[#e4c126]" : "bg-neutral-300"
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold tracking-tight mb-1 leading-snug">
                      {pillar.title}
                    </h4>
                    <p
                      className={`text-[11px] line-clamp-1 ${
                        isActive ? "text-white/80" : "text-neutral-500"
                      }`}
                    >
                      {pillar.shortDesc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Tab Showcase Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-[#fbfcfc] rounded-lg p-6 sm:p-8 border border-neutral-200/50">
            
            {/* Visual Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-lg border border-neutral-200/60 bg-neutral-900 group">
                <Image
                  src={activePillar.image}
                  alt={activePillar.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Metric Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded border border-white/20 shadow-md flex items-center justify-between">
                  <div>
                    <div className="text-xl font-black text-neutral-900 tracking-tight">
                      {activePillar.metric.value}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      {activePillar.metric.label}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#528574] text-white flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#528574]">
                <span>{activePillar.badge}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#e4c126]" />
                <span>Verified Strategic Pillar</span>
              </div>

              <h4 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-tight">
                {activePillar.heading}
              </h4>

              <p className="text-sm text-neutral-600 leading-relaxed">
                {activePillar.description}
              </p>

              {/* Bullet list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {activePillar.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-white p-3 rounded border border-neutral-200/50">
                    <span className="w-5 h-5 rounded-full bg-[#e4c126] text-neutral-950 flex items-center justify-center flex-shrink-0 text-[11px] font-black mt-0.5">
                      ✓
                    </span>
                    <span className="text-xs font-bold text-neutral-800 leading-snug">
                      {h}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/plans"
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-[#528574] hover:text-neutral-900 transition-colors uppercase tracking-wider group"
                >
                  <span>Participate in this portfolio</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* 3 Value Propositions Cards */}
        <div className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[12px] font-extrabold tracking-[0.25em] text-[#528574] uppercase block mb-2">
              The Investor Advantage
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
              Why Investors Worldwide Trust {companyName}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {valuePropositions.map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-7 border border-neutral-200/70 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-lg bg-[#528574]/10 flex items-center justify-center group-hover:bg-[#e4c126] transition-colors duration-300">
                      {card.icon}
                    </div>
                    <span className="text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 bg-neutral-100 rounded text-neutral-600">
                      {card.tag}
                    </span>
                  </div>

                  <h4 className="text-lg font-extrabold text-neutral-900 mb-3 group-hover:text-[#528574] transition-colors">
                    {card.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-normal">
                    {card.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#528574] uppercase tracking-wider">
                    Institutional Standard
                  </span>
                  <svg className="w-4 h-4 text-neutral-400 group-hover:text-[#528574] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Commitment CTA Banner */}
        <div className="relative rounded-xl overflow-hidden bg-neutral-900 text-white p-8 sm:p-10 md:p-12 shadow-xl border border-neutral-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#528574]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#e4c126]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 flex flex-col gap-3">
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#e4c126]">
                Secure Your Financial Future
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
                Ready to Partner With a Proven Global Energy Enterprise?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl font-light">
                Join thousands of individual and corporate investors earning automated daily dividend payouts backed by verifiable energy and infrastructure assets.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3.5 lg:items-end justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900 font-extrabold text-[12px] uppercase tracking-wider py-4 px-8 rounded transition-all duration-200 text-center shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                OPEN INVESTOR ACCOUNT
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/20 font-extrabold text-[12px] uppercase tracking-wider py-3.5 px-8 rounded transition-all duration-200 text-center w-full sm:w-auto"
              >
                VIEW CORPORATE CREDENTIALS
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
