import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Content } from '@/lib/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 파일 크기 포맷팅 함수
export function formatFileSize(sizeInMB: number): string {
  if (sizeInMB >= 1000) {
    return `${(sizeInMB / 1000).toFixed(1)} GB`;
  }
  return `${sizeInMB} MB`;
}

// 총 용량 계산 함수
export function calculateTotalSize(contents: Content[]): number {
  return contents.reduce((total, content) => total + content.size_mb, 0);
}

// SD카드 용량을 MB로 변환
export function getCapacityInMB(capacity: '32' | '64'): number {
  return capacity === '32' ? 32 * 1000 : 64 * 1000; // GB to MB
}

// 콘텐츠 종류 라벨 반환
export function getContentKindLabel(kind: Content['kind']): string {
  const labels = {
    movie: '영화',
    drama: '드라마',
    show: '예능',
    kpop: 'K-POP',
    doc: '다큐'
  };
  return labels[kind] || kind;
}
