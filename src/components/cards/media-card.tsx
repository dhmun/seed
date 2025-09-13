"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Play, Plus, Info } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export interface MediaItem {
  id: string;
  title: string;
  subtitle?: string;
  genre?: string;
  thumbnailUrl: string;
  year?: string;
  rating?: string;
  duration?: string;
  isNew?: boolean;
  isPopular?: boolean;
}

interface MediaCardProps {
  item: MediaItem;
  selected?: boolean;
  onSelect?: (item: MediaItem) => void;
  className?: string;
}

export default function MediaCard({ item, selected, onSelect, className = "" }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleSelect = () => {
    onSelect?.(item);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <motion.div
      className={`group relative aspect-video overflow-hidden rounded-xl bg-zinc-800/60 cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50 focus:outline-none focus:ring-2 focus:ring-[#e50914] focus:ring-offset-2 focus:ring-offset-[#141414] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${item.title} 선택`}
      whileHover={{ scale: 1.05, y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Thumbnail Image */}
      <Image
        src={item.thumbnailUrl}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
      />

      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        {item.isNew && (
          <Badge className="bg-[#e50914] text-white border-none text-xs">
            NEW
          </Badge>
        )}
        {item.isPopular && (
          <Badge className="bg-orange-500 text-white border-none text-xs">
            인기
          </Badge>
        )}
      </div>

      {/* Hover Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content Overlay */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-4 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 20
        }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Title */}
        <h4 className="text-lg font-semibold line-clamp-2 mb-2">
          {item.title}
        </h4>

        {/* Subtitle */}
        {item.subtitle && (
          <p className="text-sm text-zinc-300 line-clamp-1 mb-2">
            {item.subtitle}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
          {item.year && <span>{item.year}</span>}
          {item.rating && (
            <span className="px-1.5 py-0.5 border border-zinc-500 rounded text-xs">
              {item.rating}
            </span>
          )}
          {item.duration && <span>{item.duration}</span>}
        </div>

        {/* Genre */}
        {item.genre && (
          <p className="text-xs text-zinc-400 mb-3 line-clamp-1">
            {item.genre}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-white text-black hover:bg-zinc-200 h-8 px-3 rounded-md flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect();
            }}
          >
            <Play className="w-3 h-3 mr-1" />
            선택
          </Button>

          <Button
            size="sm"
            variant="secondary"
            className="bg-zinc-600/80 text-white hover:bg-zinc-600 h-8 px-2 rounded-md"
            onClick={(e) => {
              e.stopPropagation();
              // Add to wishlist logic
            }}
          >
            <Plus className="w-3 h-3" />
          </Button>

          <Button
            size="sm"
            variant="secondary"
            className={`h-8 px-2 rounded-md transition-colors ${
              isLiked 
                ? "bg-[#e50914] text-white hover:bg-[#f6121d]" 
                : "bg-zinc-600/80 text-white hover:bg-zinc-600"
            }`}
            onClick={handleLike}
          >
            <Heart className={`w-3 h-3 ${isLiked ? "fill-current" : ""}`} />
          </Button>

          <Button
            size="sm"
            variant="secondary"
            className="bg-zinc-600/80 text-white hover:bg-zinc-600 h-8 px-2 rounded-md"
            onClick={(e) => {
              e.stopPropagation();
              // Show more info
            }}
          >
            <Info className="w-3 h-3" />
          </Button>
        </div>

        {/* Selection Indicator */}
        {selected && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-600 text-white border-none text-xs">
              선택됨
            </Badge>
          </div>
        )}
      </motion.div>

      {/* Focus Ring for Keyboard Navigation */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-focus:opacity-100 ring-2 ring-[#e50914] ring-offset-2 ring-offset-[#141414] transition-opacity duration-200 pointer-events-none" />
    </motion.div>
  );
}