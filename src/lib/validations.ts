import { z } from 'zod';

// 콘텐츠 종류
export const contentKinds = ['movie', 'drama', 'show', 'kpop', 'doc'] as const;

// 콘텐츠 스키마
export const contentSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(contentKinds),
  title: z.string().min(1, '제목은 필수입니다').max(100, '제목은 100자 이하여야 합니다'),
  summary: z.string().min(1, '설명은 필수입니다').max(500, '설명은 500자 이하여야 합니다'),
  thumbnail_url: z.string().url('올바른 URL 형식이어야 합니다'),
  size_mb: z.number().min(1, '용량은 1MB 이상이어야 합니다').max(50000, '용량은 50GB 이하여야 합니다'),
  is_active: z.boolean().default(true),
  created_at: z.string(),
});

// 미디어팩 생성 스키마
export const createPackSchema = z.object({
  name: z
    .string()
    .min(1, '미디어팩 이름은 필수입니다')
    .max(20, '미디어팩 이름은 20자 이하여야 합니다')
    .regex(/^[a-zA-Z0-9가-힣\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/, '허용되지 않는 문자가 포함되어 있습니다'),
  
  message: z
    .string()
    .min(1, '응원 메시지는 필수입니다')
    .max(50, '응원 메시지는 50자 이하여야 합니다'),
  
  selectedContentIds: z
    .array(z.string().min(1, '올바른 콘텐츠 ID가 아닙니다'))
    .min(3, '최소 3개의 콘텐츠를 선택해야 합니다')
    .max(20, '최대 20개까지 선택할 수 있습니다'),
});

// 미디어팩 스키마
export const packSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  message: z.string(),
  serial: z.number().int().positive(),
  share_slug: z.string().min(10).max(10),
  og_image_url: z.string().url().nullable(),
  created_at: z.string(),
});

// 용량 체크를 위한 스키마
export const capacityCheckSchema = z.object({
  selectedContentIds: z.array(z.string().min(1)),
  targetCapacityGB: z.enum(['16', '32']).default('16'),
});

// 공유 URL 검증 스키마
export const shareUrlSchema = z.object({
  slug: z.string().min(10).max(10, '올바른 공유 링크가 아닙니다'),
});

// 콘텐츠 필터 스키마
export const contentFilterSchema = z.object({
  kind: z.enum(contentKinds).optional(),
  search: z.string().max(100, '검색어는 100자 이하여야 합니다').optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// 관리자 로그인 스키마
export const adminLoginSchema = z.object({
  token: z.string().min(1, '토큰을 입력해주세요'),
});

// OG 이미지 생성 스키마
export const ogImageSchema = z.object({
  slug: z.string().min(10).max(10),
  title: z.string().max(20),
  message: z.string().max(50),
  serial: z.number().int().positive(),
  thumbnails: z.array(z.string().url()).max(4), // 최대 4개의 썸네일
});

// 타입 추출
export type ContentKind = z.infer<typeof contentSchema>['kind'];
export type CreatePackData = z.infer<typeof createPackSchema>;
export type ContentFilter = z.infer<typeof contentFilterSchema>;
export type AdminLogin = z.infer<typeof adminLoginSchema>;
export type OgImageData = z.infer<typeof ogImageSchema>;

// 유틸리티 함수들
export function validateContentIds(ids: string[]): boolean {
  return ids.every(id => z.string().min(1).safeParse(id).success);
}

export function calculateTotalSize(contents: { size_mb: number }[]): number {
  return contents.reduce((total, content) => total + content.size_mb, 0);
}

export function formatFileSize(sizeInMB: number): string {
  if (sizeInMB >= 1024) {
    return `${(sizeInMB / 1024).toFixed(1)}GB`;
  }
  return `${sizeInMB}MB`;
}

export function getCapacityInMB(capacityGB: '16' | '32'): number {
  return parseInt(capacityGB) * 1024;
}

export function isCapacityExceeded(totalSizeMB: number, targetCapacityGB: '16' | '32'): boolean {
  return totalSizeMB > getCapacityInMB(targetCapacityGB);
}

export function getContentKindLabel(kind: ContentKind): string {
  const labels: Record<ContentKind, string> = {
    movie: '영화',
    drama: '드라마',
    show: '예능',
    kpop: 'K-POP',
    doc: '다큐멘터리',
  };
  return labels[kind] || kind;
}

export function generateShareUrl(baseUrl: string, slug: string): string {
  return `${baseUrl}/pack/${slug}`;
}

export function generateOgImageUrl(baseUrl: string, slug: string): string {
  return `${baseUrl}/api/og?slug=${slug}`;
}