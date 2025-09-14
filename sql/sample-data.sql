-- Sample data: 25 contents (5 each for movie, drama, show, kpop, doc)
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING)

insert into contents (id, kind, title, summary, thumbnail_url, size_mb, is_active)
values
  -- Movies
  ('seed-m-001','movie','바람의 도시','거친 도시에서 살아남으려는 형사 이야기','https://picsum.photos/seed/seed-m-001/300/400',5200,true),
  ('seed-m-002','movie','시간의 정원','시간을 되돌리는 정원에서 벌어지는 미스터리','https://picsum.photos/seed/seed-m-002/300/400',6100,true),
  ('seed-m-003','movie','은하수 건너','우주 이민선에서 벌어지는 휴먼 드라마','https://picsum.photos/seed/seed-m-003/300/400',7300,true),
  ('seed-m-004','movie','섬의 비밀','무인도에 숨겨진 고대 유적을 둘러싼 모험','https://picsum.photos/seed/seed-m-004/300/400',4800,true),
  ('seed-m-005','movie','마지막 승부','전설의 선수가 은퇴를 앞두고 치르는 마지막 경기','https://picsum.photos/seed/seed-m-005/300/400',6900,true),

  -- Dramas
  ('seed-d-001','drama','봄날의 약속','오래된 친구들이 다시 만나는 힐링 드라마','https://picsum.photos/seed/seed-d-001/300/400',3600,true),
  ('seed-d-002','drama','푸른 밤','라디오를 통해 서로 위로하는 사람들의 이야기','https://picsum.photos/seed/seed-d-002/300/400',4100,true),
  ('seed-d-003','drama','골목의 영웅','동네를 지키는 평범한 청년의 성장기','https://picsum.photos/seed/seed-d-003/300/400',3900,true),
  ('seed-d-004','drama','달빛 연가','시대를 초월한 로맨스 판타지','https://picsum.photos/seed/seed-d-004/300/400',4200,true),
  ('seed-d-005','drama','작은 기적','매일의 작은 기적으로 바뀌는 삶','https://picsum.photos/seed/seed-d-005/300/400',3500,true),

  -- Shows
  ('seed-s-001','show','세계일주 버킷리스트','여행 버킷리스트를 실현하는 예능','https://picsum.photos/seed/seed-s-001/300/400',2800,true),
  ('seed-s-002','show','도전! 셰프','아마추어 셰프들의 치열한 요리 경연','https://picsum.photos/seed/seed-s-002/300/400',3000,true),
  ('seed-s-003','show','미스터리 방탈출','추리를 통해 탈출하는 리얼리티 쇼','https://picsum.photos/seed/seed-s-003/300/400',2900,true),
  ('seed-s-004','show','음악 캠프','아티스트의 라이브와 토크가 함께하는 쇼','https://picsum.photos/seed/seed-s-004/300/400',3100,true),
  ('seed-s-005','show','장인의 손맛','세상 모든 손맛을 찾아 떠나는 여정','https://picsum.photos/seed/seed-s-005/300/400',2700,true),

  -- K-POP
  ('seed-k-001','kpop','STARLIGHT - NOVA','신예 그룹 NOVA의 타이틀 곡','https://picsum.photos/seed/seed-k-001/300/400',180,true),
  ('seed-k-002','kpop','Runaway - SOL','솔로 아티스트 SOL의 에너지 넘치는 트랙','https://picsum.photos/seed/seed-k-002/300/400',160,true),
  ('seed-k-003','kpop','Bloom - AURA','봄을 닮은 산뜻한 사운드','https://picsum.photos/seed/seed-k-003/300/400',150,true),
  ('seed-k-004','kpop','Gravity - VISION','강렬한 퍼포먼스를 담은 싱글','https://picsum.photos/seed/seed-k-004/300/400',170,true),
  ('seed-k-005','kpop','Echo - LUMEN','서정적인 멜로디와 보컬의 조화','https://picsum.photos/seed/seed-k-005/300/400',190,true),

  -- Documentaries
  ('seed-doc-001','doc','바다의 기록','깊은 바다가 품은 생명의 이야기','https://picsum.photos/seed/seed-doc-001/300/400',4200,true),
  ('seed-doc-002','doc','우주의 지도','우주를 탐험하는 인류의 기록','https://picsum.photos/seed/seed-doc-002/300/400',5100,true),
  ('seed-doc-003','doc','사라진 도시','잊혀진 고대 문명을 추적하다','https://picsum.photos/seed/seed-doc-003/300/400',4600,true),
  ('seed-doc-004','doc','숲의 시간','숲의 생태계를 기록한 다큐멘터리','https://picsum.photos/seed/seed-doc-004/300/400',3900,true),
  ('seed-doc-005','doc','지구의 숨','지구 기후의 변화와 대응','https://picsum.photos/seed/seed-doc-005/300/400',4400,true)
on conflict (id) do nothing;

