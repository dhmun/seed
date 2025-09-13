// TMDB 이미지 최적화 유틸리티

export interface TMDBImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

/**
 * TMDB 이미지 URL을 최적화된 크기로 변환
 */
export function tmdbImageLoader({ src, width, quality }: TMDBImageLoaderParams): string {
  // TMDB 이미지가 아닌 경우 원본 반환
  if (!src.includes('image.tmdb.org')) {
    return src;
  }

  // 요청 크기에 따라 적절한 TMDB 크기 선택
  let tmdbSize = 'w500';
  
  if (width <= 92) tmdbSize = 'w92';
  else if (width <= 154) tmdbSize = 'w154';
  else if (width <= 185) tmdbSize = 'w185';
  else if (width <= 342) tmdbSize = 'w342';
  else if (width <= 500) tmdbSize = 'w500';
  else if (width <= 780) tmdbSize = 'w780';
  else tmdbSize = 'w1280';

  // 기존 크기를 새로운 크기로 교체
  return src.replace(/w\d+/, tmdbSize);
}

/**
 * TMDB 백드롭 이미지 최적화
 */
export function tmdbBackdropLoader({ src, width }: { src: string; width: number }): string {
  if (!src.includes('image.tmdb.org')) {
    return src;
  }

  let tmdbSize = 'w780';
  
  if (width <= 300) tmdbSize = 'w300';
  else if (width <= 780) tmdbSize = 'w780';
  else if (width <= 1280) tmdbSize = 'w1280';
  else tmdbSize = 'original';

  return src.replace(/w\d+/, tmdbSize);
}

/**
 * 이미지 품질 기본값과 fallback URL 관리
 */
export const IMAGE_CONFIG = {
  defaultQuality: 80,
  fallbacks: {
    poster: '/images/placeholder-poster.jpg',
    backdrop: '/images/placeholder-backdrop.jpg',
    profile: '/images/placeholder-profile.jpg'
  },
  tmdbSizes: {
    poster: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780'],
    backdrop: ['w300', 'w780', 'w1280', 'original'],
    profile: ['w45', 'w185', 'h632', 'original']
  }
} as const;