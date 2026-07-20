"use client";

import React from "react";
import Image from "next/image";

interface ProgressItem {
  label: string;
  percentage: number;
}

const progressItems: ProgressItem[] = [
  {
    label: "Cleaner Energy Output",
    percentage: 90,
  },
  {
    label: "Stronger Portfolio Returns",
    percentage: 75,
  },
  {
    label: "Better Capital Efficiency",
    percentage: 82,
  },
];

export default function ValueSection() {
  return (
    <section className="relative w-full bg-[#f3f4f6] text-neutral-900 py-16 md:py-24 overflow-hidden border-t border-neutral-200/30">
      <div className="max-w-7xl mx-auto px-[10px] md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Overlapping Images */}
          <div className="lg:col-span-6 relative p-4 sm:p-8">
            <div className="relative w-full max-w-[500px] mx-auto">
              
              {/* Back / Larger Image (oil2.jpg) */}
              <div className="relative w-[82%] aspect-[4/5] rounded overflow-hidden shadow-md">
                <Image
                  src="/oil2.jpg"
                  alt="Industrial pipeline refinery"
                  fill
                  sizes="(max-width: 1024px) 80vw, 40vw"
                  className="object-cover"
                  priority
                />
              </div>

              {/* Front / Smaller Overlapping Image (aerial.jpg) */}
              <div className="absolute -bottom-4 sm:-bottom-8 right-0 w-[55%] aspect-[1.1/1] border-[8px] border-white shadow-2xl rounded overflow-hidden z-10">
                <Image
                  src="/aerial.jpg"
                  alt="Aerial view of spherical storage tanks in forest"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                  priority
                />
              </div>

            </div>
          </div>

          {/* Right Column: Text & Skills/Progress Bars */}
          <div className="lg:col-span-6 flex flex-col gap-6 ">
            {/* Subtitle */}
            <span className="text-base font-bold tracking-wider text-[#528574] uppercase block">
              Our Value
            </span>

            {/* Main Title */}
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-[1.15]">
              Promoting responsible use of petroleum resources
            </h3>

            {/* Paragraph Description */}
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl">
              At Capricorn Energy Limited, we believe that petroleum resources, when managed with discipline and foresight, can serve as a powerful foundation for sustainable wealth creation. Our operations are guided by strict environmental standards, responsible extraction practices, and a commitment to maximising every barrel's return — for our investors and for the planet. We don't just extract value; we engineer it responsibly, ensuring long-term yield without compromising ecological integrity.
            </p>

            <div className="w-full h-[1px] bg-neutral-300/60 my-2" />

            {/* Progress Bars Grid */}
            <div className="flex flex-col gap-6">
              {progressItems.map((item, index) => (
                <div key={index} className="flex flex-col gap-2">
                  {/* Label and Percentage */}
                  <div className="flex justify-between items-center text-sm font-extrabold text-neutral-900">
                    <span>{item.label}</span>
                    <span className="text-neutral-600">{item.percentage}%</span>
                  </div>

                  {/* Progress Track and Bar */}
                  <div className="w-full h-[6px] bg-neutral-200/80 rounded-full relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-[#e4c126] rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
