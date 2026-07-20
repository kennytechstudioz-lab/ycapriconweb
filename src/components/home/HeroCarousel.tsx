"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBlogStore } from "@/store/blogStore";
import VideoModal from "./VideoModal";

interface HeroSlide {
  _id: string;
  title: string;
  subtitle: string;
  picture: string;
  author: string;
}

export default function HeroCarousel() {
  const { blogs, fetchBlogs } = useBlogStore();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    if (blogs && blogs.length > 0) {
      const heroBlogs = (blogs as any[]).filter(
        (b) => b.category?.toLowerCase() === "hero"
      );
      if (heroBlogs.length > 0) {
        setSlides(heroBlogs);
      }
    }
  }, [blogs]);


  const resetTimer = () => {
    if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    autoplayTimer.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setKey((k) => k + 1);
    }, 6000);
  };

  useEffect(() => {
    if (slides.length < 2) return;
    resetTimer();
    return () => { if (autoplayTimer.current) clearInterval(autoplayTimer.current); };
  }, [slides]);

  const handleTabClick = (index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
    setKey((k) => k + 1);
    resetTimer();
  };

  if (slides.length === 0) return null;

  return (
    <section className="relative w-full min-h-[80vh] overflow-hidden bg-black flex flex-col justify-between">

      {/* Slides Container */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide._id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="absolute inset-0 bg-black/50 z-10" />
                {slide.picture ? (
                  <Image
                    src={slide.picture}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className={`object-cover ${isActive ? "animate-ken-burns" : ""}`}
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-900" />
                )}
              </div>

              {/* Text Overlay */}
              <div className="relative z-20 max-w-7xl mx-auto px-[10px] md:px-12 h-full flex flex-col justify-center">
                <div className="max-w-3xl flex flex-col gap-6 pt-16">
                  <span
                    key={`cat-${key}-${index}`}
                    className="text-[12px] font-extrabold tracking-[0.25em] text-[#e4c126] uppercase animate-slide-up-fade"
                  >
                    INVESTMENT / {slide.author}
                  </span>

                  <h1
                    key={`title-${key}-${index}`}
                    className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] animate-slide-up-fade delay-100"
                  >
                    {slide.title}
                  </h1>

                  <p
                    key={`desc-${key}-${index}`}
                    className="text-base sm:text-lg md:text-xl text-white/80 max-w-xl font-normal leading-relaxed animate-slide-up-fade delay-300"
                  >
                    {slide.subtitle}
                  </p>

                  <div
                    key={`btn-${key}-${index}`}
                    className="pt-4 flex flex-wrap items-center gap-4 animate-slide-up-fade delay-500"
                  >
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900 font-extrabold text-[12px] uppercase tracking-wider py-4 px-[10px] md:px-8 transition-colors"
                    >
                      GET STARTED »
                    </Link>

                    <button
                      onClick={() => setIsVideoOpen(true)}
                      className="inline-flex items-center gap-3 border border-white/40 hover:border-white hover:bg-white/10 text-white font-extrabold text-[12px] uppercase tracking-wider py-4 px-6 md:px-8 transition-all cursor-pointer group"
                    >
                      <span className="flex items-center justify-center w-5 h-5 bg-[#e4c126] text-black rounded-full transition-transform duration-300 group-hover:scale-110">
                        <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                      Watch Video
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Category Tabs Navigation */}
      {slides.length > 1 && (
        <div className="relative z-30 w-full border-t border-white/10 bg-black/20 backdrop-blur-[2px] mt-auto">
          <div className="max-w-7xl mx-auto px-[10px] md:px-6 py-6 md:py-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
            {slides.map((slide, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={slide._id}
                  onClick={() => handleTabClick(index)}
                  className={`flex-col gap-3 text-left focus:outline-none group cursor-pointer relative ${
                    isActive ? "flex" : "hidden md:flex"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-[#e4c126] text-black scale-110"
                          : "border-2 border-white/30 text-white group-hover:border-[#e4c126] group-hover:text-[#e4c126] group-hover:scale-105"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[3]" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </span>

                    <span
                      className={`text-sm md:text-base font-bold tracking-wide transition-colors duration-300 ${
                        isActive ? "text-[#e4c126]" : "text-white/60 group-hover:text-white"
                      }`}
                    >
                      {slide.author}
                    </span>
                  </div>

                  <div className="w-full h-[2px] bg-white/10 relative overflow-hidden rounded">
                    {isActive && (
                      <div
                        key={`progress-${key}`}
                        className="absolute left-0 top-0 h-full bg-[#e4c126] animate-progress-fill"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoSrc="/Capricorn.mp4"
      />
    </section>
  );
}
