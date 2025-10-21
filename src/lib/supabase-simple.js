// 🔥 완전히 새로 작성한 Supabase Auth (초간단 버전)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('✅ Supabase 초기화:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length
});

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ========================================
// 회원가입
// ========================================
export async function signUpWithEmail(email, password, username) {
  console.log('🚀 회원가입 시작:', { email, username });

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: username,
      }
    }
  });

  if (error) throw error;

  console.log('✅ 회원가입 성공');
  return data;
}

// ========================================
// 로그인
// ========================================
export async function signInWithEmail(email, password) {
  console.log('🚀 로그인 시도:', email);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  console.log('✅ 로그인 성공');
  return data;
}

// ========================================
// 로그아웃
// ========================================
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  console.log('✅ 로그아웃 성공');
}

// ========================================
// 현재 사용자
// ========================================
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ========================================
// Auth 상태 변경
// ========================================
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
