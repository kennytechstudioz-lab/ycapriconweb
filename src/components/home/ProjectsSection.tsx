"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
  content: string;
}

export default function ProjectsSection() {
  const [projects, setProjects] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiCall<{ success: boolean; blogs: BlogPost[] }>("/api/blogs")
      .then((res) => {
        const projectBlogs = res.blogs
          .filter((b) => b.category === "Project")
          .slice(0, 3);
        setProjects(projectBlogs);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && projects.length === 0) return null;

  return (
    <section className="relative w-full bg-white text-neutral-900 py-16 md:py-24 overflow-hidden border-t border-neutral-200/30">

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10 bg-[radial-gradient(#528574_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-7xl mx-auto px-[10px] md:px-6">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-16">
          <div className="lg:col-span-6">
            <span className="text-[12px] font-extrabold tracking-[0.25em] text-[#528574] uppercase block mb-3">
              Our Awesome Projects
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-[1.15] max-w-xl">
              We Take All Related Oil & Gas Projects
            </h3>
          </div>

          <div className="lg:col-span-6 flex flex-col sm:flex-row gap-6 items-start pt-2 lg:pt-8">
            <div className="flex-1">
              <p className="text-sm sm:text-base text-neutral-500 leading-relaxed max-w-xl">
                We invest in a diverse portfolio of high-impact energy projects worldwide. From solar grids and wind farms to sustainable energy infrastructure, our projects are selected to deliver maximum environmental benefit alongside stable, long-term financial returns for our global investors.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white font-extrabold text-[12px] uppercase tracking-wider py-3.5 px-[10px] md:px-6 transition-colors duration-300"
              >
                ALL PROJECTS
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-neutral-100 rounded animate-pulse aspect-[4/5]" />
            ))}
          </div>
        ) : projects.length === 0 ? null : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project._id}
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

                <div className="p-6 md:p-8 flex flex-col items-start gap-4 flex-1">
                  <h4 className="text-xl font-extrabold text-neutral-900 group-hover:text-[#528574] transition-colors">
                    {project.title}
                  </h4>
                  <p className="text-sm text-neutral-500 leading-relaxed flex-1 font-light">
                    {project.subtitle}
                  </p>
                  <div className="pt-2">
                    <Link
                      href={`/projects/detail?id=${project._id}`}
                      className="inline-flex items-center justify-center bg-[#e4c126] hover:bg-neutral-900 hover:text-white text-neutral-900 font-extrabold text-[11px] uppercase tracking-wider py-2.5 px-5 transition-colors duration-300"
                    >
                      READ MORE
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
