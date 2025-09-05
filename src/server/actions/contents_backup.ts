'use server';

import { supabaseAdmin, isSupabaseConnected } from '@/lib/supabase';
import type { Content } from '@/lib/supabase';

// Mock 데이터 (개발 모드용) - TMDb API에서 가져온 실제 데이터
const mockContents: Content[] = [
  {
    id: '1',
    kind: 'movie',
    title: '우주전쟁',
    summary: '전설적인 동명 소설을 새롭게 재해석한 이번 작품은 거대한 침공의 서막을 알린다. 에바 롱고리아와 전설적인 래퍼이자 배우 아이스 큐브, 그리고 마이클 오닐과 이만 벤슨이 합류해, 기...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/yvirUYrva23IudARHn3mMGVxWqM.jpg',
    size_mb: 3052,
    is_active: true,
    created_at: '2025-09-04T21:16:09.277Z'
  },
  {
    id: '2',
    kind: 'movie',
    title: 'F1 더 무비',
    summary: '한때 주목받는 유망주였지만 끔찍한 사고로 F1®에서 우승하지 못하고 한순간에 추락한 드라이버 소니 헤이스. 그의 오랜 동료인 루벤 세르반테스에게 레이싱 복귀를 제안받으며 최하위 팀...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/p6t8zioyQSWHCt0GRnRgsQrb8zx.jpg',
    size_mb: 3615,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '3',
    kind: 'movie',
    title: '노바디 2',
    summary: '가족과 소홀해지는 걸 느낀 허치. 오랜만에 가족들과 떠나는 여름 휴가지는 유년 시절의 추억이 깃든 플러머빌. 꿀 같은 휴식을 꿈꿨지만 평온은 온데간데없고… 사건만 터지는데. 일도 ...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/vBKQuGX0nrx9p8H3j3GGojDYoKH.jpg',
    size_mb: 4218,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '4',
    kind: 'movie',
    title: '총알 탄 사나이',
    summary: '단 한 사람만이 경찰 특공대를 이끌고 세상을 구할 특별한 기술을 지녔다… 그는 바로 프랭크 드레빈이다....',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/aq0JMbmSfPwG8JvAzExJPrBHqmG.jpg',
    size_mb: 5176,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '5',
    kind: 'movie',
    title: '슈퍼맨',
    summary: '슈퍼맨은 오늘도 세계 곳곳의 위협에 맞서 싸우지만, 시민들의 반응은 극과 극으로 갈린다. 한편, 렉스 루터는 슈퍼맨을 무너뜨릴 비밀을 손에 넣고 역대 최강의 슈퍼-빌런들과 함께 총...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/kCXGCEsDqjzWJVDyHgBUg0AMetT.jpg',
    size_mb: 5397,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '6',
    kind: 'movie',
    title: '이니 미니',
    summary: '20세기 스튜디오에서 선사하는 ⟪이니 미니⟫는 십 대 시절 도주 운전을 맡았던 주인공이 갱생 불가인 전 남자 친구의 목숨을 살리기 위해 옛 고용주의 제안을 받아들여 끔찍한 과거 생...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/vuigDEApkQ3y6NSf9nx2WquGXeI.jpg',
    size_mb: 3255,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '7',
    kind: 'movie',
    title: '미션 임파서블: 파이널 레코닝',
    summary: '디지털상의 모든 정보를 통제할 수 있는 사상 초유의 무기로 인해 전 세계 국가와 조직의 기능이 마비되고, 인류 전체가 위협받는 절체절명의 위기가 찾아온다. 이를 막을 수 있는 건 ...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/5Zxdorl5TharlI9S47YxoKzGCsi.jpg',
    size_mb: 7871,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '8',
    kind: 'movie',
    title: '극장판 귀멸의 칼날: 무한성편 제 1장 아카자 재래',
    summary: '혈귀로 변해버린 여동생 네즈코를 인간으로 되돌리기 위해 혈귀를 사냥하는 조직인 《귀살대》에 입대한 카마도 탄지로. 입대 후 동료인 아가츠마 젠이츠, 하시비라 이노스케와 함께 많은 ...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/m6Dho6hDCcL5KI8mOQNemZAedFI.jpg',
    size_mb: 5179,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '9',
    kind: 'movie',
    title: '투게더',
    summary: '관계의 한계에 부딪힌 오래된 커플 팀과 밀리. 어느 날 서로의 몸이 점점 붙어버리기 시작하는데…...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/ivWOD2MiC1HywIPBF2Ei2CN3ywY.jpg',
    size_mb: 6292,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '10',
    kind: 'movie',
    title: '쥬라기 월드: 새로운 시작',
    summary: '지구 최상위 포식자가 된 공룡들이 인간 세상으로 나온 5년 후, 인간과 공룡의 위태로운 공존이 이어지는 가운데 인류를 구할 신약 개발을 위해 육지, 하늘, 바다를 지배하는 가장 거...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/ygr4hE8Qpagv8sxZbMw1mtYkcQE.jpg',
    size_mb: 5138,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '11',
    kind: 'movie',
    title: '배드 가이즈 2',
    summary: '착하게 살기 위해 무지하게 애쓰는 자타공인 최고의 나쁜 녀석들이 새롭게 등장한 \'배드 걸즈\'로 인해 일생일대의 글로벌 범죄 작전에 휘말리며 벌어지는 범죄오락액션 블록버스터...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/1oG69MtmZGovhho0pPgRY9d1qrU.jpg',
    size_mb: 7776,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '12',
    kind: 'movie',
    title: '케이팝 데몬 헌터스',
    summary: '케이팝 슈퍼스타 루미, 미라, 조이. 매진을 기록하는 대형 스타디움 공연이 없을 때면 이들은 또 다른 활동에 나선다. 바로 비밀 능력을 이용해 팬들을 초자연적 위협으로부터 보호하는...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/k7DCwySN2XGZ67qcz2ADbgmGwzG.jpg',
    size_mb: 4392,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '13',
    kind: 'movie',
    title: '나는 네가 지난 여름에 한 일을 알고 있다',
    summary: '치명적인 교통사고를 일으킨 다섯 명의 친구들이 잘못을 숨기기로 결심한다. 그로부터 1년 후, 그들의 과거가 다시 그들을 찾아오고, 누군가가 그들이 지난 여름에 저지른 일을 알고 있...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/V3w8ol6OT1vrQwc2OHiS2YBa6Z.jpg',
    size_mb: 7713,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '14',
    kind: 'movie',
    title: '그렇게 난 갱스터가 되었다',
    summary: '무소불위의 힘을 좇아 암흑가에서 차근차근 입지를 다져온 야심 찬 갱스터. 무장 강도, 마약 거래 등 온갖 범죄를 발판 삼아 정점을 향해 올라가던 중, 마침내 큰물에서 놀 기회를 거...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/kXfR0pprbVDKejYvppgO1U7XN4C.jpg',
    size_mb: 3221,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '15',
    kind: 'movie',
    title: '드래곤 길들이기',
    summary: '수백년간 지속되어온 바이킹과 드래곤의 전쟁. 드래곤을 없애는 것이 삶의 모든 목적인 바이킹들과 다른 신념을 가진 \'히컵\'은 무리 속에 속하지 못하고 족장인 아버지에게도 인정받지 못...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/8vywrRg1wrY4fo7EqgrFmUJgchG.jpg',
    size_mb: 4980,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '16',
    kind: 'movie',
    title: '스트라이킹 레스큐',
    summary: '평범한 시민 바이 안(토니 자)의 아내와 딸이 마약 밀매범들에게 무참하게 살해 당하자 분노에 찬 바이 안은 조직 보스의 딸을 납치하며 복수를 꾀하는데.....',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/npLvwol2oZGLc0VeYYxJ72KXYwY.jpg',
    size_mb: 3760,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '17',
    kind: 'movie',
    title: '베테랑',
    summary: '아프가니스탄 전쟁에 참전했던 군인이 마약상과 정보기관이 연루된 음모를 파헤친다....',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/i1gSsXTWtCmNQArmIeUpAysHEmi.jpg',
    size_mb: 3871,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '18',
    kind: 'movie',
    title: '웨폰',
    summary: '평범한 수요일, 어느 마을 학교의 같은 반 학생 17명이 등교하지 않는다. 그날 새벽 2시 17분, 잠에서 깬 아이들이 어둠 속으로 달려가 돌아오지 않았기 때문이다. 유일하게 남은...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/4Kk006xbaZ7DUKYrLicM2b3fAWw.jpg',
    size_mb: 4648,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '19',
    kind: 'movie',
    title: '목요일 살인 클럽',
    summary: '억누를 수 없는 4명의 은퇴자들이 재미 삼아 미제 살인 사건을 해결하며 시간을 보내지만, 그들의 평범한 탐정 놀이는 진짜 누가 저지른 범죄인지 알게 되면서 스릴 넘치는 전환점을 맞...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/9EJQVeZagMBepJtbUyLnrY0kDAi.jpg',
    size_mb: 5268,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  },
  {
    id: '20',
    kind: 'movie',
    title: '엘리오',
    summary: '세상 그 어디에서도 소속감을 느끼지 못한 채, 외계인의 납치를 꿈꾸는 외톨이 소년 엘리오. 그러던 어느 날 작은 오해로 인해 지구 대표로 우주에 소환되고, 그곳에서 자신과는 너무도...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/ymd7E8ZRXOfOpJ418rgGtEdVmEN.jpg',
    size_mb: 7565,
    is_active: true,
    created_at: '2025-09-04T21:16:09.278Z'
  }
];

export async function listContents(kind?: string): Promise<Content[]> {
  try {
    if (!isSupabaseConnected) {
      // Mock 데이터 사용
      let filtered = mockContents.filter(c => c.is_active);
      if (kind) {
        filtered = filtered.filter(c => c.kind === kind);
      }
      return filtered;
    }

    let query = supabaseAdmin
      .from('contents')
      .select('*')
      .eq('is_active', true)
      .order('title', { ascending: true });

    if (kind) {
      query = query.eq('kind', kind);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contents:', error);
      throw new Error('콘텐츠를 불러오는데 실패했습니다.');
    }

    return data || [];
  } catch (error) {
    console.error('listContents error:', error);
    throw new Error('콘텐츠를 불러오는데 실패했습니다.');
  }
}

export async function getContentsByIds(ids: string[]): Promise<Content[]> {
  try {
    if (!isSupabaseConnected) {
      // Mock 데이터 사용
      return mockContents.filter(c => ids.includes(c.id) && c.is_active);
    }

    const { data, error } = await supabaseAdmin
      .from('contents')
      .select('*')
      .in('id', ids)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching contents by IDs:', error);
      throw new Error('선택한 콘텐츠를 불러오는데 실패했습니다.');
    }

    return data || [];
  } catch (error) {
    console.error('getContentsByIds error:', error);
    throw new Error('선택한 콘텐츠를 불러오는데 실패했습니다.');
  }
}

export async function getContentStats() {
  try {
    const { data, error } = await supabaseAdmin
      .from('contents')
      .select('kind')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching content stats:', error);
      return { total: 0, byKind: {} };
    }

    const total = data.length;
    const byKind = data.reduce((acc: Record<string, number>, content: { kind: string }) => {
      acc[content.kind] = (acc[content.kind] || 0) + 1;
      return acc;
    }, {});

    return { total, byKind };
  } catch (error) {
    console.error('getContentStats error:', error);
    return { total: 0, byKind: {} };
  }
}