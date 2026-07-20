"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiCall } from "@/lib/apiClient";

interface BlogPost {
  _id: string;
  title: string;
  subtitle: string;
  picture: string;
  category: string;
  author: string;
  date: string;
  content: string;
}

function BlogPostContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setIsLoading(false); return; }
    apiCall<{ success: boolean; blog: BlogPost }>(`/api/blogs/${id}`)
      .then((res) => setPost(res.blog))
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#528574] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6">
        <h1 className="text-2xl font-black text-neutral-900">Post Not Found</h1>
        <p className="text-sm text-neutral-500">This blog post no longer exists or was removed.</p>
        <Link href="/blog" className="text-[#528574] font-bold text-sm hover:underline">← Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-white text-neutral-900">

      {/* Hero */}
      <section
        className="relative w-full py-28 md:py-40 bg-cover bg-center"
        style={{ backgroundImage: post.picture ? `url('${post.picture}')` : "url('/oil1.jpg')" }}
      >
        <div className="absolute inset-0 bg-neutral-950/75 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-[10px] md:px-6 relative z-10 flex flex-col gap-5 mt-10 md:mt-14">
          <div className="flex items-center gap-3">
            <span className="bg-[#e4c126] text-neutral-900 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded">
              {post.category}
            </span>
            <Link href="/blog" className="text-white/60 hover:text-white text-xs font-medium transition-colors">
              ← Back to Blog
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="text-base md:text-lg text-white/80 font-light leading-relaxed max-w-2xl">
              {post.subtitle}
            </p>
          )}
          <div className="flex items-center gap-4 text-white/60 text-xs font-medium pt-2">
            <span>{post.date}</span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span>By {post.author}</span>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-[10px] md:px-6">
          <article
            className="prose prose-neutral prose-lg max-w-none
              prose-headings:font-black prose-headings:tracking-tight prose-headings:text-neutral-900
              prose-p:text-neutral-600 prose-p:leading-relaxed
              prose-strong:text-neutral-900
              prose-a:text-[#528574] prose-a:no-underline hover:prose-a:underline
              prose-li:text-neutral-600
              prose-hr:border-neutral-200"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-16 pt-8 border-t border-neutral-200 flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-neutral-500 hover:text-[#528574] transition-colors"
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Blog
            </Link>
            <span className="text-xs text-neutral-400">By {post.author} · {post.date}</span>
          </div>
        </div>
      </section>

    </div>
  );
}

export default function BlogPostPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#528574] border-t-transparent animate-spin" />
      </div>
    }>
      <BlogPostContent />
    </Suspense>
  );
}
