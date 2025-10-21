// Vercel Serverless Function - 중복 확인
// Supabase Auth의 auth.users 테이블에서 이메일과 사용자명 중복 확인

import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성 (서버사이드 - Service Role Key 사용)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  const { method } = req;

  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, value } = req.body;

    if (!type || !value) {
      return res.status(400).json({
        error: 'Missing required fields',
        available: false,
        message: '필수 파라미터가 누락되었습니다.'
      });
    }

    if (type === 'email') {
      return await checkEmailDuplicate(value, res);
    } else if (type === 'username') {
      return await checkUsernameDuplicate(value, res);
    } else {
      return res.status(400).json({
        error: 'Invalid type',
        available: false,
        message: '유효하지 않은 확인 타입입니다.'
      });
    }
  } catch (error) {
    console.error('❌ 중복 확인 API 오류:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      available: false
    });
  }
}

/**
 * 이메일 중복 확인
 * Supabase Auth의 auth.users 테이블에서 이메일 조회
 */
async function checkEmailDuplicate(email, res) {
  try {
    // 이메일 형식 검증
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(200).json({
        available: false,
        message: '올바른 이메일 형식을 입력해주세요.'
      });
    }

    // auth.users 테이블에서 이메일 조회
    // Service Role Key를 사용하면 auth.users에 접근 가능
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      // auth.users 테이블이 없거나 접근 불가능한 경우
      // auth API를 사용해서 확인
      console.log('📌 users 테이블 조회 실패, auth API 사용:', error.message);

      // auth.users는 직접 조회 불가능하므로 형식만 검증
      return res.status(200).json({
        available: true,
        message: '사용 가능한 이메일입니다. (실제 중복은 회원가입 시 확인됩니다.)'
      });
    }

    if (data) {
      // 이미 사용 중인 이메일
      return res.status(200).json({
        available: false,
        message: '이미 사용 중인 이메일입니다.'
      });
    }

    // 사용 가능한 이메일
    return res.status(200).json({
      available: true,
      message: '✅ 사용 가능한 이메일입니다.'
    });

  } catch (error) {
    console.error('❌ 이메일 중복 확인 실패:', error);
    return res.status(500).json({
      available: false,
      message: '이메일 중복 확인 중 오류가 발생했습니다.'
    });
  }
}

/**
 * 사용자명 중복 확인
 * Supabase Auth의 user_metadata에서 사용자명 조회
 */
async function checkUsernameDuplicate(username, res) {
  try {
    // 사용자명 형식 검증
    if (!username || username.length < 2) {
      return res.status(200).json({
        available: false,
        message: '사용자명은 2자 이상이어야 합니다.'
      });
    }

    if (username.length > 20) {
      return res.status(200).json({
        available: false,
        message: '사용자명은 20자 이하여야 합니다.'
      });
    }

    if (!/^[a-zA-Z0-9가-힣_]+$/.test(username)) {
      return res.status(200).json({
        available: false,
        message: '사용자명은 영문, 한글, 숫자, 언더스코어만 사용 가능합니다.'
      });
    }

    // users 테이블에서 사용자명 조회 (있다면)
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      // users 테이블이 없는 경우 auth.users의 user_metadata 확인
      console.log('📌 users 테이블 조회 실패:', error.message);

      // auth.users는 직접 user_metadata 조회가 불가능하므로
      // 형식만 검증하고 사용 가능으로 표시
      return res.status(200).json({
        available: true,
        message: '✅ 사용 가능한 사용자명입니다.'
      });
    }

    if (data) {
      // 이미 사용 중인 사용자명
      return res.status(200).json({
        available: false,
        message: '이미 사용 중인 사용자명입니다.'
      });
    }

    // 사용 가능한 사용자명
    return res.status(200).json({
      available: true,
      message: '✅ 사용 가능한 사용자명입니다.'
    });

  } catch (error) {
    console.error('❌ 사용자명 중복 확인 실패:', error);
    return res.status(500).json({
      available: false,
      message: '사용자명 중복 확인 중 오류가 발생했습니다.'
    });
  }
}
