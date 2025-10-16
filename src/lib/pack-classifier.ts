// 미디어 팩 유형 분류 로직

export type PackType = '재미형' | '정보형' | '동기부여형' | '종합형' | '유형없음';

export interface PackTypeInfo {
  type: PackType;
  icon: string;
  color: string;
  description: string;
  percentage: number;
}

interface ContentCounts {
  movie: number;
  drama: number;
  show: number;
  doc: number;
  music: number;
}

// 분류 기준 비율 (65%)
const CLASSIFICATION_THRESHOLD = 0.65;

/**
 * 선택된 콘텐츠를 기반으로 미디어 팩 유형을 분류합니다
 * @param selectedContentIds - 선택된 콘텐츠 ID 배열
 * @returns 분류된 팩 유형 정보
 */
export function classifyPackType(selectedContentIds: string[]): PackTypeInfo {
  // 콘텐츠 개수 집계
  const counts: ContentCounts = {
    movie: 0,
    drama: 0,
    show: 0,
    doc: 0,
    music: 0
  };

  // ID 기반으로 콘텐츠 타입 추출
  selectedContentIds.forEach(id => {
    if (id.startsWith('movie-')) {
      counts.movie++;
    } else if (id.startsWith('tv-')) {
      // TV는 드라마/예능/다큐 모두 포함 가능
      // 정확한 분류를 위해서는 실제 콘텐츠 데이터 필요
      // 여기서는 간단히 드라마로 분류
      counts.drama++;
    } else {
      // Spotify 트랙 (음악)
      counts.music++;
    }
  });

  return classifyByContentCounts(counts);
}

/**
 * 콘텐츠 타입별 개수를 기반으로 유형을 분류합니다
 * @param counts - 콘텐츠 타입별 개수
 * @returns 분류된 팩 유형 정보
 */
export function classifyByContentCounts(counts: ContentCounts): PackTypeInfo {
  const { movie, drama, show, doc, music } = counts;

  // 그룹별 점수 계산
  const funScore = movie + drama + show; // 재미 그룹
  const infoScore = doc; // 정보 그룹
  const motivationScore = music; // 동기부여 그룹
  const totalCount = funScore + infoScore + motivationScore;

  // 예외 처리: 선택된 콘텐츠가 없는 경우
  if (totalCount === 0) {
    return {
      type: '유형없음',
      icon: '❓',
      color: 'gray',
      description: '선택된 콘텐츠가 없습니다',
      percentage: 0
    };
  }

  // 유형 분류 (순차적으로 확인)
  const funPercentage = funScore / totalCount;
  const infoPercentage = infoScore / totalCount;
  const motivationPercentage = motivationScore / totalCount;

  // 재미형 (65% 이상)
  if (funPercentage >= CLASSIFICATION_THRESHOLD) {
    return {
      type: '재미형',
      icon: '🎬',
      color: 'blue',
      description: '영화와 드라마로 채운 희망의 선물입니다. 북한 주민들에게 즐거움과 위로를 전할 수 있어요.',
      percentage: Math.round(funPercentage * 100)
    };
  }

  // 정보형 (65% 이상)
  if (infoPercentage >= CLASSIFICATION_THRESHOLD) {
    return {
      type: '정보형',
      icon: '📚',
      color: 'green',
      description: '다큐멘터리로 구성된 지식의 선물입니다. 북한 주민들에게 세상에 대한 진실을 전할 수 있어요.',
      percentage: Math.round(infoPercentage * 100)
    };
  }

  // 동기부여형 (65% 이상)
  if (motivationPercentage >= CLASSIFICATION_THRESHOLD) {
    return {
      type: '동기부여형',
      icon: '🎵',
      color: 'purple',
      description: '음악으로 가득한 희망의 선물입니다. 북한 주민들에게 힘과 용기를 전할 수 있어요.',
      percentage: Math.round(motivationPercentage * 100)
    };
  }

  // 종합형 (모든 그룹이 65% 미만)
  return {
    type: '종합형',
    icon: '🌈',
    color: 'orange',
    description: '영화, 음악, 지식이 조화롭게 담긴 선물입니다. 북한 주민들에게 다양한 감동을 전할 수 있어요.',
    percentage: Math.round(Math.max(funPercentage, infoPercentage, motivationPercentage) * 100)
  };
}

/**
 * Content 객체 배열을 받아서 유형을 분류합니다
 */
export function classifyByContents(contents: Array<{ id: string; kind?: string }>): PackTypeInfo {
  const counts: ContentCounts = {
    movie: 0,
    drama: 0,
    show: 0,
    doc: 0,
    music: 0
  };

  contents.forEach(content => {
    // kind 속성이 있으면 직접 사용
    if (content.kind) {
      if (content.kind === 'movie') counts.movie++;
      else if (content.kind === 'drama') counts.drama++;
      else if (content.kind === 'show') counts.show++;
      else if (content.kind === 'doc') counts.doc++;
      else if (content.kind === 'kpop') counts.music++;
    }
    // kind가 없으면 ID로 추측
    else if (content.id.startsWith('movie-')) {
      counts.movie++;
    } else if (content.id.startsWith('tv-')) {
      counts.drama++;
    } else {
      counts.music++;
    }
  });

  return classifyByContentCounts(counts);
}
