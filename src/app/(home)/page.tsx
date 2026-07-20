"use client";

import React, { useEffect } from "react";
import { useSettingStore } from "@/store/settingStore";
import { usePlanStore } from "@/store/planStore";

import HeroCarousel from "@/components/home/HeroCarousel";
import AboutSection from "@/components/home/AboutSection";
import WorldMapSection from "@/components/home/WorldMapSection";
import InvestmentPlansSection from "@/components/home/InvestmentPlansSection";
import TestimonialSection from "@/components/home/TestimonialSection";
import ServicesSection from "@/components/home/ServicesSection";
import ValueSection from "@/components/home/ValueSection";
import SolutionsSection from "@/components/home/SolutionsSection";
import TeamSection from "@/components/home/TeamSection";
import ProjectsSection from "@/components/home/ProjectsSection";

export default function Home() {
  const { fetchSettings } = useSettingStore();
  const { fetchPlans } = usePlanStore();

  useEffect(() => {
    Promise.all([
      fetchSettings(),
      fetchPlans ? fetchPlans() : Promise.resolve(),
    ]).catch((err) => console.error("Error loading home layout assets:", err));
  }, [fetchSettings, fetchPlans]);

  return (
    <>
      <HeroCarousel />
      <AboutSection />
      <WorldMapSection />
      <InvestmentPlansSection />
      <TestimonialSection />
      <ServicesSection />
      <ValueSection />
      <SolutionsSection />
      <TeamSection />
      <ProjectsSection />
    </>
  );
}
