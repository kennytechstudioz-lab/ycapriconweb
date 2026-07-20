"use client";

import React, { useEffect, useState, useRef } from "react";

interface DonutChartProps {
  percentage: number;
  label: string;
  description: string;
  inView: boolean;
}

function DonutChart({ percentage, label, description, inView }: DonutChartProps) {
  const [count, setCount] = useState(0);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (inView && !animated) {
      setAnimated(true);
      let startTime: number | null = null;
      const duration = 1500; // 1.5 seconds animation duration

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Easing function: easeOutQuad
        const easeProgress = progress * (2 - progress);
        const currentCount = Math.floor(easeProgress * percentage);
        
        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(percentage);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [inView, percentage, animated]);

  const radius = 30;
  const circumference = 2 * Math.PI * radius; // 188.495
  const strokeDashoffset = animated ? circumference - (circumference * percentage) / 100 : circumference;

  return (
    <div className="flex items-center gap-5 p-6 md:p-8 ">
      {/* Donut Chart SVG */}
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          {/* Background Track */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-neutral-700/60"
            strokeWidth="6.5"
            fill="transparent"
          />
          {/* Animated Accent Yellow Stroke */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-[#e4c126] transition-all duration-[1500ms] ease-out"
            strokeWidth="6.5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Centered text display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-black text-white tracking-tight">{count}%</span>
        </div>
      </div>

      {/* Title & Description Block */}
      <div className="flex flex-col gap-1">
        <h4 className="text-lg font-black text-white tracking-wide">
          {label}
        </h4>
        <p className="text-xs text-white/60 leading-relaxed max-w-[200px] font-light">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function SolutionsSection() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // Animate charts once when first viewed
        }
      },
      { threshold: 0.15 } // Trigger when 15% of section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[500px] py-16 md:py-24 overflow-hidden text-white bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/reactor.jpg')",
      }}
    >
      {/* Dark overlay backdrop */}
      <div className="absolute inset-0 bg-neutral-950/85 z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-[10px] md:px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Heading, Subtitle & Button */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Subtitle */}
            <span className="text-[12px] font-extrabold tracking-[0.25em] text-[#e4c126] uppercase block">
              Let's Be Great Together
            </span>

            {/* Headline */}
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
              Powerful solutions for a sustainable future
            </h3>

            {/* Paragraph copy */}
            <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-xl">
              Capricorn Energy Limited brings institutional-grade investment infrastructure to individual and corporate investors worldwide. Our integrated approach combines high-efficiency refining, disciplined crude production, and proven project management — delivering consistent returns backed by real, tangible energy assets.
            </p>

            {/* Discover More CTA Button */}
            <div className="pt-2">
              <a
                href="#"
                className="inline-flex items-center justify-center bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900 font-extrabold text-[12px] uppercase tracking-wider py-4 px-[10px] md:px-8 transition-colors "
              >
                DISCOVER MORE
              </a>
            </div>
          </div>

          {/* Right Column: 2x2 Grid of Dotted Dividers & Donut Charts */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-0 relative">
            
            {/* Donut Chart 1 (Refining Capacity) */}
            <div className="border-b border-white/10 sm:border-r">
              <DonutChart
                percentage={75}
                label="Refining Capacity"
                description="Our refineries operate at peak throughput, converting crude reserves into high-value energy products with minimal waste."
                inView={inView}
              />
            </div>

            {/* Donut Chart 2 (Crude Oil Production) */}
            <div className="border-b border-white/10">
              <DonutChart
                percentage={87}
                label="Crude Oil Production"
                description="Above-industry-average extraction rates sustained through advanced drilling technology and field optimisation."
                inView={inView}
              />
            </div>

            {/* Donut Chart 3 (Satisfied Clients) */}
            <div className="border-b border-white/10 sm:border-b-0 sm:border-r">
              <DonutChart
                percentage={95}
                label="Satisfied Clients"
                description="A 95% investor satisfaction rate built on transparent reporting, timely payouts, and dedicated account support."
                inView={inView}
              />
            </div>

            {/* Donut Chart 4 (Projects Successful) */}
            <div>
              <DonutChart
                percentage={92}
                label="Projects Successful"
                description="92 in every 100 capital projects we manage are delivered on time, within budget, and at target yield."
                inView={inView}
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
