"use client";

import React, { useState, useEffect } from "react";
import { apiCall } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";

interface ReviewItem {
  _id: string;
  fullName: string;
  content: string;
  rating: number;
  country?: string;
  countryFlag?: string;
  userPicture?: string;
  createdAt: string;
}

export default function UserReviewsPage() {
  const { user } = useAuthStore();
  const username = user?.username;

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Form states
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchApprovedReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await apiCall<{ success: boolean; reviews: ReviewItem[] }>("/api/reviews");
      if (res.success) {
        setReviews(res.reviews || []);
      }
    } catch (err: any) {
      console.error("Failed to load community feedback: ", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchApprovedReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!username) {
      setFormError("You must be logged in to submit a review.");
      return;
    }
    if (!content.trim()) {
      setFormError("Please enter your feedback text.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiCall<{ success: boolean; message: string }>("/api/reviews", {
        method: "POST",
        body: {
          username,
          rating,
          content: content.trim(),
        },
      });

      if (res.success) {
        setFormSuccess(res.message || "Thank you! Your feedback has been submitted successfully.");
        setContent("");
        setRating(5);
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-8 w-full max-w-7xl mx-auto text-white">
      
      {/* Title Header */}
      <div className="flex flex-col gap-1.5 border-b border-neutral-800/80 pb-6">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Investor Reviews & Feedback
        </h1>
        <p className="text-xs text-neutral-400 font-medium">
          Share your energy investment experience with the Capricorn Energy community and view live testimonials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Submit Feedback Form (5 Cols) */}
        <div className="lg:col-span-5 bg-[#13151a]/40 border border-neutral-800/50 rounded-xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#528574]" />
          
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-extrabold text-white">Submit Your Testimonial</h2>
            <p className="text-[11px] text-neutral-400 font-light">
              Your feedback will be audited and published on our homepage upon approval.
            </p>
          </div>

          <form onSubmit={handleSubmitReview} className="flex flex-col gap-5">
            {formSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 rounded p-4 text-xs text-green-400 font-bold">
                ✓ {formSuccess}
              </div>
            )}
            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded p-4 text-xs text-red-400 font-bold">
                ✗ {formError}
              </div>
            )}

            {/* Stars Rating Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">
                Investment Rating
              </label>
              <div className="flex items-center gap-1.5 bg-[#0f1115] border border-neutral-800/80 px-4 py-3 rounded-lg w-fit">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-0.5 text-neutral-500 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                  >
                    <svg
                      className={`w-6 h-6 fill-current transition-colors ${
                        star <= rating ? "text-[#e4c126]" : "text-neutral-700 hover:text-neutral-500"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="text-xs font-black text-neutral-300 ml-2 uppercase tracking-wide">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Review Content Box */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">
                Your Feedback Experience
              </label>
              <textarea
                rows={5}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share details of your daily ROI, asset safety, or customer assistance..."
                className="w-full bg-[#0f1115] border border-neutral-800 rounded-lg px-4 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126] resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#528574] hover:bg-[#436e5f] text-white py-3 px-5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />
                  Publishing review...
                </>
              ) : (
                "Submit Testimonial"
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Community Live Feedback (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-extrabold text-white">Community Reviews</h2>
            <p className="text-[11px] text-neutral-400 font-light">
              Verified active investors sharing their real oil & gas yield stories.
            </p>
          </div>

          {loadingReviews ? (
            <div className="py-20 flex flex-col gap-3 items-center justify-center bg-[#13151a]/20 border border-neutral-800/40 rounded-xl">
              <div className="w-8 h-8 rounded-full border-2 border-[#528574] border-t-transparent animate-spin" />
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                Loading community testimonials...
              </span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-24 border border-dashed border-neutral-800 rounded-xl flex flex-col items-center justify-center text-neutral-500 gap-3">
              <svg className="w-10 h-10 opacity-30 stroke-current stroke-[1.5]" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c-.196-.399-.678-.399-.874 0L7.54 9.07l-6.136.89c-.44.064-.616.606-.298.917l4.44 4.328-1.048 6.11c-.075.44.384.773.778.567L10 18.822l5.42 2.853c.395.206.853-.127.778-.567l-1.048-6.11 4.44-4.328c.318-.311.142-.853-.298-.917l-6.136-.89L11.48 3.5z" />
              </svg>
              <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-400">
                No verified reviews published yet
              </span>
              <p className="text-[11px] text-neutral-500 max-w-sm text-center">
                Submit your investment review to become one of the first featured Capricorn Energy advisors!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="bg-[#13151a]/25 border border-neutral-800/40 hover:border-neutral-700/50 rounded-xl p-5 flex flex-col gap-4 transition-all duration-300 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full border border-neutral-800 bg-[#0f1115] overflow-hidden flex items-center justify-center">
                        {rev.userPicture ? (
                          <img src={rev.userPicture} alt={rev.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-black text-[#528574] uppercase">
                            {rev.fullName.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-white">{rev.fullName}</span>
                        <span className="text-[9px] text-neutral-500 font-light flex items-center gap-1">
                          {rev.countryFlag} {rev.country || "United States"}
                        </span>
                      </div>
                    </div>

                    {/* Stars Display */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg
                          key={s}
                          className={`w-3 h-3 fill-current ${
                            s <= rev.rating ? "text-[#e4c126]" : "text-neutral-800"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 font-light leading-relaxed italic">
                    "{rev.content}"
                  </p>

                  <div className="flex justify-between items-center border-t border-neutral-900/60 pt-3 mt-1 text-[9px] text-neutral-500 font-light">
                    <span>Verified Advisor</span>
                    <span>
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
