"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSettingStore } from "@/store/settingStore";
import { useBlogStore } from "@/store/blogStore";

export default function Footer() {
  const { setting, fetchSettings } = useSettingStore();
  const { blogs, fetchBlogs } = useBlogStore();

  useEffect(() => {
    fetchSettings();
    fetchBlogs();
  }, [fetchSettings, fetchBlogs]);

  const projects = blogs.filter((b) => b.category === "Project");
  return (
    <footer className="relative w-full bg-neutral-950 text-white pt-16 pb-8 overflow-hidden ">
      <div className="max-w-7xl mx-auto px-[10px] md:px-6">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-12">
          
          {/* Column 1: Company Links */}
          <div className="lg:col-span-2.5 flex flex-col gap-5 lg:col-span-3">
            <div className="flex flex-col gap-1.5">
              <h4 className="text-lg font-bold text-white tracking-wide">
                Company
              </h4>
              <div className="w-8 h-[2px] bg-[#e4c126]" />
            </div>
            <ul className="flex flex-col gap-3 text-sm text-neutral-400 font-light">
              <li>
                <Link href="/" className="hover:text-[#e4c126] transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#e4c126] transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/plans" className="hover:text-[#e4c126] transition-colors">Investment</Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-[#e4c126] transition-colors">Projects</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Projects Links */}
          <div className="lg:col-span-2.5 flex flex-col gap-5 lg:col-span-3">
            <div className="flex flex-col gap-1.5">
              <h4 className="text-lg font-bold text-white tracking-wide">
                Projects
              </h4>
              <div className="w-8 h-[2px] bg-[#e4c126]" />
            </div>
            <ul className="flex flex-col gap-3 text-sm text-neutral-400 font-light">
              {projects.length > 0 ? (
                projects.slice(0, 5).map((proj) => (
                  <li key={proj._id}>
                    <Link href={`/projects/detail?id=${proj._id}`} className="hover:text-[#e4c126] transition-colors">
                      {proj.abbreviation || proj.shortName || proj.title}
                    </Link>
                  </li>

                ))
              ) : (
                <>
                  <li><Link href="/projects" className="hover:text-[#e4c126] transition-colors">Clean Infrastructure</Link></li>
                  <li><Link href="/projects" className="hover:text-[#e4c126] transition-colors">Carbon Sequestration</Link></li>
                  <li><Link href="/projects" className="hover:text-[#e4c126] transition-colors">Crude Refining</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Column 3: Support Links */}
          <div className="lg:col-span-2 flex flex-col gap-5 lg:col-span-2">
            <div className="flex flex-col gap-1.5">
              <h4 className="text-lg font-bold text-white tracking-wide">
                Support
              </h4>
              <div className="w-8 h-[2px] bg-[#e4c126]" />
            </div>
            <ul className="flex flex-col gap-3 text-sm text-neutral-400 font-light">
              <li>
                <Link href="/contact" className="hover:text-[#e4c126] transition-colors">Contact</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#e4c126] transition-colors">FAQ</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#e4c126] transition-colors">Sign Up</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#e4c126] transition-colors">Terms &amp; Conditions</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#e4c126] transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Brand Logo, Copy & Address */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Capricorn Logo */}
            <div className="relative h-[52px] w-[187px]">
              <Image
                src="/CapricornLogo.png"
                alt="Capricorn"
                fill
                className="object-contain object-left brightness-0 invert"
              />
            </div>

            {/* Paragraph Text */}
            {setting?.description && (
              <p className="text-sm text-neutral-400 font-light leading-relaxed max-w-sm">
                {setting.description}
              </p>
            )}

            {/* Address, Phone, Email Lists */}
            <div className="flex flex-col gap-3 text-sm text-neutral-300">
              
              {/* Location Pin */}
              {setting?.address && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#e4c126] fill-none stroke-current stroke-[2] flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="font-light">{setting.address}</span>
                </div>
              )}

              {/* Phone Icon */}
              {setting?.phone && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#e4c126] fill-none stroke-current stroke-[2] flex-shrink-0" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.502-5.127-3.805-6.63-6.63l1.293-.97c.362-.271.528-.733.417-1.173L6.763 3.07a1.091 1.091 0 00-1.091-.852H4.25a2.25 2.25 0 00-2.25 2.25v2.25z" />
                  </svg>
                  <a href={`tel:${setting.phone}`} className="font-light hover:text-[#e4c126] transition-colors">{setting.phone}</a>
                </div>
              )}

              {/* Envelope Email Icon */}
              {setting?.email && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#e4c126] fill-none stroke-current stroke-[2] flex-shrink-0" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <a href={`mailto:${setting.email}`} className="font-light hover:text-[#e4c126] transition-colors cursor-pointer">{setting.email}</a>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Divider Line */}
        <div className="w-full h-[1px] bg-neutral-800 my-8" />

        {/* Bottom Bar: Links & Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500 font-light">
          
          {/* Policy Links */}
          <div className="flex items-center gap-3">
            <Link href="#" className="hover:text-white transition-colors">Term of use</Link>
            <span className="text-neutral-700">|</span>
            <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
            <span className="text-neutral-700">|</span>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>

          {/* Copyright Text */}
          <div className="text-center sm:text-right">
            Copyright © 2026 {setting?.companyName || ""}. All rights reserved.
          </div>

        </div>

      </div>
    </footer>

  );
}
