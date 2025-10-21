// Supabase 클라이언트 설정
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경 변수 검증 (상세 디버깅)
console.log('🔍 Supabase 환경 변수 확인:');
console.log('  URL:', supabaseUrl);
console.log('  URL 타입:', typeof supabaseUrl);
console.log('  Key 길이:', supabaseAnonKey?.length || 0);
console.log('  Key 앞 20자:', supabaseAnonKey?.substring(0, 20));
console.log('  모든 환경 변수:', import.meta.env);

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 'Supabase 환경 변수가 설정되지 않았습니다!';
  console.error('❌', errorMessage);
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '있음' : '없음');
  throw new Error(errorMessage);
}

// Supabase 클라이언트 생성
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    // 전역 객체에 등록 (디버깅용)
    if (typeof window !== 'undefined') {
      window.supabase = supabase;
    }

    console.log(' Supabase 클라이언트 초기화 성공');
  } catch (error) {
    console.error(' Supabase 클라이언트 초기화 실패:', error);
  }
}

export { supabase };

// ===== AUTHENTICATION 함수들 =====

/**
 * 회원가입
 */
export async function signUpWithEmail(userData, metadata = {}) {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const username = metadata.username || userData.username;

  // 1. Supabase Auth 회원가입
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        username: username,
        full_name: username,
        display_name: username,
        wallet_address: metadata.address || userData.address || null,
        is_web3_user: !!(metadata.address || userData.address),
      }
    }
  });

  if (error) {
    console.error('회원가입 에러:', error);
    
    if (error.message.includes('User already registered') || 
        error.message.includes('already registered') ||
        error.message.includes('already exists')) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }
    
    if (error.message.includes('Password should be at least')) {
      throw new Error('비밀번호는 6자 이상이어야 합니다.');
    }
    
    if (error.message.includes('Invalid email')) {
      throw new Error('올바른 이메일 형식을 입력해주세요.');
    }
    
    if (error.message.includes('Signup is disabled')) {
      throw new Error('현재 회원가입이 비활성화되어 있습니다.');
    }
    
    // 기타 에러는 원본 메시지 사용
    throw new Error(error.message || '회원가입 중 오류가 발생했습니다.');
  }

  if (!data.user) {
    throw new Error('회원가입에 실패했습니다.');
  }

  // 2. 이메일 자동 확인 처리 (개발 환경용)
  try {
    const { error: confirmError } = await supabase.auth.admin.updateUserById(data.user.id, {
      email_confirm: true
    });
    
    if (confirmError) {
      console.warn('이메일 자동 확인 실패 (무시 가능):', confirmError);
    } else {
      console.log('✅ 이메일 자동 확인 완료');
    }
  } catch (confirmError) {
    console.warn('이메일 자동 확인 중 오류 (무시 가능):', confirmError);
  }

  // 3. user_profiles 테이블에 프로필 데이터 생성 (RPC 함수 사용)
  try {
    const { error: profileError } = await supabase
      .rpc('create_user_profile', {
        p_user_id: data.user.id,
        p_display_name: username,
        p_full_name: username,
        p_bio: null,
        p_avatar_url: null
      });

    if (profileError) {
      console.error('프로필 생성 실패:', profileError);
      // 프로필 생성 실패해도 회원가입은 성공으로 처리
      // (auth.users에는 데이터가 있으므로)
    } else {
      console.log('✅ 사용자 프로필 생성 완료');
    }
  } catch (profileError) {
    console.error('프로필 생성 중 오류:', profileError);
    // 프로필 생성 실패해도 회원가입은 성공으로 처리
  }

  console.log('회원가입 성공:', data.user.email);
  return data;
}

/**
 * 로그인
 */
export async function signInWithEmail(email, password) {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    if (error.message.includes('Email not confirmed')) {
      throw new Error('이메일 인증이 필요합니다.');
    }
    throw error;
  }

  if (!data.user) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  console.log('로그인 성공:', data.user.email);
  return data;
}

/**
 * 로그아웃
 */
export async function signOut() {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  console.log(' 로그아웃 성공');
  return true;
}

/**
 * 현재 로그인된 사용자 정보 가져오기
 */
export async function getCurrentUser() {
  if (!supabase) {
    return null;
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('사용자 정보 조회 실패:', error);
    return null;
  }

  return user;
}

/**
 * Auth 상태 변경 감지
 */
export function onAuthStateChange(callback) {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  return supabase.auth.onAuthStateChange(callback);
}

/**
 * 사용자 메타데이터 업데이트
 */
export async function updateUserMetadata(updates) {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase.auth.updateUser({
    data: updates
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * 사용자명 중복 확인
 * RPC 함수를 사용하여 실제 데이터베이스에서 중복 확인
 */
export async function checkUsernameAvailable(username) {
  try {
    // 사용자명 형식 검증
    if (!username || username.length < 2) {
      return {
        available: false,
        message: '사용자명은 2자 이상이어야 합니다.'
      };
    }

    if (username.length > 20) {
      return {
        available: false,
        message: '사용자명은 20자 이하여야 합니다.'
      };
    }

    if (!/^[a-zA-Z0-9가-힣_]+$/.test(username)) {
      return {
        available: false,
        message: '사용자명은 영문, 한글, 숫자, 언더스코어만 사용 가능합니다.'
      };
    }

    // RPC 함수 호출하여 실제 데이터베이스에서 사용자명 중복 확인
    console.log('🔍 사용자명 중복 확인 시작:', username);
    
    const { data: usernameExists, error: rpcError } = await supabase
      .rpc('check_username_exists', { p_username: username });

    console.log('📊 사용자명 중복 확인 결과:', { usernameExists, rpcError });

    if (rpcError) {
      console.error('❌ 사용자명 중복 확인 RPC 오류:', rpcError);
      return {
        available: false,
        message: '사용자명 확인 중 오류가 발생했습니다.'
      };
    }

    if (usernameExists) {
      console.log('❌ 사용자명 중복됨:', username);
      return {
        available: false,
        message: '이미 사용중입니다.'
      };
    }

    console.log('사용자명 사용 가능:', username);
    return {
      available: true,
      message: '사용 가능한 사용자명입니다.'
    };

  } catch (error) {
    console.error('❌ 사용자명 확인 실패:', error);
    return {
      available: false,
      message: '사용자명 확인 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 이메일 중복 확인
 * RPC 함수를 사용하여 실제 데이터베이스에서 중복 확인
 */
export async function checkEmailAvailable(email) {
  try {
    // 이메일 형식 검증
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        available: false,
        message: '올바른 이메일 형식을 입력해주세요.'
      };
    }

    // RPC 함수 호출하여 실제 데이터베이스에서 이메일 중복 확인
    console.log('🔍 이메일 중복 확인 시작:', email);
    
    const { data: emailExists, error: rpcError } = await supabase
      .rpc('check_email_exists', { p_email: email });

    console.log('📊 이메일 중복 확인 결과:', { emailExists, rpcError });

    if (rpcError) {
      console.error('❌ 이메일 중복 확인 RPC 오류:', rpcError);
      return {
        available: false,
        message: '이메일 확인 중 오류가 발생했습니다.'
      };
    }

    if (emailExists) {
      console.log('❌ 이메일 중복됨:', email);
      return {
        available: false,
        message: '이미 사용중입니다.'
      };
    }

    console.log('이메일 사용 가능:', email);
    return {
      available: true,
      message: '사용 가능한 이메일입니다.'
    };

  } catch (error) {
    console.error('❌ 이메일 확인 실패:', error);
    return {
      available: false,
      message: '이메일 확인 중 오류가 발생했습니다.'
    };
  }
}
