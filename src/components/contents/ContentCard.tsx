// src/components/contents/ContentCard.tsx
"use client";

import { useState } from 'react';
import { Content } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Plus, Check, Star, Calendar, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentCardProps {
  content: Content;
  selected?: boolean;
  onSelect?: (content: Content) => void;
  onDeselect?: (content: Content) => void;
  showStats?: boolean;
  variant?: 'default' | 'compact';
}

const kindLabels = {
  movie: '영화',
  drama: '드라마',
  show: '예능',
  kpop: 'K-POP',
  doc: '다큐'
};

const kindColors = {
  movie: 'bg-red-500',
  drama: 'bg-blue-500',
  show: 'bg-green-500',
  kpop: 'bg-purple-500',
  doc: 'bg-orange-500'
};

export default function ContentCard({
  content,
  selected = false,
  onSelect,
  onDeselect,
  showStats = true,
  variant = 'default'
}: ContentCardProps) {

  const handleToggleSelect = () => {
    if (selected && onDeselect) {
      onDeselect(content);
    } else if (!selected && onSelect) {
      onSelect(content);
    }
  };

  const formatSize = (sizeInMB: number) => {
    if (sizeInMB >= 1000) {
      return `${(sizeInMB / 1000).toFixed(1)} GB`;
    }
    return `${sizeInMB} MB`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).getFullYear();
    } catch {
      return null;
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
          selected 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
        }`}
        onClick={handleToggleSelect}
      >
        <OptimizedImage
          src={content.thumbnail_url}
          alt={content.title}
          width={64}
          height={80}
          className="w-16 h-20 flex-shrink-0 rounded"
          fallback='/placeholder-poster.jpg'
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                {content.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${kindColors[content.kind]} text-white`}
                >
                  {kindLabels[content.kind]}
                </Badge>
                {showStats && content.vote_average && (
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Star className="w-3 h-3" />
                    {content.vote_average.toFixed(1)}
                  </div>
                )}
              </div>
            </div>
            <Button
              variant={selected ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              {selected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`group relative bg-white dark:bg-zinc-900 rounded-xl border transition-all duration-200 overflow-hidden ${
        selected 
          ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-lg'
      }`}
    >
      {/* 썸네일 이미지 */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <OptimizedImage
          src={content.thumbnail_url}
          alt={content.title}
          width={300}
          height={400}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          fallback='/placeholder-poster.jpg'
        />

        {/* 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* 선택 버튼 */}
        <div className="absolute top-3 right-3">
          <Button
            variant={selected ? "default" : "secondary"}
            size="sm"
            className={`h-8 w-8 p-0 transition-all ${
              selected 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-white/90 hover:bg-white text-zinc-700'
            }`}
            onClick={handleToggleSelect}
          >
            {selected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>

        {/* 종류 배지 */}
        <div className="absolute top-3 left-3">
          <Badge 
            className={`text-xs ${kindColors[content.kind]} text-white border-0`}
          >
            {kindLabels[content.kind]}
          </Badge>
        </div>

        {/* 평점 */}
        {showStats && content.vote_average && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-sm font-medium">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            {content.vote_average.toFixed(1)}
          </div>
        )}
      </div>

      {/* 콘텐츠 정보 */}
      <div className="p-4">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 leading-tight">
          {content.title}
        </h3>
        
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2 leading-relaxed">
          {content.summary}
        </p>

        {showStats && (
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-3">
              {formatDate(content.release_date) && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(content.release_date)}
                </div>
              )}
              <div className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                {formatSize(content.size_mb)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 선택 상태 표시 */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-blue-500/10" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
        </div>
      )}
    </motion.div>
  );
}