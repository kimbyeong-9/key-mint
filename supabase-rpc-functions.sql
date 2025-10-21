-- Supabase Database Functions (RPC)
-- auth.users 테이블에서 이메일과 사용자명 중복 확인을 위한 함수들
--
-- 실행 방법:
-- 1. Supabase 대시보드 접속 (https://supabase.com/dashboard)
-- 2. 프로젝트 선택
-- 3. SQL Editor로 이동
-- 4. 아래 SQL을 복사하여 실행
--

-- ==========================================
-- 1. 이메일 중복 확인 함수
-- ==========================================
CREATE OR REPLACE FUNCTION check_email_exists(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- auth.users 테이블 접근을 위해 필요
AS $$
DECLARE
  email_count INTEGER;
BEGIN
  -- auth.users 테이블에서 이메일 검색
  SELECT COUNT(*)
  INTO email_count
  FROM auth.users
  WHERE email = p_email;

  -- 1개 이상이면 true (이미 존재), 0이면 false (사용 가능)
  RETURN email_count > 0;
END;
$$;

-- 함수 실행 권한 설정 (anon, authenticated 사용자 모두 접근 가능)
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO authenticated;

COMMENT ON FUNCTION check_email_exists IS '이메일이 auth.users 테이블에 이미 존재하는지 확인';


-- ==========================================
-- 2. 사용자명 중복 확인 함수
-- ==========================================
CREATE OR REPLACE FUNCTION check_username_exists(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- auth.users 테이블 접근을 위해 필요
AS $$
DECLARE
  username_count INTEGER;
BEGIN
  -- auth.users 테이블의 raw_user_meta_data에서 사용자명 검색
  -- user_metadata는 JSONB 타입이므로 ->> 연산자 사용
  SELECT COUNT(*)
  INTO username_count
  FROM auth.users
  WHERE
    raw_user_meta_data->>'username' = p_username
    OR raw_user_meta_data->>'display_name' = p_username;

  -- 1개 이상이면 true (이미 존재), 0이면 false (사용 가능)
  RETURN username_count > 0;
END;
$$;

-- 함수 실행 권한 설정
GRANT EXECUTE ON FUNCTION check_username_exists(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION check_username_exists(TEXT) TO authenticated;

COMMENT ON FUNCTION check_username_exists IS '사용자명이 auth.users 테이블의 user_metadata에 이미 존재하는지 확인';


-- ==========================================
-- 3. 테스트 쿼리 (선택사항)
-- ==========================================
-- 이메일 중복 확인 테스트
-- SELECT check_email_exists('test@example.com');

-- 사용자명 중복 확인 테스트
-- SELECT check_username_exists('testuser');

-- 현재 등록된 사용자 확인
-- SELECT
--   email,
--   raw_user_meta_data->>'username' as username,
--   raw_user_meta_data->>'display_name' as display_name
-- FROM auth.users
-- LIMIT 10;
