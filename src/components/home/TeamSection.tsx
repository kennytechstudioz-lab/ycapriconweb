"use client";

import { useEffect, useState } from "react";
import { apiCall } from "@/lib/apiClient";

interface StaffMember {
  _id: string;
  name: string;
  position: string;
  description: string;
  picture: string;
}

export default function TeamSection() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall<{ success: boolean; staff: StaffMember[] }>("/api/staff")
      .then((res) => { if (res.success) setStaff(res.staff || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !staff.length) return null;

  return (
    <section className="relative w-full bg-[#f4f5f6] text-neutral-900 py-16 md:py-24 overflow-hidden border-t border-neutral-200/40">
      <div className="max-w-7xl mx-auto px-[10px] md:px-6">

        {/* Section Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-16">
          {/* Left Title block */}
          <div className="lg:col-span-6">
            <span className="text-[12px] font-extrabold tracking-[0.25em] text-[#528574] uppercase block mb-3">
              Meet Our Leadership
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-[1.15] max-w-xl">
              We talk a lot about hope, helping and teamwork.
            </h3>
          </div>

          {/* Right Description & CTA */}
          <div className="lg:col-span-6 flex flex-col gap-6 pt-2 lg:pt-8">
            <p className="text-sm sm:text-base text-neutral-500 leading-relaxed max-w-xl">
              Our team of seasoned professionals brings decades of combined expertise in clean energy, capital markets, and sustainable investment strategy to every allocation decision.
            </p>
            <div>
              <a
                href="/about"
                className="inline-flex items-center justify-center bg-[#e4c126] hover:bg-[#f1cf34] text-neutral-900 font-extrabold text-[12px] uppercase tracking-wider py-4 px-[10px] md:px-8 transition-colors"
              >
                DISCOVER MORE
              </a>
            </div>
          </div>
        </div>

        {/* Staff Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {staff.map((member) => (
            <div
              key={member._id}
              className="bg-white p-6 rounded shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center border border-neutral-200/30 group"
            >
              {/* Picture */}
              <div className="relative w-full aspect-square overflow-hidden mb-6 rounded-sm bg-neutral-100 flex items-center justify-center">
                {member.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.picture}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-5xl font-black text-neutral-300">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Name & Position */}
              <h4 className="text-xl font-extrabold text-neutral-900 mb-1">
                {member.name}
              </h4>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest block mb-4">
                {member.position}
              </span>

              {/* Description */}
              <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3">
                {member.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
