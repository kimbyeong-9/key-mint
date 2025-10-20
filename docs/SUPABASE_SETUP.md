# Supabase 백엔드 설정 가이드

## 프로젝트 정보

- **프로젝트명**: key-mint
- **프로젝트 ID**: lrlqolmmuxmvuatvbjip
- **Supabase URL**: https://lrlqolmmuxmvuatvbjip.supabase.co

## 1단계: Supabase 패키지 설치

```bash
npm install @supabase/supabase-js
```

## 2단계: 환경 변수 설정 ✅

환경 변수가 이미 `.env.local`에 설정되어 있습니다:

```bash
VITE_SUPABASE_URL=https://lrlqolmmuxmvuatvbjip.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3단계: Supabase에서 users 테이블 생성

### Supabase 대시보드에서:

1. **https://supabase.com/dashboard 접속**
2. **key-mint 프로젝트 선택**
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New query** 버튼 클릭
5. 아래 SQL 코드를 복사하여 붙여넣기:

```sql
-- users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address VARCHAR(42) UNIQUE NOT NULL,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Row Level Security 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own data"
  ON users FOR DELETE
  USING (true);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

6. **RUN** 버튼 클릭 (또는 Ctrl/Cmd + Enter)
7. "Success. No rows returned" 메시지 확인

### 또는 프로젝트의 SQL 파일 사용:

`sql/supabase-schema.sql` 파일의 내용을 복사하여 SQL Editor에 붙여넣으면 됩니다.

## 4단계: 테이블 확인

1. 왼쪽 메뉴에서 **Table Editor** 클릭
2. **users** 테이블이 생성되었는지 확인
3. 컬럼 확인:
   - `id` (UUID)
   - `address` (VARCHAR)
   - `username` (VARCHAR)
   - `email` (VARCHAR)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

## 5단계: Service Role Key 가져오기 (선택사항)

더 강력한 권한이 필요한 경우:

1. Supabase 대시보드 > **Settings** > **API**
2. **service_role** 섹션에서 키 복사
3. `.env.local`에 추가:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**주의**: Service Role Key는 모든 RLS를 우회하므로 서버사이드에서만 사용해야 합니다!

## 6단계: Vercel 환경 변수 설정

Vercel에 배포할 때 환경 변수를 설정해야 합니다:

1. Vercel 대시보드 > key-mint 프로젝트
2. **Settings** > **Environment Variables**
3. 추가할 변수:
   - `VITE_SUPABASE_URL`: `https://lrlqolmmuxmvuatvbjip.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: (anon public key)
   - `SUPABASE_SERVICE_ROLE_KEY`: (service role key - 선택사항)

## 7단계: 테스트

### 로컬 테스트:

```bash
npm run dev
```

회원가입 페이지에서 테스트:
1. 지갑 연결
2. 회원가입 정보 입력
3. 제출

### Supabase에서 데이터 확인:

1. Supabase 대시보드 > **Table Editor** > **users**
2. 새로 생성된 사용자 데이터 확인

## 8단계: 배포

```bash
vercel --prod
```

## 데이터 흐름

```
사용자 회원가입
    ↓
1. Signup.jsx (프론트엔드)
    ↓ POST /api/user
2. api/user.js (Vercel Serverless Function)
    ↓ Supabase Client
3. Supabase PostgreSQL Database
    ↓ Row Level Security 체크
4. 데이터 저장 완료 ✅
    ↓
5. 블록체인 (UserRegistry.sol) - 해시값 저장
```

## 주요 파일

### 1. `src/lib/supabase.js` - Supabase 클라이언트 설정
프론트엔드에서 Supabase에 직접 접근할 때 사용

### 2. `api/user.js` - API 라우트
백엔드 API 엔드포인트 (CRUD 작업)

### 3. `sql/supabase-schema.sql` - 데이터베이스 스키마
테이블 생성 SQL 스크립트

### 4. `.env.local` - 환경 변수
Supabase 연결 정보

## Supabase 대시보드 주요 기능

### 1. Table Editor
- 테이블 데이터 직접 확인/수정
- GUI 방식으로 쉽게 관리

### 2. SQL Editor
- SQL 쿼리 직접 실행
- 스키마 변경, 데이터 조작

### 3. Authentication (선택사항)
- 이메일/패스워드 인증
- OAuth (Google, GitHub 등)
- 지금은 사용하지 않음 (지갑 인증 사용)

### 4. Storage (선택사항)
- 파일 저장소
- NFT 이미지 저장 가능
- 현재는 IPFS 사용

### 5. Database
- Postgres 데이터베이스 관리
- 백업, 복원, 마이그레이션

### 6. API Docs
- 자동 생성된 API 문서
- PostgREST API 엔드포인트

## Row Level Security (RLS)

현재 설정된 정책:

- **SELECT**: 모든 사용자가 모든 데이터 조회 가능
- **INSERT**: 누구나 회원가입 가능
- **UPDATE**: 모든 사용자가 업데이트 가능 (추후 개선 필요)
- **DELETE**: 모든 사용자가 삭제 가능 (추후 개선 필요)

### 보안 개선 방안 (추후):

```sql
-- 본인만 수정 가능하도록 변경
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (address = current_setting('request.jwt.claims')::json->>'wallet_address');
```

## 유용한 SQL 쿼리

### 모든 사용자 조회
```sql
SELECT * FROM users ORDER BY created_at DESC;
```

### 특정 지갑 주소로 검색
```sql
SELECT * FROM users WHERE address = '0x...';
```

### 사용자 수 확인
```sql
SELECT COUNT(*) FROM users;
```

### 최근 가입자 10명
```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
```

### 사용자명으로 검색
```sql
SELECT * FROM users WHERE username ILIKE '%검색어%';
```

### 테스트 데이터 삽입
```sql
INSERT INTO users (address, username, email)
VALUES ('0x1234567890123456789012345678901234567890', 'test_user', 'test@example.com');
```

### 테이블 초기화 (주의!)
```sql
TRUNCATE TABLE users RESTART IDENTITY CASCADE;
```

## API 사용 예시

### 프론트엔드에서 직접 사용:

```javascript
import { supabase, createUser, getUserByAddress } from './lib/supabase';

// 사용자 생성
const user = await createUser({
  address: '0x...',
  username: 'alice',
  email: 'alice@example.com'
});

// 사용자 조회
const user = await getUserByAddress('0x...');
```

### API 엔드포인트 사용:

```javascript
// POST /api/user - 사용자 생성
const response = await fetch('/api/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '0x...',
    username: 'alice',
    email: 'alice@example.com'
  })
});

// GET /api/user?address=0x... - 사용자 조회
const response = await fetch('/api/user?address=0x...');
const data = await response.json();
```

## 트러블슈팅

### 문제 1: RLS 정책 오류
```
new row violates row-level security policy
```
**해결**: RLS 정책 확인 또는 임시로 비활성화:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### 문제 2: 환경 변수 인식 안 됨
**해결**:
- `.env.local` 파일 위치 확인 (프로젝트 루트)
- 개발 서버 재시작: `npm run dev`

### 문제 3: CORS 오류
**해결**: Supabase는 자동으로 CORS 허용, API 라우트에서 CORS 헤더 설정 확인

### 문제 4: 연결 오류
```
Failed to fetch
```
**해결**:
- Supabase URL 확인
- Anon Key 확인
- 네트워크 연결 확인

## 다음 단계

1. ✅ Supabase 패키지 설치
2. ✅ 환경 변수 설정
3. 🔄 users 테이블 생성 (SQL Editor에서 실행)
4. 테스트 및 배포

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgREST API](https://postgrest.org/en/stable/)

## 비용 (무료 티어)

- **데이터베이스**: 500 MB
- **파일 스토리지**: 1 GB
- **대역폭**: 2 GB/월
- **API 요청**: 무제한
- **동시 연결**: 60개

프로젝트 초기 단계에는 충분합니다! 🚀
