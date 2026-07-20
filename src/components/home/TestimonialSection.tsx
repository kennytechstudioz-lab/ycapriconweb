"use client";

import { useState, useEffect, useRef } from "react";
import { apiCall } from "@/lib/apiClient";

interface Review {
  _id: string;
  fullName: string;
  content: string;
  rating: number;
  country?: string;
  countryFlag?: string;
  userPicture?: string;
}

function FlagDisplay({ flag, country }: { flag?: string; country?: string }) {
  if (!flag) return null;
  if (flag.startsWith("http")) {
    return <img src={flag} alt={country || ""} className="w-5 h-4 object-cover rounded-sm flex-shrink-0" />;
  }
  return <span className="text-base">{flag}</span>;
}

export default function TestimonialSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [slidesToShow, setSlidesToShow] = useState(3);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    apiCall<{ success: boolean; reviews: Review[] }>("/api/reviews")
      .then((res) => {
        if (res.success && res.reviews?.length) {
          setReviews(res.reviews);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) setSlidesToShow(1);
      else if (window.innerWidth < 1024) setSlidesToShow(2);
      else setSlidesToShow(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const extended = reviews.length >= 3
    ? [...reviews.slice(-3), ...reviews, ...reviews.slice(0, 3)]
    : reviews;

  const handleNext = () => { if (isTransitioning) setCurrentIndex((p) => p + 1); };
  const handlePrev = () => { if (isTransitioning) setCurrentIndex((p) => p - 1); };

  useEffect(() => {
    if (!extended.length) return;
    if (currentIndex === extended.length - 3) {
      const t = setTimeout(() => { setIsTransitioning(false); setCurrentIndex(3); }, 500);
      return () => clearTimeout(t);
    }
    if (currentIndex === 2) {
      const t = setTimeout(() => { setIsTransitioning(false); setCurrentIndex(extended.length - 7); }, 500);
      return () => clearTimeout(t);
    }
  }, [currentIndex, extended.length]);

  useEffect(() => {
    if (!isTransitioning) {
      const t = setTimeout(() => setIsTransitioning(true), 50);
      return () => clearTimeout(t);
    }
  }, [isTransitioning]);

  useEffect(() => {
    if (reviews.length < 2) return;
    autoplayRef.current = setInterval(handleNext, 4500);
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [isTransitioning, reviews.length]);

  if (isLoading) return null;
  if (!reviews.length) return null;

  return (
    <section
      className="relative w-full py-20 md:py-28 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/city.jpg')" }}
    >
      <div className="absolute inset-0 bg-neutral-950/85 z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-[10px] md:px-6 relative z-20">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-16">
          <div className="flex flex-col gap-3">
            <span className="text-[12px] font-extrabold tracking-[0.25em] text-[#e4c126] uppercase block">
              Investor Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
              What Our Global Clients Say
            </h2>
            <p className="text-sm text-white/60 max-w-xl leading-relaxed mt-1">
              Read verified testimonials from capital allocators, retail investors, and corporate funds who partner with us.
            </p>
          </div>

          {reviews.length > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="w-12 h-12 rounded-full border border-white/20 hover:border-[#e4c126] hover:bg-[#e4c126] text-white hover:text-neutral-950 flex items-center justify-center transition-all duration-300 focus:outline-none"
                aria-label="Previous"
              >
                <svg className="w-5 h-5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="w-12 h-12 rounded-full border border-white/20 hover:border-[#e4c126] hover:bg-[#e4c126] text-white hover:text-neutral-950 flex items-center justify-center transition-all duration-300 focus:outline-none"
                aria-label="Next"
              >
                <svg className="w-5 h-5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="overflow-hidden w-full">
          <div
            className={`flex -mx-3 ${isTransitioning ? "transition-transform duration-500 ease-in-out" : ""}`}
            style={{
              transform: reviews.length >= 3
                ? `translateX(-${currentIndex * (100 / slidesToShow)}%)`
                : undefined,
            }}
          >
            {(reviews.length >= 3 ? extended : reviews).map((item, index) => (
              <div
                key={`${item._id}-${index}`}
                className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3"
              >
                <div className="bg-neutral-900/60 border border-white/10 px-[10px] py-6 md:p-8 rounded-lg flex flex-col justify-between h-full min-h-[280px] gap-6 backdrop-blur-sm shadow-md">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1 text-[#e4c126]">
                      {[...Array(item.rating)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed italic font-light">
                      &ldquo;{item.content}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-3">
                      {item.userPicture ? (
                        <div
                          className="w-10 h-10 rounded-full bg-cover bg-center border border-white/20 shadow-sm flex-shrink-0"
                          style={{ backgroundImage: `url('${item.userPicture}')` }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-neutral-800 border border-white/20 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                          {item.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-white">{item.fullName}</span>
                        <span className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase mt-0.5">
                          Verified Client
                        </span>
                      </div>
                    </div>

                    {item.country && (
                      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded border border-white/10 flex-shrink-0">
                        <FlagDisplay flag={item.countryFlag} country={item.country} />
                        <span className="text-[11px] font-bold text-white/80">{item.country}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
