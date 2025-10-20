-- Key Mint Supabase Database Schema
-- Supabase SQL Editor에서 실행하세요

-- users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address VARCHAR(42) UNIQUE NOT NULL,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Row Level Security (RLS) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (모든 사용자가 읽기 가능)
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- RLS 정책 (사용자 본인만 자신의 데이터 수정 가능)
-- 참고: 지갑 주소 기반 인증을 사용하므로 추가 인증 로직 필요
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (true);  -- 추후 auth.uid() 등으로 변경 가능

-- RLS 정책 (누구나 회원가입 가능)
CREATE POLICY "Anyone can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- RLS 정책 (본인만 삭제 가능)
CREATE POLICY "Users can delete their own data"
  ON users FOR DELETE
  USING (true);  -- 추후 auth.uid() 등으로 변경 가능

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 테이블 설명 추가
COMMENT ON TABLE users IS '사용자 정보를 저장하는 테이블';
COMMENT ON COLUMN users.id IS '고유 UUID';
COMMENT ON COLUMN users.address IS '사용자의 지갑 주소 (0x...)';
COMMENT ON COLUMN users.username IS '사용자명';
COMMENT ON COLUMN users.email IS '이메일 주소';
COMMENT ON COLUMN users.created_at IS '계정 생성 시간';
COMMENT ON COLUMN users.updated_at IS '마지막 업데이트 시간';

-- 샘플 데이터 삽입 (테스트용 - 선택사항)
-- INSERT INTO users (address, username, email) VALUES
--   ('0x1234567890123456789012345678901234567890', 'test_user', 'test@example.com');

-- 유용한 쿼리 모음

-- 모든 사용자 조회
-- SELECT * FROM users;

-- 특정 주소로 사용자 찾기
-- SELECT * FROM users WHERE address = '0x...';

-- 사용자 수 확인
-- SELECT COUNT(*) FROM users;

-- 최근 가입한 사용자 10명
-- SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- 특정 사용자명 검색
-- SELECT * FROM users WHERE username ILIKE '%search%';

-- 이메일로 사용자 찾기
-- SELECT * FROM users WHERE email = 'user@example.com';

-- 특정 날짜 이후 가입한 사용자
-- SELECT * FROM users WHERE created_at > '2024-01-01';

-- 사용자 정보 업데이트
-- UPDATE users SET username = 'newname' WHERE address = '0x...';

-- 사용자 삭제
-- DELETE FROM users WHERE address = '0x...';

-- 테이블 초기화 (주의: 모든 데이터 삭제)
-- TRUNCATE TABLE users RESTART IDENTITY CASCADE;
