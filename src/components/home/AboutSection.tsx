"use client";

import React, { useState } from "react";
import Image from "next/image";
import VideoModal from "./VideoModal";

interface AboutSectionProps {
  hideReadMore?: boolean;
}

export default function AboutSection({ hideReadMore = false }: AboutSectionProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className="relative w-full bg-white text-neutral-900 py-16 md:py-24 overflow-hidden">
      {/* Who We Are Section */}
      <div className="max-w-7xl mx-auto px-[10px] md:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Video Preview Block */}
          <div className="lg:col-span-6 relative group">
            {/* Behind-left Diagonal Stripe Pattern block */}
            <div className="absolute -left-6 -top-6 -right-6 -bottom-6 bg-[repeating-linear-gradient(45deg,#f3f4f6,#f3f4f6_1.5px,transparent_1.5px,transparent_10px)] -z-10 rounded-lg opacity-80" />

            <div 
              onClick={() => setIsVideoOpen(true)}
              className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-2xl border border-neutral-100/80 bg-neutral-900 group cursor-pointer"
            >
              {/* Ambient Looping Video Preview */}
              <video
                src="/Capricorn.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle Dark Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-300" />
              
              {/* Centered Glowing Pulsing Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#e4c126] text-black shadow-lg animate-pulse-glow hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Video Badge */}
              <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md text-white font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded border border-white/10">
                Play Showcase
              </div>
            </div>

            {/* Guarantee Text */}
            <div className="mt-8 text-center lg:text-left">
              <h4 className="text-xl sm:text-2xl font-black text-neutral-900 italic tracking-tight">
                &quot;100% Capital Guarantee &amp; Insurance&quot;
              </h4>
            </div>
          </div>

          {/* Right Column: Text / Info Panel */}
          <div className="lg:col-span-6 relative z-10 py-6">
            
            {/* Behind-right Diagonal Stripe Pattern block */}
            <div className="absolute -left-12 -top-12 w-[115%] h-[115%] bg-[repeating-linear-gradient(45deg,#f3f4f6,#f3f4f6_1.5px,transparent_1.5px,transparent_10px)] -z-10 rounded-lg opacity-80" />

            <div className="bg-white/95 backdrop-blur-[2px] p-6 sm:p-10 rounded-lg shadow-sm border border-neutral-100/50">
              {/* Teal Subtitle */}
              <span className="text-base font-bold tracking-wider text-[#528574] uppercase block mb-3">
                Who We Are
              </span>

              {/* Main Title */}
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-[1.15] mb-6">
                Trusted Investment Growth You Can Count On
              </h3>

              {/* Body Description */}
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-8">
                Capricorn Energy Limited is a forward-thinking investment firm dedicated to delivering consistent, high-yield returns to investors worldwide. With a diversified portfolio spanning clean energy, real assets, and structured financial instruments, we have built a proven track record of profitable performance that continues to grow year after year.
              </p>

              {/* Bottom Cards / Lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start mb-8">
                
                {/* No 1 Medal Box */}
                <div className="bg-white border border-neutral-100 p-6 rounded shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                  {/* Medal Icon Square */}
                  <div className="flex items-center justify-center w-12 h-12 bg-[#e4c126] text-black rounded ">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="8" r="5" />
                      <path d="M14.5 12.5L16 21l-4-2.5-4 2.5 1.5-8.5" />
                      <path d="M12 5v6" />
                    </svg>
                  </div>
                  <span className="text-sm font-extrabold text-neutral-900 leading-snug">
                    Consistently Profitable Investor Returns
                  </span>
                </div>

                {/* Benefits List */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2.5">
                    {/* Dark Checkmark Icon */}
                    <span className="flex-shrink-0 text-neutral-900">
                      <svg className="w-4 h-4 stroke-[3.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-neutral-900">
                      Daily dividend payouts to investors
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="flex-shrink-0 text-neutral-900">
                      <svg className="w-4 h-4 stroke-[3.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-neutral-900">
                      Transparent & secured portfolio management
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="flex-shrink-0 text-neutral-900">
                      <svg className="w-4 h-4 stroke-[3.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-neutral-900">
                      Diversified high-yield investment plans
                    </span>
                  </div>
                </div>
              </div>

              {/* READ MORE CTA button */}
              {!hideReadMore && (
                <div className="pt-2">
                  <a
                    href="/about"
                    className="inline-flex items-center justify-center bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900 font-extrabold text-[12px] uppercase tracking-wider py-3.5 px-[10px] md:px-8 transition-colors"
                  >
                    READ MORE
                  </a>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoSrc="/Capricorn.mp4"
      />
    </section>
  );
}

