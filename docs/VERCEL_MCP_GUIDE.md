# Vercel 백엔드 연동 가이드

## 📖 Vercel이란?

**Vercel**은 프론트엔드 프레임워크와 정적 사이트를 위한 클라우드 플랫폼입니다. Serverless Functions를 통해 백엔드 API도 쉽게 구축할 수 있습니다.

## ✅ 현재 프로젝트 상태

- ✅ Vercel CLI 설치됨 (v48.2.9)
- ✅ Vercel 프로젝트 연결됨 (kimbyeong-9s-projects/key-mint)
- ✅ GitHub 저장소 연결됨
- ✅ vercel.json 설정 완료
- ✅ API Functions 구현됨 (auth, user, upload)

## 🔧 초기 설정 (이미 완료됨)

### 1. Vercel CLI 설치

```bash
# npm을 사용하는 경우
npm install -g vercel

# 또는 yarn
yarn global add vercel
```

### 2. Vercel Token 생성

1. Vercel 대시보드 접속: https://vercel.com/account/tokens
2. "Create Token" 버튼 클릭
3. 토큰 이름 입력 (예: "MCP Integration")
4. 적절한 스코프 선택
5. 생성된 토큰 복사

### 3. 환경 변��� 설정

`.env.local` 파일에 Vercel 토큰 추가:

```bash
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

### 4. Vercel Project ID 확인

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결 (처음 한 번만)
vercel link

# Project ID 확인
cat .vercel/project.json
```

## 🚀 Vercel Serverless Functions 사용법

### 기본 구조

Vercel Serverless Functions는 `api/` 디렉토리 내의 파일들을 자동으로 API 엔드포인트로 변환합니다.

```
api/
├── auth/
│   └── google.js       → /api/auth/google
├── user.js             → /api/user
└── upload.js           → /api/upload
```

### API 함수 작성 예시

```javascript
// api/hello.js
export default function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    message: 'Hello from Vercel!',
    timestamp: new Date().toISOString()
  });
}
```

### CORS 설정

모든 API 함수에 CORS 헤더 추가:

```javascript
export default function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 실제 로직
  res.status(200).json({ success: true });
}
```

## 📚 Vercel CLI 주요 기능

### 1. 배포

프로젝트를 Vercel에 배포:

```bash
# 프로덕션 배포
vercel --prod

# 프리뷰 배포 (테스트용)
vercel
```

### 2. 환경 변수 관리

```bash
# 환경 변수 추가
vercel env add VARIABLE_NAME

# 환경 변수 목록 확인
vercel env ls

# 특정 환경 변수 가져오기
vercel env pull .env.local
```

### 3. 로그 모니터링

실시간으로 Vercel 로그 확인:

```bash
# 실시간 로그
vercel logs --tail

# 특정 배포 로그
vercel logs <deployment-url>
```

### 4. 로컬 개발 서버

로컬에서 Vercel 환경 테스트:

```bash
# Vercel Dev 서버 시작
vercel dev

# 특정 포트에서 실행
vercel dev --listen 3001
```

## 🔐 보안 모범 사례

### 1. API 키 보호

- `.env.local` 파일을 `.gitignore`에 추가
- 환경 변수는 Vercel 대시보드에서만 관리
- 클라이언트에 노출되지 않아야 하는 키는 `VITE_` 접두사 사용 금지

### 2. Rate Limiting

API 엔드포인트에 속도 제한 추가:

```javascript
// api/middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // 최대 100 요청
});
```

### 3. 인증 검증

모든 보호된 엔드포인트에서 토큰 검증:

```javascript
export default function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 인증된 사용자만 접근 가능
  res.status(200).json({ success: true });
}
```

## 🎯 프로젝트별 MCP 설정

### 프론트엔드 빌드

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install"
}
```

### API Routes

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

### 환경 변수

Vercel 대시보드에서 설정:

1. Project Settings → Environment Variables
2. 필요한 변수 추가:
   - `VITE_WALLETCONNECT_PROJECT_ID`
   - `VITE_USER_REGISTRY_ADDRESS`
   - `WEB3_STORAGE_TOKEN`
   - `GOOGLE_CLIENT_ID`
   - 등등...

## 🐛 문제 해결

### 빌드 실패

**문제**: Vercel 빌드가 실패함
```
Error: Build failed
```

**해결**:
1. 로컬에서 `npm run build` 테스트
2. `package.json`의 모든 의존성 확인
3. Vercel 로그 확인: `vercel logs`

### API 함수 타임아웃

**문제**: API 응답이 10초 이상 걸림
```
Error: Function execution timed out
```

**해결**:
1. 무료 플랜: 최대 10초
2. Pro 플랜: 최대 60초
3. 긴 작업은 백그라운드 작업으로 처리

### CORS 오류

**문제**: 브라우저에서 CORS 오류 발생
```
Access to fetch has been blocked by CORS policy
```

**해결**:
1. API 함수에 CORS 헤더 추가 (위 예시 참조)
2. `vercel.json`에 CORS 설정 추가

## 📊 모니터링 및 분석

### Vercel Analytics 활성화

```bash
npm install @vercel/analytics
```

```javascript
// src/main.jsx
import { inject } from '@vercel/analytics';

inject();
```

### 로그 확인

```bash
# 실시간 로그
vercel logs --tail

# 특정 배포 로그
vercel logs <deployment-url>
```

## 🚀 다음 단계

### 1. 환경 변수 설정

Vercel 대시보드에서 프로덕션 환경 변수를 설정하세요:

```bash
# 또는 CLI로 추가
vercel env add VITE_WALLETCONNECT_PROJECT_ID production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add WEB3_STORAGE_TOKEN production
```

### 2. 프로덕션 배포

```bash
# 프로덕션 배포
vercel --prod

# 배포 상태 확인
vercel ls
```

### 3. API 엔드포인트 테스트

배포 후 다음 엔드포인트들이 사용 가능합니다:

- `https://your-domain.vercel.app/api/auth/google` - Google OAuth
- `https://your-domain.vercel.app/api/user` - 사용자 관리
- `https://your-domain.vercel.app/api/upload` - IPFS 업로드

## 🎓 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Vercel CLI 문서](https://vercel.com/docs/cli)
- [환경 변수 관리](https://vercel.com/docs/projects/environment-variables)

## 💡 개발 팁

1. **로컬 개발**: `vercel dev`로 로컬에서 Serverless Functions 테스트
2. **환경 분리**: 개발/프리뷰/프로덕션 환경 각각 다른 환경 변수 설정
3. **캐싱 활용**: `vercel.json`에서 캐시 설정으로 성능 향상
4. **Edge Functions**: 지연 시간이 중요한 API는 Edge Functions 사용
5. **자동 배포**: GitHub와 연동하여 push 시 자동 배포

## ⚠️ 주의사항

1. **API 제한**: 무료 플랜은 함수 실행 시간이 10초로 제한됨
2. **의존성 크기**: Serverless Function은 50MB 제한이 있음
3. **Cold Start**: 첫 호출 시 지연이 있을 수 있음
4. **환경 변수**: 프로덕션 환경 변수는 배포 후에만 적용됨

---

**프로젝트 대시보드**: https://vercel.com/kimbyeong-9s-projects/key-mint

Vercel 연동이 완료되었습니다! 이제 백엔드 API를 Vercel에서 관리할 수 있습니다.
