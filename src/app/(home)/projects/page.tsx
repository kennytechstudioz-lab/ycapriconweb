"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiCall } from "@/lib/apiClient";
import WorldMapSection from "@/components/home/WorldMapSection";

interface BlogPost {
  _id: string;
  title: string;
  subtitle: string;
  picture: string;
  category: string;
  author: string;
  date: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiCall<{ success: boolean; blogs: BlogPost[] }>("/api/blogs")
      .then((res) => {
        setProjects(res.blogs.filter((b) => b.category === "Project"));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="w-full bg-white text-neutral-900">

      {/* Banner Header */}
      <section className="relative w-full py-28 md:py-36 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/oil2.jpg')" }}>
        <div className="absolute inset-0 bg-neutral-950/75 z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-[10px] md:px-6 relative z-20 flex flex-col gap-6 items-start mt-10 md:mt-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
            Our Projects
          </h1>
          <div className="border-l-4 border-[#e4c126] pl-6 py-1 max-w-2xl">
            <p className="text-base sm:text-lg md:text-xl font-medium text-white/95 leading-relaxed">
              Pioneering state-of-the-art oil, gas, and renewable infrastructure investments globally.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="relative w-full bg-white py-16 md:py-24 border-t border-neutral-200/30">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10 bg-[radial-gradient(#528574_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-[10px] md:px-6">

          <div className="mb-12">
            <span className="text-[12px] font-extrabold tracking-[0.25em] text-[#528574] uppercase block mb-3">
              Our Awesome Projects
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-[1.15]">
              All Oil & Gas Projects
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-neutral-100 rounded animate-pulse aspect-[4/5]" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="text-neutral-400 text-sm">No projects available at this time.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <Link
                  key={project._id}
                  href={`/projects/detail?id=${project._id}`}
                  className="bg-white border border-neutral-200/40 rounded shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col group overflow-hidden"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-neutral-100">
                    {project.picture ? (
                      <Image
                        src={project.picture}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-200" />
                    )}
                  </div>

                  <div className="p-6 md:p-8 flex flex-col items-start gap-3 flex-1">
                    <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#528574] uppercase">
                      {project.date}
                    </span>
                    <h4 className="text-xl font-extrabold text-neutral-900 group-hover:text-[#528574] transition-colors leading-snug">
                      {project.title}
                    </h4>
                    <p className="text-sm text-neutral-500 leading-relaxed flex-1 font-light">
                      {project.subtitle}
                    </p>
                    <div className="pt-2">
                      <span className="text-xs text-neutral-400 font-medium">
                        By {project.author}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <WorldMapSection />
    </div>
  );
}
