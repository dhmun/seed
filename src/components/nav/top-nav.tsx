"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#141414]/95 backdrop-blur-md border-b border-zinc-800/50"
          : "bg-gradient-to-b from-black/60 to-transparent"
      }`}
    >
      <div className="container max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center gap-2 text-white hover:text-zinc-300 transition-colors">
          <Sparkles className="w-6 h-6 text-[#e50914]" />
          <span className="text-lg font-semibold">북플릭스</span>
        </Link>


      </div>
    </nav>
  );
}