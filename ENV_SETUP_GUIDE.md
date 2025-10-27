# 환경 변수 설정 가이드

## 📝 .env.local 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 붙여넣으세요:

```env
# 토스페이먼츠 테스트 모드 (무료)
VITE_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq

# Supabase 설정
VITE_SUPABASE_URL=https://lrlqolmmuxmvuatvbjip.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYm"""",InJlZiI6ImxybHFvbG1tdXhtdnVhdHZiamlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NTcwNzgsImV4cCI6MjA3NjQzMzA3OH0.8CAPUeycn0pZQLZlvL_GmnMljFO3oj0ZxJ8_iqblAAU

# 블록체인 설정 (로컬 네트워크)
VITE_VAULT_NFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_CHAIN_ID=31337
VITE_NETWORK_NAME=localhost

# 사이트 URL
VITE_SITE_URL=http://localhost:3000
```

## 📌 참고

- 환경 변수가 없어도 코드에 기본값이 설정되어 있어 작동합니다.
- 테스트 키: `test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq` (이미 코드에 포함됨)
