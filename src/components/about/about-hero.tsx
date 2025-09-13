"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, BookOpen, Radio, Users, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface AboutSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  bgUrl: string;
  badge: string;
  icon: any;
  stats: string;
  subStats: string;
}

const texts = {
  badges: {
    mission: "미션",
    freedom: "자유",
    hope: "희망"
  },
  buttons: {
    createPack: "미디어팩 만들기"
  }
};

const aboutSlides = [
  {
    id: "about-1",
    title: "정보접근권은 생존권입니다",
    subtitle: "유엔 세계인권선언 제19조가 보장하는 근본적 권리",
    description: "\"모든 사람은 의견의 자유와 표현의 자유에 대한 권리를 가진다. 이 권리는 간섭없이 의견을 가질 자유와 국경에 관계없이 어떠한 매체를 통하여서도 정보와 사상을 추구하고 접수하며 전달하는 자유를 포함한다.\" 이는 단순한 선택이 아닌, 인간으로서의 존엄을 지키는 생존권입니다.",
    bgUrl: "https://picsum.photos/1920/1080?random=201",
    badge: "mission",
    icon: BookOpen,
    stats: "전 세계 2억 5천만 명이",
    subStats: "정보 봉쇄 하에 살고 있습니다"
  },
  {
    id: "about-2", 
    title: "침묵의 장벽을 넘어서는 연대",
    subtitle: "문화적 공감대로 건설하는 소통의 다리",
    description: "정치적 선전이 아닌, 순수한 인간의 이야기를 전합니다. K-팝, 드라마, 영화를 통해 전달되는 것은 단순한 오락이 아닌 '또 다른 삶의 가능성'입니다. 젊은 연인의 사랑, 가족의 따뜻함, 꿈을 향한 열정 - 이러한 보편적 감정이 닫힌 마음의 문을 엽니다.",
    bgUrl: "https://picsum.photos/1920/1080?random=202",
    badge: "freedom",
    icon: Radio,
    stats: "2018년 이후 매년",
    subStats: "15만 개 이상의 미디어팩이 전달되었습니다"
  },
  {
    id: "about-3",
    title: "한 사람의 깨달음이 만드는 역사",
    subtitle: "작은 변화가 만들어낸 거대한 물결들",
    description: "1989년 베를린 장벽이 무너진 것은 망치가 아닌 사람들의 마음이 바뀌었기 때문입니다. 하나의 미디어팩이 한 사람의 세계관을 바꾸고, 그 사람이 가족에게, 친구에게, 이웃에게 전하는 이야기가 결국 거대한 변화의 씨앗이 됩니다. 역사는 증명합니다 - 정보의 자유가 인간 해방의 첫걸음임을.",
    bgUrl: "https://picsum.photos/1920/1080?random=203",
    badge: "hope", 
    icon: Heart,
    stats: "역사상 모든 민주화는",
    subStats: "정보 공유에서 시작되었습니다"
  }
];

export default function AboutHero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (prefersReducedMotion || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % aboutSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion, isPlaying]);

  const currentSlide = aboutSlides[currentIndex];
  const IconComponent = currentSlide.icon;

  return (
    <>
      {/* Preload first image for LCP optimization */}
      <link
        rel="preload"
        as="image"
        href={aboutSlides[0]?.bgUrl}
        key="about-preload"
      />
      
      <section 
        className="relative h-screen w-full overflow-hidden about-section"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
        role="region"
        aria-label="북플릭스 소개"
      >
        {/* Background Images */}
        <div className="absolute inset-0">
          {aboutSlides.map((slide, index) => (
            <motion.div
              key={slide.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: index === currentIndex ? 1 : 0,
                scale: index === currentIndex ? 1 : 1.05
              }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 1.2 }}
            >
              <Image
                src={slide.bgUrl}
                alt={slide.title}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </motion.div>
          ))}
          
          {/* Enhanced overlay for better text contrast */}
          <div className="about-overlay" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container max-w-[1400px] mx-auto px-4">
            <div className="max-w-4xl">
              <motion.div
                key={currentIndex}
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.3 }}
              >
                {/* Badge with Icon */}
                <div className="flex items-center gap-3 mb-6">
                  <Badge className="badge-about focus-ring flex items-center gap-2">
                    <IconComponent className="w-4 h-4" aria-hidden="true" />
                    {texts.badges[currentSlide.badge as keyof typeof texts.badges]}
                  </Badge>
                  
                  {/* Statistics indicator */}
                  <motion.div 
                    className="text-sm text-zinc-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="font-semibold">{currentSlide.stats}</div>
                    <div className="text-xs text-zinc-500 mt-1">{currentSlide.subStats}</div>
                  </motion.div>
                </div>

                {/* Main Title */}
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  {currentSlide.title}
                </h1>

                {/* Subtitle */}
                <h2 className="text-xl md:text-2xl text-orange-400 mb-8 font-medium leading-relaxed">
                  {currentSlide.subtitle}
                </h2>

                {/* Description */}
                <p className="text-lg md:text-xl text-zinc-200 mb-10 leading-relaxed max-w-3xl">
                  {currentSlide.description}
                </p>

                {/* Key Points */}
                <motion.div 
                  className="grid md:grid-cols-3 gap-6 mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  {currentIndex === 0 && (
                    <>
                      <div className="flex items-start gap-3 text-zinc-300">
                        <BookOpen className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">유엔 세계인권선언 제19조</div>
                          <div className="text-sm text-zinc-400">의견과 표현의 자유</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-zinc-300">
                        <Users className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">정보 주권</div>
                          <div className="text-sm text-zinc-400">알 권리와 선택할 권리</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-zinc-300">
                        <Radio className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">미디어 다양성</div>
                          <div className="text-sm text-zinc-400">다원주의적 정보 생태계</div>
                        </div>
                      </div>
                    </>
                  )}
                  {currentIndex === 1 && (
                    <>
                      <div className="flex items-start gap-3 text-zinc-300">
                        <Gift className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">문화적 소프트파워</div>
                          <div className="text-sm text-zinc-400">K-컬처의 감성적 연결</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-zinc-300">
                        <Radio className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">디지털 휴머니즘</div>
                          <div className="text-sm text-zinc-400">기술을 통한 인간적 연대</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-zinc-300">
                        <Heart className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">공감의 정치학</div>
                          <div className="text-sm text-zinc-400">감정을 통한 이해와 변화</div>
                        </div>
                      </div>
                    </>
                  )}
                  {currentIndex === 2 && (
                    <>
                      <div className="flex items-start gap-3 text-zinc-300">
                        <Heart className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">개인적 각성</div>
                          <div className="text-sm text-zinc-400">인식의 전환점과 내적 변화</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-zinc-300">
                        <Users className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">사회적 확산</div>
                          <div className="text-sm text-zinc-400">점진적 의식 변화의 물결</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-zinc-300">
                        <Radio className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">역사적 변혁</div>
                          <div className="text-sm text-zinc-400">체제 변화의 동력</div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                  className="flex items-center gap-4 flex-wrap"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <Link href="/builder" className="focus-ring rounded-lg">
                    <Button 
                      size="lg" 
                      className="btn-primary-orange touch-target"
                    >
                      <Gift className="w-5 h-5 mr-2" aria-hidden="true" />
                      {texts.buttons.createPack}
                    </Button>
                  </Link>
                  
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Slide Progress Indicator (Subtle) */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center gap-2">
            {aboutSlides.map((_, index) => (
              <motion.div
                key={index}
                className={`h-1 rounded-full transition-all duration-500 ${
                  index === currentIndex 
                    ? "w-12 bg-white" 
                    : "w-6 bg-white/30"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              />
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .about-section {
          background-color: #141414;
        }

        .about-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%),
                      linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, rgba(0,0,0,0.7) 100%);
        }

        .badge-about {
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.9), rgba(234, 88, 12, 0.9));
          color: white;
          border: none;
          box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3);
          padding: 0.5rem 1rem;
          font-weight: 600;
        }

        .btn-primary-orange {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          font-weight: 600;
          font-size: 1.125rem;
          line-height: 1.75rem;
          padding: 1.5rem 2rem;
          border-radius: 0.75rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(249, 115, 22, 0.3);
        }

        .btn-primary-orange:hover {
          background: linear-gradient(135deg, #ea580c, #c2410c);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(249, 115, 22, 0.4);
        }

        .btn-ghost-about {
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 1.125rem;
          line-height: 1.75rem;
          padding: 1.5rem 2rem;
          border-radius: 0.75rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .btn-ghost-about:hover {
          background-color: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .touch-target {
          min-height: 44px;
          min-width: 44px;
        }

        .focus-ring:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.6);
          border-radius: 0.75rem;
        }

        @media (prefers-reduced-motion: reduce) {
          .about-section *,
          .about-section *::before,
          .about-section *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        @media (max-width: 768px) {
          .btn-primary-orange,
          .btn-ghost-about {
            font-size: 1rem;
            line-height: 1.5rem;
            padding: 1rem 1.5rem;
          }

          .about-overlay {
            background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.8) 100%);
          }
        }
      `}</style>
    </>
  );
}