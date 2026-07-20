"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiCall } from "@/lib/apiClient";

interface BlogPost {
  _id: string;
  title: string;
  subtitle: string;
  picture: string;
  category: string;
  author: string;
  date: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiCall<{ success: boolean; blogs: BlogPost[] }>("/api/blogs")
      .then((res) => {
        setPosts(res.blogs.filter((b) => b.category !== "Project"));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="w-full bg-white text-neutral-900 font-sans">

      {/* Banner */}
      <section className="relative w-full py-28 md:py-36 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/oil1.jpg')" }}>
        <div className="absolute inset-0 bg-neutral-950/75 z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-[10px] md:px-6 relative z-20 flex flex-col gap-6 items-start mt-10 md:mt-16">
          <span className="text-xs font-extrabold tracking-[0.25em] text-[#e4c126] uppercase block">Media & Insights</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">Corporate Blog</h1>
          <div className="border-l-4 border-[#e4c126] pl-6 py-1 max-w-2xl">
            <p className="text-base sm:text-lg md:text-xl font-medium text-white/95 leading-relaxed">
              Read the latest engineering breakthroughs, asset evaluations, and clean energy compliance auditing updates.
            </p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="relative w-full py-16 md:py-24 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-[10px] md:px-6">

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white rounded border border-neutral-200/50 overflow-hidden animate-pulse">
                  <div className="h-52 bg-neutral-200" />
                  <div className="p-6 flex flex-col gap-3">
                    <div className="h-3 bg-neutral-200 rounded w-1/3" />
                    <div className="h-5 bg-neutral-200 rounded w-full" />
                    <div className="h-5 bg-neutral-200 rounded w-3/4" />
                    <div className="h-3 bg-neutral-200 rounded w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-neutral-400 text-sm">No posts available at this time.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/post?id=${post._id}`}
                  className="bg-white rounded border border-neutral-200/50 shadow-sm hover:shadow-lg hover:border-[#e4c126]/30 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative w-full h-52 overflow-hidden bg-neutral-100">
                    {post.picture ? (
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url('${post.picture}')` }}
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-200" />
                    )}
                    <div className="absolute top-4 left-4 bg-neutral-900 text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded">
                      {post.category}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-neutral-400 font-bold block">{post.date}</span>
                      <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight leading-snug group-hover:text-[#528574] transition-colors">
                        {post.title}
                      </h3>
                      {post.subtitle && (
                        <p className="text-xs text-neutral-500 leading-relaxed font-light mt-1 line-clamp-2">
                          {post.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="pt-2">
                      <span className="text-xs font-extrabold text-[#528574] group-hover:text-[#e4c126] flex items-center gap-1.5 transition-colors">
                        <span>READ COMPLETED BRIEF</span>
                        <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
