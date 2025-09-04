# 🚀 배포 가이드

## Vercel 배포 (추천)

### 방법 1: GitHub 연동 (가장 쉬움)
1. [Vercel](https://vercel.com)에 GitHub으로 로그인
2. "New Project" 클릭
3. GitHub 저장소 `dhmun/seed` 선택
4. "Deploy" 클릭
5. 자동으로 `https://seed-xxx.vercel.app` URL 생성

### 방법 2: 원클릭 배포
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dhmun/seed)

### 방법 3: CLI 배포
```bash
# Vercel CLI 로그인 (브라우저에서 GitHub 인증)
vercel login

# 프로젝트 배포
vercel --prod
```

## Netlify 배포

### 방법 1: 원클릭 배포
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/dhmun/seed)

### 방법 2: CLI 배포
```bash
npm run deploy:netlify
```

## Railway 배포

### 방법 1: GitHub 연동
1. [Railway](https://railway.app)에 로그인
2. "New Project" → "Deploy from GitHub repo"
3. `dhmun/seed` 저장소 선택
4. 자동 배포

### 방법 2: 원클릭 배포
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/qzK4Pp)

## 환경 변수 설정

모든 플랫폼에서 다음 환경 변수들을 설정하세요:

### 필수 환경 변수
```env
NEXT_PUBLIC_SITE_URL=https://your-app-url.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 선택 환경 변수
```env
ADMIN_TOKEN=your_secure_admin_token
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_javascript_key
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## 배포 확인

배포 후 다음을 확인하세요:

1. **홈페이지 로드**: 메인 페이지가 정상 표시되는지
2. **4단계 플로우**: 미디어팩 생성 과정이 작동하는지
3. **공유 기능**: 소셜 공유 버튼들이 동작하는지
4. **OG 이미지**: 소셜 미디어에서 미리보기가 표시되는지

## 문제 해결

### 빌드 오류시
```bash
npm run type-check  # 타입 오류 확인
npm run lint       # 코드 품질 확인
npm run build      # 로컬 빌드 테스트
```

### 환경 변수 오류시
- Supabase URL이 올바른지 확인
- API 키가 유효한지 확인
- 환경 변수명에 오타가 없는지 확인

### 페이지 404 오류시
- basePath 설정 확인
- 라우팅 경로 확인
- 정적 파일 경로 확인