# 희망의 씨앗 캠페인 🌱

미디어 큐레이션으로 전하는 따뜻한 마음. 나만의 미디어팩을 만들어 희망의 씨앗을 나눠보는 참여형 캠페인 웹사이트입니다.

![희망의 씨앗 캠페인](https://via.placeholder.com/1200x600/3B82F6/ffffff?text=희망의+씨앗+캠페인)

## ✨ 주요 기능

### 🎯 **4단계 미디어팩 생성 플로우**
1. **소개 단계** - 캠페인 안내 및 프로세스 설명
2. **콘텐츠 선택** - 카테고리별 콘텐츠 선택 + SD카드 용량 체크 (16GB/32GB)
3. **커스터마이징** - 미디어팩 이름 (20자) + 응원 메시지 (50자) 작성
4. **결과 & 공유** - 완성된 미디어팩 확인 및 다중 플랫폼 공유

### 📱 **다중 플랫폼 공유**
- **카카오톡** - Kakao JS SDK 연동
- **페이스북/트위터(X)** - 공유 URL 기반
- **링크 복사** - 클립보드 API
- **인스타그램 스토리** - 이미지 저장 가이드

### 🖼️ **동적 OG 이미지 생성**
- Vercel OG API 활용한 1200x630 맞춤 이미지
- 선택된 콘텐츠 썸네일 모자이크
- 한글 폰트 지원 (Gowun Dodum)
- SNS 미리보기 최적화

### 🛡️ **안전하고 확장 가능한 아키텍처**
- Next.js 14 App Router + TypeScript
- Supabase PostgreSQL + Row Level Security
- 서버 액션 기반 API
- Zod 스키마 검증

## 🚀 빠른 시작

### 1. 프로젝트 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사하여 `.env.local` 생성:

```bash
cp .env.example .env.local
```

`.env.local`에서 다음 값들을 설정:

```env
# 필수 설정
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 선택 설정
ADMIN_TOKEN=your_secure_admin_token
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_javascript_key
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `database.sql` 파일의 내용을 Supabase SQL Editor에서 실행
3. 환경 변수에 Supabase URL과 API 키 설정

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000에서 확인 가능합니다.

## 📦 프로젝트 구조

```
src/
├── app/                    # App Router 페이지
│   ├── builder/           # 4단계 미디어팩 생성 플로우
│   ├── pack/[slug]/       # 동적 미디어팩 페이지
│   ├── api/og/            # 동적 OG 이미지 생성
│   └── layout.tsx         # 루트 레이아웃
├── components/ui/         # shadcn/ui 컴포넌트
├── lib/                   # 유틸리티 함수
│   ├── supabase.ts       # DB 클라이언트 및 타입
│   └── validations.ts    # Zod 스키마
└── server/actions/        # 서버 액션
    ├── contents.ts       # 콘텐츠 관련
    └── packs.ts         # 미디어팩 관련
```

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary Blue**: #3B82F6 - 신뢰감, 안정감
- **Warm Ivory**: #F8F7F2 - 따뜻함, 포근함  
- **Mint**: #14B8A6 - 희망, 성장
- **Coral**: #F87171 - 따뜻함, 애정

### 타이포그래피
- **본문**: Inter + Noto Sans KR
- **헤드라인**: Gowun Dodum

## 🚀 배포

### Vercel 배포

1. **프로젝트 배포**
   ```bash
   npx vercel --prod
   ```

2. **환경 변수 설정**
   - Vercel 대시보드에서 Environment Variables 설정

## 🧪 개발 및 테스트

```bash
# 빌드 테스트
npm run build

# 타입 체크
npm run type-check

# 린팅
npm run lint
```

## 📊 주요 기술 스택

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI**: shadcn/ui, Lucide React
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Validation**: Zod
- **Styling**: Tailwind CSS v4

---

**희망의 씨앗 캠페인** - 당신의 선택이 누군가에게는 세상의 전부가 될 수 있습니다. 🌱✨
