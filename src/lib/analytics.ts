// 간단한 분석 유틸리티 함수들

export async function trackEvent(action: string, data: Record<string, string | number> = {}) {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        ...data,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    // 추적 실패해도 사용자 경험에 영향주지 않음
    console.warn('Analytics tracking failed:', error);
  }
}

export async function trackShare(platform: string, packSlug: string) {
  return trackEvent('share', { platform, packSlug });
}

export async function trackPackView(packSlug: string) {
  return trackEvent('view', { packSlug });
}

export async function trackContentSelection(contentId: string, contentTitle: string) {
  return trackEvent('content_select', { contentId, contentTitle });
}

export async function trackPackCreation(packSlug: string, serial: number) {
  return trackEvent('pack_create', { packSlug, serial });
}