"use client";

import TopNav from "@/components/nav/top-nav";
import AboutHero from "@/components/about/about-hero";

export default function About() {
  return (
    <main className="h-screen bg-[#141414] text-white overflow-hidden">
      {/* Fixed Navigation */}
      <TopNav />

      {/* About Hero Section */}
      <AboutHero />
    </main>
  );
}