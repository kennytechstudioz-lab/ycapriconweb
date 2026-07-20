"use client";

import React from "react";
import ServicesSection from "@/components/home/ServicesSection";
import TestimonialSection from "@/components/home/TestimonialSection";
import InvestmentPlansSection from "@/components/home/InvestmentPlansSection";

export default function PlansPage() {
  return (
    <div className="w-full bg-white text-neutral-900 font-sans">
      
      {/* Premium Banner Header */}
      <section className="relative w-full py-28 md:py-36 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/oil3.jpg')" }}>
        {/* Dark overlay mask */}
        <div className="absolute inset-0 bg-neutral-950/75 z-10 pointer-events-none" />
        
        {/* Banner Content Container */}
        <div className="max-w-7xl mx-auto px-[10px] md:px-6 relative z-20 flex flex-col gap-6 items-start mt-10 md:mt-16 ">
          {/* Main Title Banner */}
          <span className="text-xs font-extrabold tracking-[0.25em] text-[#e4c126] uppercase block">
            Capital Allocations
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
            Investment Plans
          </h1>
          
          {/* Yellow Line call-out badge */}
          <div className="border-l-4 border-[#e4c126] pl-6 py-1 max-w-2xl">
            <p className="text-base sm:text-lg md:text-xl font-medium text-white/95 leading-relaxed">
              Pioneering highly profitable, clean energy investment tranches with daily verified yields.
            </p>
          </div>
        </div>
      </section>

      {/* Core Dynamic Plans Card Grid */}
      <InvestmentPlansSection />

      {/* Testimonial slider section */}
      <TestimonialSection />

      {/* Services support utilities */}
      <ServicesSection />

    </div>
  );
}
