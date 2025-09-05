'use server';

import { supabaseAdmin, isSupabaseConnected } from '@/lib/supabase';
import type { Content } from '@/lib/supabase';

// Mock 데이터 (개발 모드용) - TMDb API에서 가져온 실제 데이터
const mockContents: Content[] = [
  // 영화들 (40개)
  {
    id: '1',
    kind: 'movie',
    title: '우주전쟁',
    summary: '전설적인 동명 소설을 새롭게 재해석한 이번 작품은 거대한 침공의 서막을 알린다. 에바 롱고리아와 전설적인 래퍼이자 배우 아이스 큐브, 그리고 마이클 오닐과 이만 벤슨이 합류해, 기...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/yvirUYrva23IudARHn3mMGVxWqM.jpg',
    size_mb: 3763,
    is_active: true,
    created_at: '2025-09-04T21:25:24.291Z'
  },
  {
    id: '2',
    kind: 'movie',
    title: 'F1 더 무비',
    summary: '한때 주목받는 유망주였지만 끔찍한 사고로 F1®에서 우승하지 못하고 한순간에 추락한 드라이버 소니 헤이스. 그의 오랜 동료인 루벤 세르반테스에게 레이싱 복귀를 제안받으며 최하위 팀...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/p6t8zioyQSWHCt0GRnRgsQrb8zx.jpg',
    size_mb: 7856,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '3',
    kind: 'movie',
    title: '노바디 2',
    summary: '가족과 소홀해지는 걸 느낀 허치. 오랜만에 가족들과 떠나는 여름 휴가지는 유년 시절의 추억이 깃든 플러머빌. 꿀 같은 휴식을 꿈꿨지만 평온은 온데간데없고… 사건만 터지는데. 일도 ...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/vBKQuGX0nrx9p8H3j3GGojDYoKH.jpg',
    size_mb: 6585,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '4',
    kind: 'movie',
    title: '총알 탄 사나이',
    summary: '단 한 사람만이 경찰 특공대를 이끌고 세상을 구할 특별한 기술을 지녔다… 그는 바로 프랭크 드레빈이다....',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/aq0JMbmSfPwG8JvAzExJPrBHqmG.jpg',
    size_mb: 7323,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '5',
    kind: 'movie',
    title: '슈퍼맨',
    summary: '슈퍼맨은 오늘도 세계 곳곳의 위협에 맞서 싸우지만, 시민들의 반응은 극과 극으로 갈린다. 한편, 렉스 루터는 슈퍼맨을 무너뜨릴 비밀을 손에 넣고 역대 최강의 슈퍼-빌런들과 함께 총...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/kCXGCEsDqjzWJVDyHgBUg0AMetT.jpg',
    size_mb: 6246,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '6',
    kind: 'movie',
    title: '쥬라기 월드: 새로운 시작',
    summary: '지구 최상위 포식자가 된 공룡들이 인간 세상으로 나온 5년 후, 인간과 공룡의 위태로운 공존이 이어지는 가운데 인류를 구할 신약 개발을 위해 육지, 하늘, 바다를 지배하는 가장 거...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/ygr4hE8Qpagv8sxZbMw1mtYkcQE.jpg',
    size_mb: 7306,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '7',
    kind: 'movie',
    title: '미션 임파서블: 파이널 레코닝',
    summary: '디지털상의 모든 정보를 통제할 수 있는 사상 초유의 무기로 인해 전 세계 국가와 조직의 기능이 마비되고, 인류 전체가 위협받는 절체절명의 위기가 찾아온다. 이를 막을 수 있는 건 ...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/5Zxdorl5TharlI9S47YxoKzGCsi.jpg',
    size_mb: 3339,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '8',
    kind: 'movie',
    title: '극장판 귀멸의 칼날: 무한성편 제 1장 아카자 재래',
    summary: '혈귀로 변해버린 여동생 네즈코를 인간으로 되돌리기 위해 혈귀를 사냥하는 조직인 《귀살대》에 입대한 카마도 탄지로. 입대 후 동료인 아가츠마 젠이츠, 하시비라 이노스케와 함께 많은 ...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/m6Dho6hDCcL5KI8mOQNemZAedFI.jpg',
    size_mb: 5098,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '9',
    kind: 'movie',
    title: '발레리나',
    summary: '살해당한 아버지의 복수를 원하는 이브는 전설적인 킬러 존 윅을 배출한 암살자 양성 조직 루스카 로마에서 혹독한 훈련을 거쳐 발레리나이자 킬러로 성장한다. 아버지의 죽음에 얽힌 자들...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/f9iSnN9yiedMgjGX4wQnHk3GZpB.jpg',
    size_mb: 4881,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '10',
    kind: 'movie',
    title: '썬더볼츠*',
    summary: '어벤져스가 사라진 후, 세계 최대의 위협과 마주한 세상을 구하기 위해 전직 스파이, 암살자, 살인 청부 업자 등 마블의 별난 놈들이 펼치는 예측불허 팀플레이를 담은 액션 블록버스터...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/1lI4iDsaVnOnnZPI9igWkL8jHPL.jpg',
    size_mb: 6501,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '11',
    kind: 'movie',
    title: '28년 후',
    summary: '28년 전 생물학 무기 연구소에서 세상을 재앙으로 몰아넣은 바이러스가 유출된 후, 일부 생존자들이 모여 철저히 격리된 채 살아가는 섬 홀리 아일랜드. 이곳에서 태어나 한 번도 섬 ...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/zRo90O0bTKJem1aDgVa6Sm0gthE.jpg',
    size_mb: 4235,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '12',
    kind: 'movie',
    title: '컨저링',
    summary: '1971년 로드 아일랜드, 해리스빌. 페론 가족은 꿈에 그리던 새 집으로 이사를 간다. 물론 1863년에 그 집에서 일어난 끔찍한 살인 사건을 전혀 몰랐다. 또한 그 이후에 일어난...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/pWpTToZ32bG09PaZ1rvYG5mpOyV.jpg',
    size_mb: 4492,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '13',
    kind: 'movie',
    title: '인터스텔라',
    summary: '세계 각국의 정부와 경제가 완전히 붕괴된 미래가 다가온다. 지난 20세기에 범한 잘못이 전 세계적인 식량 부족을 불러왔고, NASA도 해체되었다. 나사 소속 우주비행사였던 쿠퍼는 ...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/evoEi8SBSvIIEveM3V6nCJ6vKj8.jpg',
    size_mb: 5999,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '14',
    kind: 'movie',
    title: '모아나 2',
    summary: '바다를 누볐던 선조들에게서 예기치 못한 부름을 받은 모아나가 마우이와 다시 만나 새로운 선원들과 함께 오랫동안 잊혀진 멀고 위험한 바다 너머로 떠나는 특별한 모험을 담은 이야기...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/hwmwTFtMbzxAWbIOp1RyyiOCyx0.jpg',
    size_mb: 6504,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '15',
    kind: 'movie',
    title: '노바디',
    summary: '비범한 과거를 숨긴 채 남들과 다를 바 없는 평범한 일상을 사는 한 가정의 가장 허치. 매일 출근을 하고, 분리수거를 하고 일과 가정 모두 나름 최선을 다하지만 아들한테는 무시당...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/oXQtH8O7pCvXaDKGB8OAjiPVDi5.jpg',
    size_mb: 3835,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '16',
    kind: 'movie',
    title: '마인크래프트 무비',
    summary: '왕년의 게임 챔피언이었지만 지금은 폐업 직전의 게임샵 주인이 된 개릿과 엄마를 잃고 낯선 동네로 이사 온 남매 헨리와 나탈리, 그리고 그들을 돕는 부동산 중개업자 던....',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/k5aQ2TqKcQFwPoXHkpAGoKNVDLZ.jpg',
    size_mb: 7351,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '17',
    kind: 'movie',
    title: '릴로 & 스티치',
    summary: '보송보송한 파란 솜털, 호기심 가득한 큰 눈, 장난기 가득한 웃음을 가졌지만 가장 위험한 실험체 취급을 받던 스티치는 우주에서 도망쳐 지구의 하와이 섬에 불시착하게 된다. 단짝 친...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/ww7jn7lv1YzTAGd5m0R6CP1VXAs.jpg',
    size_mb: 7849,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '18',
    kind: 'movie',
    title: '웨폰',
    summary: '평범한 수요일, 어느 마을 학교의 같은 반 학생 17명이 등교하지 않는다. 그날 새벽 2시 17분, 잠에서 깬 아이들이 어둠 속으로 달려가 돌아오지 않았기 때문이다. 유일하게 남은...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/4Kk006xbaZ7DUKYrLicM2b3fAWw.jpg',
    size_mb: 4810,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '19',
    kind: 'movie',
    title: '목요일 살인 클럽',
    summary: '억누를 수 없는 4명의 은퇴자들이 재미 삼아 미제 살인 사건을 해결하며 시간을 보내지만, 그들의 평범한 탐정 놀이는 진짜 누가 저지른 범죄인지 알게 되면서 스릴 넘치는 전환점을 맞...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/9EJQVeZagMBepJtbUyLnrY0kDAi.jpg',
    size_mb: 5048,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '20',
    kind: 'movie',
    title: '엘리오',
    summary: '세상 그 어디에서도 소속감을 느끼지 못한 채, 외계인의 납치를 꿈꾸는 외톨이 소년 엘리오. 그러던 어느 날 작은 오해로 인해 지구 대표로 우주에 소환되고, 그곳에서 자신과는 너무도...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/ymd7E8ZRXOfOpJ418rgGtEdVmEN.jpg',
    size_mb: 3749,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  
  // 드라마/TV 시리즈들 (15개)
  {
    id: '78',
    kind: 'drama',
    title: '더 루키',
    summary: '이혼 후 은행 강도를 당한 일을 계기로 LAPD에 지원한 40세의 최고령 신입을 중심으로 펼쳐지는 이야기...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/uyuCMmAxNL3z3fyW4xzefT886Yu.jpg',
    size_mb: 18562,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '79',
    kind: 'drama',
    title: '덱스터',
    summary: '2006년 10월 Showtime에서 방영을 시작한 심리 스릴러. 미국 마이에미 메트로 경찰서의 젊은 법의학자이자 마이애미에서 제일가는 혈흔분석가인 덱스터는, 사실 어릴때 겪은 참...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/q8dWfc4JwQuv3HayIZeO84jAXED.jpg',
    size_mb: 17453,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '88',
    kind: 'drama',
    title: '오징어 게임',
    summary: '빚에 쫓기는 수백 명의 사람들이 서바이벌 게임에 뛰어든다. 거액의 상금으로 새로운 삶을 시작하기 위해. 하지만 모두 승자가 될 순 없는 법. 탈락하는 이들은 치명적인 결과를 각오해...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/yACIAqAkSLkX4coHafpyLWAtQjw.jpg',
    size_mb: 15543,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '87',
    kind: 'drama',
    title: '브레이킹 배드',
    summary: '2008년 1월 AMC에서 방영을 시작한 범죄 스릴러. Breaking Bad는 막가기를 뜻하는 미국 남부 지방의 속어이다. 한때 노벨화학상까지 바라 볼 정도로 뛰어난 과학자였던 ...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    size_mb: 15356,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '85',
    kind: 'drama',
    title: '왕좌의 게임',
    summary: '2011년 4월 HBO에서 방영을 시작한 판타지물. 조지 R.R. 마틴의 얼음과 불의 노래를 원작으로 한다. 웨스테로스 대륙의 7개의 국가와 하위 몇 개의 국가들로 구성된 연맹 국...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/zmK5G0JdkL637VbaVPYFeEQ52qi.jpg',
    size_mb: 12561,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '81',
    kind: 'drama',
    title: '수퍼내추럴',
    summary: '어린 시절, 샘과 딘은 정체를 알 수 없는 악마의 힘의 의해 어머니를 잃는다. 그로 인해, 그들의 아버지는 자식들을 헌터로 키우며, 미국 각지에 흩어져 있는 초자연적인 악과 괴물들...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/dpkz4yiXoaYvYP2WoRP09UmrAh6.jpg',
    size_mb: 12863,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '83',
    kind: 'drama',
    title: '프리즌 브레이크',
    summary: '2005년 8월 FOX에서 방영을 시작한 스릴러. 로욜라 대학에서 건축학을 전공한 후 미들턴 재판소 건축 설계 엔지니어로 근무하던 마이클 스코필드(웬트워스 밀러)는 그의 형인 링컨...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/25CanTqZbSxroa2dqcbtRi7jaQ5.jpg',
    size_mb: 13638,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '84',
    kind: 'drama',
    title: '그레이 아나토미',
    summary: '시애틀에 있는 병원 의사들의 삶에 대한 이야기. 의사로서의 감정과 개인적인 감정에 대한 묘사가 적절히 조화를 이루어 그려진다. 인턴이지만 결국 레지던트가 되는 메러디스 그레이는 시...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/lCUvpSvjAPU82HvJ8XfR74Chv5r.jpg',
    size_mb: 17152,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '89',
    kind: 'drama',
    title: 'NCIS',
    summary: 'NCIS는 미국의 수사드라마 시리즈로 미해군과 해병대 관련 범죄수사를 담당하는 가상의 해군범죄수사대에 관한 드라마....',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/mBcu8d6x6zB1el3MPNl7cZQEQ31.jpg',
    size_mb: 15919,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '95',
    kind: 'drama',
    title: '크리미널 마인드',
    summary: 'FBI 프로파일러로 구성된 정예 팀이 미국에서 가장 뒤틀린 범죄자들의 심리를 분석하고, 범죄를 또 저지르기 전에 다음 수를 예측한다. 팀원들은 함께 성장하며, 이 행동 분석팀은 전...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/A5hvLZpYcpT2GFA3j8LtI6eINFr.jpg',
    size_mb: 10605,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '96',
    kind: 'drama',
    title: '하우스',
    summary: '2004년 11월 FOX에서 방영을 시작한 미스터리 의학 시리즈. 프린스턴 플레인즈보로 대학병원의 진단의학과 과장인 그레고리 하우스는 환자들을 성심성의껏 돌보는 데는 영 꽝인 의사...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/3Cz7ySOQJmqiuTdrc6CY0r65yDI.jpg',
    size_mb: 16910,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '92',
    kind: 'drama',
    title: '쉐임리스',
    summary: '미국 시카고 후미진 마을에서 힘겹게 살고 있는 싱글 대디 프랭크와 총명하고 독립적인 그의 여섯 자녀들의 리얼한 이야기...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/9ZTivNsXHQWVq578CIsvsM5zd08.jpg',
    size_mb: 10503,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '82',
    kind: 'drama',
    title: '로 앤 오더: 성범죄전담반',
    summary: '추악한 성범죄를 수사하는 뉴욕 경찰 성범죄전담수사반의 활약을 그린 드라마....',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/34O6znqnLHAa19mZrQB0sxTDGzH.jpg',
    size_mb: 11862,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '86',
    kind: 'drama',
    title: '피스메이커',
    summary: '평화를 위해서라면 물불 안 가리는 괴팍한 안티히어로 피스메이커. 인류의 운명이 달린 프로젝트 버터플라이에 합류한 그가 은밀한 작전을 펼치며 슈퍼히어로와 슈퍼빌런 그 사이 어딘가에서...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/gGxpw5SiHbM1vqcQzcaUClqrYVV.jpg',
    size_mb: 19794,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
  },
  {
    id: '100',
    kind: 'drama',
    title: '패밀리 가이',
    summary: '로드 아일랜드의 쿼호그라는 도시에서 살아가는 가장 피터, 아내 로이스, 장녀 메그, 차남 크리스, 막내 스튜이, 개 브라이언으로 이루어진 그리핀 가족과 그 주변인들의 일상을 다루고...',
    thumbnail_url: 'https://image.tmdb.org/t/p/w500/1pbtcqNDKeWErfsDQo82pTPXQjT.jpg',
    size_mb: 10865,
    is_active: true,
    created_at: '2025-09-04T21:25:24.292Z'
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