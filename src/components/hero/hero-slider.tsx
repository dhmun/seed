"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  bgUrl: string;
  year?: string;
  rating?: string;
}

interface HeroSliderProps {
  items?: HeroItem[];
}

// i18n 준비된 텍스트
const texts = {
  buttons: {
    createPack: "미디어팩 만들기"
  }
};

const heroItems: HeroItem[] = [
  {
    id: "hero-1",
    title: "당신의 선택이 누군가에게는 세상의 전부",
    subtitle: "한류 콘텐츠로 만드는 특별한 캠페인",
    description: "미디어 큐레이션으로 전하는 따뜻한 마음. 나만의 미디어팩을 만들어 희망의 씨앗을 나눠보세요.",
    thumbnailUrl: "https://picsum.photos/800/450?random=101",
    bgUrl: "https://picsum.photos/1920/1080?random=101",
  },
  {
    id: "hero-2", 
    title: "따뜻한 이야기로 채워진 특별한 컬렉션",
    subtitle: "콘텐츠로 만드는 희망의 미디어 팩",
    description: "국내외 감동적인 스토리와 메시지를 담은 큐레이션.",
    thumbnailUrl: "https://picsum.photos/800/450?random=102",
    bgUrl: "https://picsum.photos/1920/1080?random=102",

  },
  {
    id: "hero-3",
    title: "세상을 바꾸는 작은 변화들", 
    subtitle: "누군가에게는 세상의 전부",
    description: "희망과 변화의 이야기들을 모은 특별한 큐레이션.",
    thumbnailUrl: "https://picsum.photos/800/450?random=103",
    bgUrl: "https://picsum.photos/1920/1080?random=103",
  }
];

export default function HeroSlider({ items = heroItems }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const sectionRef = useRef<HTMLElement>(null);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const startAutoplay = useCallback(() => {
    if (prefersReducedMotion) return; // Respect reduced motion preference
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
  }, [items.length, prefersReducedMotion]);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (isPlaying && !hasFocus) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
    return stopAutoplay;
  }, [isPlaying, hasFocus, startAutoplay, stopAutoplay]);


  const currentItem = items[currentIndex];

  return (
    <>
      {/* Preload first hero image for LCP optimization */}
      <link
        rel="preload"
        as="image"
        href={items[0]?.bgUrl}
        key="hero-preload"
      />
      
      <section 
        ref={sectionRef}
        className="relative h-screen w-full overflow-hidden hero-section"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
        onFocusCapture={() => setHasFocus(true)}
        onBlurCapture={() => setHasFocus(false)}
        role="region"
        aria-roledescription="carousel"
        aria-label="메인 추천 콘텐츠"
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8 }}
            className="absolute inset-0"
            id="hero-carousel"
          >
            <Image
              src={currentItem.bgUrl}
              alt={currentItem.title}
              fill
              priority={currentIndex === 0}
              sizes="100vw"
              className="object-cover"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
            {/* Single optimized gradient overlay */}
            <div className="hero-overlay" />
          </motion.div>
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container max-w-[1400px] mx-auto px-4">
            <div className="max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentItem.id}
                  initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
                >

                  {/* Title - Main H1 */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    {currentItem.title}
                  </h1>

                  {/* Subtitle */}
                  <h2 className="text-xl md:text-2xl text-zinc-300 mb-6 font-medium">
                    {currentItem.subtitle}
                  </h2>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-zinc-300 text-sm mb-6">
                    {currentItem.year && <span>{currentItem.year}</span>}
                    {currentItem.rating && (
                      <span className="rating-badge">
                        {currentItem.rating}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-lg md:text-xl text-zinc-200 mb-8 leading-relaxed max-w-xl">
                    {currentItem.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <Link href="/about" className="focus-ring rounded-lg">
                      <Button 
                        size="lg" 
                        className="btn-primary-light touch-target"
                      >
                        <Gift className="w-5 h-5 mr-2" aria-hidden="true" />
                        {texts.buttons.createPack}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

      </section>

      <style jsx>{`
        .hero-section {
          background-color: #141414;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 90%),
                      linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(0,0,0,0.5) 100%);
        }


        .rating-badge {
          padding: 0.25rem 0.5rem;
          border: 1px solid #71717a;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          line-height: 1rem;
        }

        .btn-primary-light {
          background-color: white;
          color: black;
          font-weight: 600;
          font-size: 1.125rem;
          line-height: 1.75rem;
          padding: 1.5rem 2rem;
          border-radius: 0.5rem;
          transition: background-color 0.3s ease;
        }

        .btn-primary-light:hover {
          background-color: #e5e5e5;
        }

        .btn-ghost-dark {
          background-color: rgba(113, 113, 122, 0.8);
          color: white;
          font-size: 1.125rem;
          line-height: 1.75rem;
          padding: 1.5rem 2rem;
          border-radius: 0.5rem;
          backdrop-filter: blur(4px);
          transition: background-color 0.3s ease;
        }

        .btn-ghost-dark:hover {
          background-color: #71717a;
        }

        .touch-target {
          min-height: 44px;
          min-width: 44px;
        }

        .focus-ring:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.6);
          border-radius: 0.5rem;
        }


        @media (prefers-reduced-motion: reduce) {
          .hero-section *,
          .hero-section *::before,
          .hero-section *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        @media (max-width: 768px) {
          .btn-primary-light,
          .btn-ghost-dark {
            font-size: 1rem;
            line-height: 1.5rem;
            padding: 1rem 1.5rem;
          }

          .hero-overlay {
            background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, transparent 100%),
                        linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.7) 100%);
          }
        }
      `}</style>
    </>
  );
}