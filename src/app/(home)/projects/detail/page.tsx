"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
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

function ProjectDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [project, setProject] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setIsLoading(false); return; }
    apiCall<{ success: boolean; blog: BlogPost }>(`/api/blogs/${id}`)
      .then((res) => setProject(res.blog))
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

  if (notFound || !project) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6">
        <h1 className="text-2xl font-black text-neutral-900">Project Not Found</h1>
        <p className="text-sm text-neutral-500">This project no longer exists or was removed.</p>
        <Link href="/projects" className="text-[#528574] font-bold text-sm hover:underline">← Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-white text-neutral-900">

      {/* Banner */}
      <section className="relative w-full py-28 md:py-36 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/oil2.jpg')" }}>
        <div className="absolute inset-0 bg-neutral-950/80 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-[10px] md:px-6 relative z-10 flex flex-col gap-5 mt-10 md:mt-14">
          <div className="flex items-center gap-3">
            <span className="bg-[#e4c126] text-neutral-900 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded">
              Project
            </span>
            <Link href="/projects" className="text-white/60 hover:text-white text-xs font-medium transition-colors">
              ← Back to Projects
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-4xl">
            {project.title}
          </h1>
          {project.subtitle && (
            <p className="text-base md:text-lg text-white/80 font-light leading-relaxed max-w-3xl">
              {project.subtitle}
            </p>
          )}
          <div className="flex items-center gap-4 text-white/60 text-xs font-medium pt-2">
            <span>{project.date}</span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span>By {project.author}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-[10px] md:px-6 flex flex-col gap-12">

          {project.picture && (
            <div className="relative w-full aspect-[16/7] rounded overflow-hidden shadow-lg bg-neutral-100">
              <Image
                src={project.picture}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover"
              />
            </div>
          )}

          <article
            className="prose prose-neutral prose-lg max-w-none
              prose-headings:font-black prose-headings:tracking-tight prose-headings:text-neutral-900
              prose-p:text-neutral-600 prose-p:leading-relaxed
              prose-strong:text-neutral-900
              prose-a:text-[#528574] prose-a:no-underline hover:prose-a:underline
              prose-li:text-neutral-600
              prose-hr:border-neutral-200"
            dangerouslySetInnerHTML={{ __html: project.content }}
          />

          <div className="pt-8 border-t border-neutral-200 flex items-center justify-between">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-neutral-500 hover:text-[#528574] transition-colors"
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Projects
            </Link>
            <span className="text-xs text-neutral-400">By {project.author} · {project.date}</span>
          </div>

        </div>
      </section>

    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#528574] border-t-transparent animate-spin" />
      </div>
    }>
      <ProjectDetailContent />
    </Suspense>
  );
}
