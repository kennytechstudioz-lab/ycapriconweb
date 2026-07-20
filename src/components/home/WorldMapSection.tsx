"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

interface StatItem {
  target: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { target: 10, suffix: "+", label: "Years of Experience" },
  { target: 13, suffix: "", label: "Offices Worldwide" },
  { target: 17, suffix: "K", label: "Investors Served" },
];

function useCountUp(target: number, triggered: boolean, duration = 1800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!triggered) return;
    let start: number | null = null;
    let frame: number;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [triggered, target, duration]);

  return count;
}

function StatCard({ stat, triggered }: { stat: StatItem; triggered: boolean }) {
  const count = useCountUp(stat.target, triggered);
  return (
    <div
      className="relative p-4 sm:p-5 rounded border border-neutral-200/50 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow group"
      style={{
        background: `repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1.5px, transparent 1.5px, transparent 10px), #ffffff`,
      }}
    >
      <div className="flex flex-col gap-2 relative z-10">
        <span className="text-2xl sm:text-3xl font-black text-[#528574] group-hover:scale-105 transition-transform duration-300 origin-left inline-block tabular-nums">
          {count}{stat.suffix}
        </span>
        <span className="text-[10px] sm:text-xs font-black text-neutral-900 leading-tight">
          {stat.label}
        </span>
      </div>
    </div>
  );
}

export default function WorldMapSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full bg-[#f3f4f6] text-neutral-900 py-16 md:py-24 overflow-hidden border-t border-neutral-200/30">
      <div className="max-w-7xl mx-auto px-[10px] md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Text & Stats Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-[1.15]">
              We Spread Around The World
            </h3>

            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl">
              Capricorn Energy Limited operates globally with offices across North America, South Africa, and Europe — bringing institutional-grade investment opportunities to investors worldwide and continuously expanding our reach into high-growth markets.
            </p>

            {/* Statistics Cards Row */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4">
              {stats.map((stat, index) => (
                <StatCard key={index} stat={stat} triggered={triggered} />
              ))}
            </div>
          </div>

          {/* Right Map Image Column */}
          <div className="lg:col-span-7 relative w-full flex items-center justify-center">
            <div className="relative w-full aspect-[16/9] md:aspect-[1.8/1] rounded overflow-hidden">
              <Image
                src="/map.jpg"
                alt="Global operations map"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
