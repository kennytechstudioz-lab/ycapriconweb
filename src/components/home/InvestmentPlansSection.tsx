"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiCall } from "@/lib/apiClient";

interface Plan {
  id?: string;
  _id?: string;
  name: string;
  percent: number;
  duration: number;
  min: number;
  max: number;
  referralPercent: number;
  picture?: string;
  benefits: string[];
  description: string;
}

export default function InvestmentPlansSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await apiCall<{ success: boolean; plans: Plan[] }>("/api/plans");
        if (response && response.plans && response.plans.length > 0) {
          setPlans(response.plans);
        } else {
          setPlans([]);
        }
      } catch (err) {
        console.error("Failed to fetch landing plans:", err);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  if (!loading && plans.length === 0) return null;

  return (
    <section className="relative w-full py-16 md:py-24 bg-[#f8f9fa] overflow-hidden">
      <div className="max-w-7xl mx-auto px-[10px] md:px-6">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-16">
          <span className="text-[12px] font-extrabold tracking-[0.25em] text-[#528574] uppercase block">
            Maximize Yields
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-none">
            Choose Your Investment Tranche
          </h2>
          <div className="w-12 h-1 bg-[#e4c126] mt-3" />
          <p className="text-sm text-neutral-500 max-w-2xl leading-relaxed mt-4">
            Select an asset classification tier optimized for your capital yield. All funds are backed by physical oil reserves, grid distributions, and carbon offset units.
          </p>
        </div>

        {/* Dynamic Card Grid */}
        {loading ? (
          <div className="py-20 flex flex-col gap-3 items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#528574] border-t-transparent animate-spin" />
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Hydrating investment board...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, idx) => {
              // Dynamically configure badges based on index tier levels
              let badge = "Starter Tier";
              let badgeBg = "bg-[#528574] text-white";
              if (idx === 1) {
                badge = "Growth Tier";
                badgeBg = "bg-[#e4c126] text-neutral-900";
              } else if (idx >= 2) {
                badge = "Institutional";
                badgeBg = "bg-neutral-950 text-white border border-[#e4c126]/30";
              }

              // Set default S3/local picture based on index fallback
              const imageSource = plan.picture || `/oil${(idx % 3) + 1}.jpg`;

              return (
                <div
                  key={plan.id || plan._id || idx}
                  className="bg-white rounded border border-neutral-200/50 shadow-sm hover:shadow-xl hover:border-[#e4c126]/30 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
                >

                  {/* Upper: Card Photo & Badges */}
                  <div className="relative w-full h-56 overflow-hidden bg-neutral-100 border-b border-neutral-100">
                    <img
                      src={imageSource}
                      alt={plan.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-neutral-900/0 transition-colors duration-500" />

                    <span className={`absolute top-4 right-4 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded shadow-sm ${badgeBg}`}>
                      {badge}
                    </span>

                    {/* First deposit bonus ribbon */}
                    <div className="absolute bottom-0 left-0 right-0 bg-[#e4c126] py-1.5 px-4 flex items-center justify-center gap-2">
                      <svg className="w-3.5 h-3.5 text-neutral-900 fill-current flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                      </svg>
                      <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900">
                        100% Capital Guarantee & Insurance
                      </span>
                      <svg className="w-3.5 h-3.5 text-neutral-900 fill-current flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                      </svg>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between gap-6">

                    {/* Plan Name & Description */}
                    <div className="flex flex-col gap-3">
                      <h3 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                        {plan.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-500 font-light leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Pricing Matrix */}
                    <div className="border-t border-b border-neutral-100 py-4 flex flex-col gap-3">

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-neutral-500 font-medium">Daily ROI</span>
                        <span className="text-lg font-black text-[#528574]">
                          +{plan.percent}% Daily
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-neutral-500 font-medium">Lock Duration</span>
                        <span className="text-sm font-extrabold text-neutral-800">
                          {plan.duration} Days
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-neutral-500 font-medium">Minimum Alloc</span>
                        <span className="text-sm font-extrabold text-neutral-800">
                          ${plan.min.toLocaleString()} USD
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-neutral-500 font-medium">Maximum Alloc</span>
                        <span className="text-sm font-extrabold text-neutral-800">
                          {plan.max === 0 ? "Unlimited" : `$${plan.max.toLocaleString()} USD`}
                        </span>
                      </div>

                    </div>

                    {/* Plan Benefits */}
                    {plan.benefits && plan.benefits.length > 0 && (
                      <div className="flex flex-col gap-3 py-2 border-b border-neutral-100">
                        <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest">
                          Benefits Included
                        </span>
                        <ul className="flex flex-col gap-2">
                          {plan.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-neutral-600 font-medium leading-tight">
                              <svg className="w-3.5 h-3.5 text-[#528574] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Button Action */}
                    <div className="pt-2">
                      <Link
                        href="/dashboard"
                        className="w-full bg-[#e4c126] hover:bg-neutral-900 hover:text-white text-neutral-900 text-center font-extrabold text-[12px] uppercase tracking-wider py-4.5 px-[10px] md:px-6 block transition-all duration-300"
                      >
                        ALLOCATE FUNDS NOW
                      </Link>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
