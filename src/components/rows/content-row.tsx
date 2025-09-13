"use client";

import { useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MediaCard, { MediaItem } from "@/components/cards/media-card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ContentRowProps {
  title: string;
  items: MediaItem[];
  onSelect?: (item: MediaItem) => void;
  className?: string;
}

export default function ContentRow({ title, items, onSelect, className = "" }: ContentRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const cardWidth = 300; // Approximate card width
    const gap = 16; // Gap between cards
    const scrollAmount = (cardWidth + gap) * 3; // Scroll 3 cards at a time

    const currentScroll = container.scrollLeft;
    const targetScroll = direction === 'left' 
      ? Math.max(0, currentScroll - scrollAmount)
      : currentScroll + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }, []);

  const scrollLeft = () => scroll('left');
  const scrollRight = () => scroll('right');

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (index > 0) {
          const prevCard = scrollContainerRef.current?.children[index - 1] as HTMLElement;
          prevCard?.focus();
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (index < items.length - 1) {
          const nextCard = scrollContainerRef.current?.children[index + 1] as HTMLElement;
          nextCard?.focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        const firstCard = scrollContainerRef.current?.children[0] as HTMLElement;
        firstCard?.focus();
        scrollContainerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
        break;
      case 'End':
        e.preventDefault();
        const lastCard = scrollContainerRef.current?.children[items.length - 1] as HTMLElement;
        lastCard?.focus();
        break;
    }
  };

  if (!items.length) return null;

  return (
    <section 
      className={`relative mb-12 ${className}`}
      role="region"
      aria-label={`${title} 컬렉션`}
    >
      {/* Row Title */}
      <div className="container max-w-[1400px] mx-auto px-4 mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          {title}
        </h2>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Navigation Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white border-none h-12 w-12 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={scrollLeft}
          aria-label="이전 콘텐츠 보기"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        {/* Right Navigation Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white border-none h-12 w-12 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={scrollRight}
          aria-label="다음 콘텐츠 보기"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>

        {/* Scrollable Content */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 py-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
          role="listbox"
          aria-label={`${title} 목록`}
          tabIndex={-1}
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              className="flex-none w-72 md:w-80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              role="option"
              aria-selected="false"
            >
              <MediaCard
                item={item}
                onSelect={onSelect}
                className="h-full"
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}