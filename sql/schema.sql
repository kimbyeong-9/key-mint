-- Key Mint Database Schema
-- Vercel Postgres를 위한 사용자 테이블 스키마

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
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 테이블 설명 추가 (주석)
COMMENT ON TABLE users IS '사용자 정보를 저장하는 테이블';
COMMENT ON COLUMN users.id IS '자동 증가하는 고유 ID';
COMMENT ON COLUMN users.address IS '사용자의 지갑 주소 (0x...)';
COMMENT ON COLUMN users.username IS '사용자명';
COMMENT ON COLUMN users.email IS '이메일 주소';
COMMENT ON COLUMN users.created_at IS '계정 생성 시간';
COMMENT ON COLUMN users.updated_at IS '마지막 업데이트 시간';

-- 샘플 쿼리 모음 (참고용)

-- 1. 모든 사용자 조회
-- SELECT * FROM users;

-- 2. 특정 주소로 사용자 찾기
-- SELECT * FROM users WHERE address = '0x...';

-- 3. 사용자 수 확인
-- SELECT COUNT(*) FROM users;

-- 4. 최근 가입한 사용자 10명
-- SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- 5. 특정 사용자명 검색
-- SELECT * FROM users WHERE username LIKE '%search%';

-- 6. 이메일로 사용자 찾기
-- SELECT * FROM users WHERE email = 'user@example.com';

-- 7. 특정 날짜 이후 가입한 사용자
-- SELECT * FROM users WHERE created_at > '2024-01-01';

-- 8. 사용자 정보 업데이트
-- UPDATE users SET username = 'newname', updated_at = NOW() WHERE address = '0x...';

-- 9. 사용자 삭제
-- DELETE FROM users WHERE address = '0x...';

-- 10. 테이블 초기화 (주의: 모든 데이터 삭제)
-- TRUNCATE TABLE users RESTART IDENTITY;
