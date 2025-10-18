# Vercel MCP 연동 가이드

## 📖 Vercel MCP란?

**Vercel MCP (Model Context Protocol)**는 AI 모델이 Vercel 플랫폼과 상호작용할 수 있도록 하는 프로토콜입니다. 이를 통해 배포, 환경 변수 관리, 로그 확인 등의 작업을 자동화할 수 있습니다.

## 🔧 MCP 설정 방법

### 1. Context 7 MCP 설치

Context 7은 최신 버전의 개발 도구들과 통합하여 작업할 수 있게 해주는 툴입니다.

```bash
# npm을 사용하는 경우
npm install -g context7-mcp

# 또는 yarn
yarn global add context7-mcp
```

### 2. Vercel Token 생성

1. Vercel 대시보드 접속: https://vercel.com/account/tokens
2. "Create Token" 버튼 클릭
3. 토큰 이름 입력 (예: "MCP Integration")
4. 적절한 스코프 선택
5. 생성된 토큰 복사

### 3. 환경 변수 설정

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

## 📚 Context 7 MCP 주요 기능

### 1. 자동 배포

코드 변경 시 자동으로 Vercel에 배포:

```bash
context7 deploy --auto
```

### 2. 환경 변수 동기화

로컬 `.env.local`을 Vercel에 자동 동기화:

```bash
context7 env sync
```

### 3. 로그 모니터링

실시간으로 Vercel 로그 확인:

```bash
context7 logs --tail
```

### 4. 빌드 최적화

최신 버전의 빌드 도구 사용:

```bash
context7 build --optimize
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

## 🎓 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Context 7 문서](https://context7.dev/docs)
- [MCP 프로토콜](https://modelcontextprotocol.io/)

## 💡 팁

1. **로컬 개발**: `vercel dev`로 로컬에서 Serverless Functions 테스트
2. **환경 분리**: 개발/스테이징/프로덕션 환경 분리
3. **캐싱 활용**: `vercel.json`에서 캐시 설정으로 성능 향상
4. **Edge Functions**: 빠른 응답이 필요한 경우 Edge Functions 사용

---

Vercel MCP 연동이 완료되면 더 효율적인 개발과 배포가 가능합니다!
