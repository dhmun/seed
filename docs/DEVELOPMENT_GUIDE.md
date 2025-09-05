# 📋 희망의 씨앗 캠페인 개발 가이드

> **Notion 복사용 템플릿** - 이 문서를 복사해서 Notion에 붙여넣어 사용하세요.

---

## 📜 마스터 패치 규칙 v2 (Master Patch Rule v2)

**목표**: 코드 변경의 안정성, 보안성, 추적성을 보장하며, 테스트와 리뷰를 반드시 거쳐 배포한다.

### 🔀 1. 브랜치 원칙
- [ ] 모든 기능은 `main`에서 `feature/기능명` 브랜치로 작업
- [ ] 긴급 수정은 `hotfix/수정명` 브랜치 사용
- [ ] `main` 브랜치 직커밋 **절대 금지**

### 📝 2. 커밋 원칙
- [ ] 논리적 최소 단위로 커밋 작성
- [ ] `feat:`, `fix:`, `refactor:`, `test:` 접두사 사용
- [ ] 커밋 메시지에 Claude Code 크레딧 포함

```bash
# 예시 커밋 메시지
feat: implement TMDB cache system with enhanced search

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 🔄 3. PR 원칙
- [ ] 모든 변경은 PR(Pull Request)로 제출
- [ ] 반드시 리뷰를 받아야 병합 가능
- [ ] PR 제목은 커밋 메시지 규칙 준수

### 🤖 4. CI/CD 원칙
- [ ] PR 생성 시 자동 빌드, 린트, 단위 테스트, e2e 테스트 실행
- [ ] 모든 검증 통과 후에만 병합 가능
- [ ] `npm run build`, `npm run type-check` 성공 필수

### 🚀 5. 배포 원칙
- [ ] `main` 병합 시 CD가 자동 배포
- [ ] 운영 서버 직접 수정 **절대 금지**
- [ ] Vercel/Netlify 자동 배포 활용

### 🔒 6. 보안 원칙
- [ ] TMDb/Spotify API 키는 `.env.local`에 저장
- [ ] `NEXT_PUBLIC_*`는 익명키/URL만 사용
- [ ] 서비스 키는 서버 전용 함수에서만 접근
- [ ] API 키 **절대 클라이언트 번들에 포함 금지**

### ✅ 7. 테스트 원칙
- [ ] 백엔드: API 함수 단위 테스트 작성
- [ ] 프론트엔드: 주요 UI 인터랙션 e2e 테스트
- [ ] PR은 최소 테스트 1회 통과 후 병합 가능

---

## 👨‍💻 백엔드 AI 개발자 프롬프트 v2

**당신은 15년 경력의 시니어 백엔드 엔지니어입니다. Node.js, Next.js 서버 액션, Supabase DB 설계에 능숙합니다.**

### 🎯 미션 목표
- 사용자 입력을 받아 TMDb/Spotify API를 실시간 호출
- 결과를 Content 타입으로 변환하여 반환
- 선택된 검색 결과를 Supabase DB에 안전하게 저장

### 🛠 작업 지침

#### 1. 브랜치 생성
```bash
git checkout -b feature/dynamic-media-search
```

#### 2. 실시간 검색 서버 액션 (`src/server/actions/search.ts`)

**TMDb 검색**
```typescript
export async function searchTMDb(query: string): Promise<Content[]> {
  // TMDb multi search API 호출
  // 영화/TV 결과를 Content 형식으로 변환
  // 최대 10개, 썸네일 없는 항목 제외
  // 환경변수: TMDB_API_KEY
}
```

**Spotify 검색**
```typescript
export async function searchSpotify(query: string): Promise<Content[]> {
  // Spotify search API 호출
  // 트랙 결과를 Content 형식으로 변환
  // Client Credentials Flow로 토큰 발급
  // 메모리 캐시로 토큰 재사용
  // 환경변수: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
}
```

#### 3. DB 저장 기능 (`src/server/actions/contents.ts`)

```typescript
export async function addContentToDb(content: Partial<Content>): Promise<Content> {
  // Supabase upsert 사용
  // onConflict: tmdb_id 또는 spotify_id 기준
  // size_mb 랜덤값 생성 (50~500MB)
  // 최종 Content 객체 반환
}
```

#### 4. 커밋/푸시
```bash
git add .
git commit -m "feat(server): implement tmdb & spotify real-time search with db upsert"
git push origin feature/dynamic-media-search
```

---

## 🎨 프론트엔드 AI 개발자 프롬프트 v2

**당신은 15년 경력의 시니어 프론트엔드 엔지니어입니다. React, Next.js, TypeScript, Tailwind CSS로 UI/UX를 구현하세요.**

### 🎯 미션 목표
- 정적 콘텐츠 선택 페이지를 실시간 검색 UI로 개편
- 백엔드의 `searchTMDb`, `searchSpotify`, `addContentToDb` 연동

### 🛠 작업 지침

#### 1. 검색 UI 구현 (`src/app/builder/select/page.tsx`)
- [ ] 기존 정적 목록 코드 삭제
- [ ] 검색 입력창 + 500ms debounce 훅 구현
- [ ] TMDb/Spotify API 동시 호출
- [ ] 통합 검색 결과 그리드 카드 표시

#### 2. 상호작용 구현
- [ ] 카드 클릭 → `addContentToDb` 호출
- [ ] DB 저장 후 선택 상태 업데이트
- [ ] 파란 테두리 + 체크 아이콘 UI

#### 3. 상태 관리
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState<Content[]>([]);
const [selectedContents, setSelectedContents] = useState<Content[]>([]);
const [totalSizeMB, setTotalSizeMB] = useState(0);
```

#### 4. UX 개선
- [ ] 로딩 스피너 표시
- [ ] 검색 결과 없음 메시지
- [ ] 에러 상태 처리
- [ ] 용량 초과 경고

#### 5. 커밋/PR
```bash
git add .
git commit -m "feat(ui): refactor select page into dynamic real-time search"
git push origin feature/dynamic-media-search
# GitHub에서 PR 생성
```

---

## 🚀 현재 프로젝트 상태

### ✅ 완료된 작업
- [x] TMDB 캐시 시스템 구현
- [x] 데이터베이스 스키마 확장 (메타데이터 포함)
- [x] 메모리 기반 캐싱 (30분 TTL)
- [x] REST API 엔드포인트 (페이징, 필터링, 검색)
- [x] UI 개선 (평점, 무한 스크롤, 실시간 검색)
- [x] Next.js 15 호환성 수정

### 🔄 진행 예정
- [ ] Spotify API 통합
- [ ] 실시간 통합 검색 UI
- [ ] 테스트 코드 작성
- [ ] CI/CD 파이프라인 구축

### 📊 기술 스택
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions, Supabase PostgreSQL
- **External APIs**: TMDb API, Spotify Web API
- **Caching**: Memory-based with TTL
- **Deployment**: Vercel (primary), GitHub Pages (static)

---

## 💡 개발 팁

### 환경변수 설정
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
TMDB_API_KEY=your_tmdb_key
SPOTIFY_CLIENT_ID=your_spotify_id
SPOTIFY_CLIENT_SECRET=your_spotify_secret
```

### 주요 명령어
```bash
# 개발 서버 실행
npm run dev

# 타입 체크
npm run type-check

# 빌드 테스트
npm run build

# TMDB 데이터 동기화
npm run sync:tmdb

# 테스트 실행
npm run test
```

---

**📅 마지막 업데이트**: 2025-09-05  
**👨‍💻 작성자**: Claude Code AI Assistant  
**🔗 레포지토리**: [희망의 씨앗 캠페인](https://github.com/your-username/hope-seed-campaign)

---

> 💡 **사용법**: 이 문서를 Notion에 복사한 후, 체크박스를 활용해 작업 진행 상황을 관리하세요!