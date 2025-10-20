# Vercel Postgres 데이터베이스 연결 가이드

## 1단계: Vercel Postgres 데이터베이스 생성

### Vercel 대시보드에서 설정:

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard 접속
   - 프로젝트 `key-mint` 선택

2. **Storage 탭으로 이동**
   - 프로젝트 페이지 상단의 "Storage" 탭 클릭
   - 또는 https://vercel.com/your-team/key-mint/stores

3. **Postgres 데이터베이스 생성**
   - "Create Database" 버튼 클릭
   - "Postgres" 선택
   - Database Name: `key-mint-db` (원하는 이름)
   - Region: 가장 가까운 지역 선택 (예: Seoul - ap-northeast-2)
   - "Create" 버튼 클릭

4. **프로젝트에 연결**
   - 생성된 데이터베이스 선택
   - "Connect Project" 버튼 클릭
   - `key-mint` 프로젝트 선택
   - 환경 변수가 자동으로 프로젝트에 추가됩니다:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

## 2단계: 로컬 환경 변수 설정

### .env.local 파일에 환경 변수 추가:

Vercel 대시보드의 Storage > 생성한 DB > ".env.local" 탭에서 복사할 수 있습니다.

```bash
# Vercel Postgres
POSTGRES_URL="postgres://default:***@***-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb"
POSTGRES_PRISMA_URL="postgres://default:***@***-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://default:***@***.us-east-1.postgres.vercel-storage.com:5432/verceldb"
POSTGRES_USER="default"
POSTGRES_HOST="***-pooler.us-east-1.postgres.vercel-storage.com"
POSTGRES_PASSWORD="***"
POSTGRES_DATABASE="verceldb"
```

**주의:** 실제 값은 Vercel 대시보드에서 복사해야 합니다!

## 3단계: 필요한 패키지 설치

```bash
npm install @vercel/postgres
```

## 4단계: 데이터베이스 스키마 생성

Vercel 대시보드 > Storage > 데이터베이스 선택 > "Query" 탭에서 실행:

```sql
-- users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  address VARCHAR(42) UNIQUE NOT NULL,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX idx_users_address ON users(address);
CREATE INDEX idx_users_username ON users(username);

-- 테이블 확인
SELECT * FROM users;
```

또는 프로젝트 루트의 `sql/schema.sql` 파일을 사용할 수 있습니다.

## 5단계: API 코드 업데이트

`api/user.js` 파일이 이미 Vercel Postgres를 사용하도록 업데이트되었습니다.

## 6단계: 배포 및 테스트

### 로컬 테스트:
```bash
npm run dev
```

### Vercel에 배포:
```bash
vercel --prod
```

## 데이터베이스 관리

### Vercel 대시보드에서 직접 쿼리 실행:
1. Storage > 데이터베이스 선택
2. "Query" 탭 클릭
3. SQL 쿼리 작성 및 실행

### 예시 쿼리:

```sql
-- 모든 사용자 조회
SELECT * FROM users;

-- 특정 주소로 사용자 찾기
SELECT * FROM users WHERE address = '0x...';

-- 사용자 수 확인
SELECT COUNT(*) FROM users;

-- 최근 가입한 사용자 10명
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
```

## 환경 변수 확인

### 로컬에서 확인:
```bash
cat .env.local
```

### Vercel 프로젝트 설정에서 확인:
1. Vercel 대시보드 > 프로젝트 선택
2. Settings > Environment Variables
3. `POSTGRES_*` 변수들이 있는지 확인

## 트러블슈팅

### 문제 1: 연결 오류
```
Error: Connection timeout
```
**해결:** 환경 변수가 올바르게 설정되었는지 확인

### 문제 2: 테이블이 존재하지 않음
```
Error: relation "users" does not exist
```
**해결:** 4단계의 SQL 스키마를 실행했는지 확인

### 문제 3: 로컬에서 연결 안 됨
**해결:** `.env.local` 파일이 프로젝트 루트에 있는지 확인

## 데이터베이스 연결 흐름

```
회원가입 요청
    ↓
Signup.jsx (프론트엔드)
    ↓ POST /api/user
api/user.js (Vercel Serverless Function)
    ↓ @vercel/postgres
Vercel Postgres Database
    ↓
데이터 저장 완료
    ↓
블록체인에 해시 저장
```

## 무료 티어 제한

- **스토리지:** 256 MB
- **데이터 전송:** 월 256 MB
- **데이터베이스 수:** 1개

프로젝트 초기 단계에는 충분합니다!

## 다음 단계

1. ✅ Vercel Postgres 데이터베이스 생성
2. ✅ 프로젝트에 연결
3. ✅ 로컬 환경 변수 설정
4. ✅ 패키지 설치
5. ✅ SQL 스키마 실행
6. ✅ API 코드 업데이트 완료
7. 🔄 테스트 및 배포

## 참고 자료

- [Vercel Postgres 공식 문서](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Postgres 빠른 시작](https://vercel.com/docs/storage/vercel-postgres/quickstart)
- [@vercel/postgres SDK 문서](https://vercel.com/docs/storage/vercel-postgres/sdk)
