"use client";

import React, { useState } from "react";

interface ServiceItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function ServicesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0); // Default to highlight the first card as active

  const services: ServiceItem[] = [
    {
      title: "Portfolio Management",
      description: "Professionally managed, diversified investment portfolios designed to maximize returns while maintaining robust capital protection across all market conditions.",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 16l4-6 4 4 4-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Daily Dividend Payouts",
      description: "Earn consistent daily returns credited directly to your account with full transparency, reliable processing, and zero hidden fees on every cycle.",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M8 2v4M16 2v4M3 10h18" strokeLinecap="round" />
          <path d="M12 14v3M10.5 15.5h3" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Clean Energy Assets",
      description: "Invest in the future through solar farms, wind fields, and battery storage infrastructure — high-yield assets accelerating the global energy transition.",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Referral Bonus Program",
      description: "Grow your earnings by referring new investors to the platform. Earn a percentage bonus on every active deposit your referred members make.",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="9" cy="7" r="3" />
          <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeLinecap="round" />
          <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Secured Asset Allocation",
      description: "Your capital is allocated across institutional-grade, secured investment instruments with rigorous risk management and independent fund oversight.",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l7 4v6c0 5-3.5 9-7 10C8.5 21 5 17 5 12V6l7-4z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Real-Time Yield Tracking",
      description: "Monitor your portfolio performance, dividend accumulation, and deposit history in real time through your secure personalised investor dashboard.",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 12h2l3-7 4 14 3-10 2 3h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative w-full bg-white text-neutral-900 py-16 md:py-24 overflow-hidden border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-[10px] md:px-6">
        
        {/* Section Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-16 ">
          {/* Left Title block */}
          <div className="lg:col-span-6">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-[1.15] max-w-lg">
              Smarter Investing, Stronger Returns
            </h3>
          </div>

          {/* Right Sub-text block */}
          <div className="lg:col-span-6 pt-2 lg:pt-4">
            <p className="text-sm sm:text-base text-neutral-500 leading-relaxed max-w-xl">
              Capricorn Energy Limited provides a comprehensive suite of structured investment services built to grow your wealth steadily. From diversified portfolio management to daily dividend payouts, we deliver transparent, high-yield solutions tailored to every investor.
            </p>
          </div>
        </div>

        {/* 3x2 Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const isActive = index === hoveredIndex;
            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative p-8 rounded transition-all duration-300 flex flex-col gap-6 cursor-pointer border ${
                  isActive
                    ? "bg-[#528574] text-white border-[#528574] shadow-lg scale-[1.02]"
                    : "bg-[#f3f4f6] text-neutral-900 border-neutral-200/50 hover:shadow-md"
                }`}
              >
                
                {/* Top Corner Arrow Button */}
                <div
                  className={`absolute -top-3 -right-3 w-10 h-10 bg-[#e4c126] text-neutral-900 flex items-center justify-center shadow-md transition-transform duration-300 ${
                    isActive ? "scale-110 rotate-45" : "group-hover:scale-105"
                  }`}
                >
                  {/* Up-Right Arrow Icon */}
                  <svg className="w-4 h-4 fill-none stroke-current stroke-[3]" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </div>

                {/* Left Top Dashed Icon Badge */}
                <div
                  className={`w-14 h-14 rounded border border-dashed flex items-center justify-center ${
                    isActive ? "border-white/40 text-[#e4c126]" : "border-neutral-300 text-[#528574]"
                  }`}
                >
                  {service.icon}
                </div>

                {/* Card Title */}
                <h4 className="text-xl font-extrabold tracking-tight">
                  {service.title}
                </h4>

                {/* Description Text */}
                <p
                  className={`text-sm leading-relaxed ${
                    isActive ? "text-white/85" : "text-neutral-500"
                  }`}
                >
                  {service.description}
                </p>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
