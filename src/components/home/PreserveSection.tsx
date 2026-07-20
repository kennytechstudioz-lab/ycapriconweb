"use client";

import React from "react";

interface CoreValueItem {
  title: string;
  description: string;
}

const coreValues: CoreValueItem[] = [
  {
    title: "Motto",
    description: "Metus montes cras massa venenatis id dignissim suspendisse purus nibh. Mollis sapien facilisis luctus.",
  },
  {
    title: "Vision",
    description: "Metus montes cras massa venenatis id dignissim suspendisse purus nibh. Mollis sapien facilisis luctus.",
  },
  {
    title: "Mission",
    description: "Metus montes cras massa venenatis id dignissim suspendisse purus nibh. Mollis sapien facilisis luctus.",
  },
];

export default function PreserveSection() {
  return (
    <section
      className="relative w-full min-h-[500px] py-16 md:py-24 overflow-hidden text-white bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/city.jpg')",
      }}
    >
      {/* Rich dark overlay */}
      <div className="absolute inset-0 bg-neutral-950/85 z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-[10px] md:px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Preserve Headline & Description */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Subtitle */}
            <span className="text-[12px] font-extrabold tracking-[0.25em] text-[#e4c126] uppercase block">
              Preserve And Conserve
            </span>

            {/* Headline */}
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
              A Vital Energy Resource For A Better Tomorrow
            </h3>

            {/* Paragraph */}
            <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-xl">
              Cubilia scelerisque ultricies at cras tempus phasellus primis habitant. Penatibus pulvinar at vel cursus dignissim sem condimentum molestie. Lobortis hac aenean posuere justo letius laoreet augue.
            </p>

            {/* Discover More Button */}
            <div className="pt-2">
              <a
                href="#"
                className="inline-flex items-center justify-center bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900 font-extrabold text-[12px] uppercase tracking-wider py-4 px-[10px] md:px-8 transition-colors "
              >
                DISCOVER MORE
              </a>
            </div>
          </div>

          {/* Right Column: Motto, Vision, Mission list */}
          <div className="lg:col-span-6 flex flex-col gap-8 md:gap-10">
            {coreValues.map((val, index) => (
              <div key={index} className="flex items-start gap-4 sm:gap-6 group ">
                {/* Yellow Chevron Circle Icon */}
                <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-[#e4c126] hover:bg-[#f1cf34] text-black shadow transition-transform duration-300 group-hover:scale-105">
                  <svg className="w-5 h-5 fill-none stroke-current stroke-[3.5]" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </span>

                {/* Text Content */}
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-lg sm:text-xl font-extrabold tracking-wide">
                    {val.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-md font-light">
                    {val.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
