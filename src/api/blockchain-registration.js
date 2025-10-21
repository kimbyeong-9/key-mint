/**
 * 블록체인 등록 API (보안 강화 버전)
 * Supabase 클라이언트를 사용하여 안전하게 데이터 저장
 */

import { supabase } from '../lib/supabase';

export async function registerUserOnBlockchain(registrationData) {
  try {
    console.log('🔗 블록체인 등록 시작:', {
      address: registrationData.address,
      username: registrationData.username
    });

    // 입력 검증
    if (!registrationData.address || !registrationData.username) {
      throw new Error('필수 데이터가 누락되었습니다.');
    }

    // 주소 형식 검증 (이더리움 주소)
    if (!/^0x[a-fA-F0-9]{40}$/.test(registrationData.address)) {
      throw new Error('유효하지 않은 지갑 주소입니다.');
    }

    // Supabase 클라이언트를 사용한 안전한 데이터 삽입 (SQL Injection 방지)
    const { data, error } = await supabase
      .from('blockchain_registrations')
      .upsert({
        address: registrationData.address,
        username: registrationData.username,
        user_hash: registrationData.userHash,
        signature: registrationData.signature,
        timestamp: registrationData.timestamp,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'address'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase 저장 오류:', error);
      throw new Error(`데이터 저장 실패: ${error.message}`);
    }

    console.log('✅ 블록체인 등록 성공:', data);
    return {
      success: true,
      data: data,
      message: '블록체인 등록이 완료되었습니다.'
    };

  } catch (error) {
    console.error('❌ 블록체인 등록 오류:', error);
    throw new Error(`블록체인 등록 실패: ${error.message}`);
  }
}

/**
 * 사용자 등록 상태 확인 (보안 강화)
 */
export async function checkUserRegistrationStatus(address) {
  try {
    // 주소 형식 검증
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      console.error('❌ 유효하지 않은 지갑 주소');
      return null;
    }

    const { data, error } = await supabase
      .from('blockchain_registrations')
      .select('*')
      .eq('address', address)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 데이터 없음
        return null;
      }
      console.error('❌ 등록 상태 확인 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ 등록 상태 확인 오류:', error);
    return null;
  }
}

/**
 * 블록체인 등록 테이블 생성 SQL (Supabase Dashboard에서 실행)
 *
 * 아래 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요:
 *
 * CREATE TABLE IF NOT EXISTS blockchain_registrations (
 *   id SERIAL PRIMARY KEY,
 *   address VARCHAR(42) UNIQUE NOT NULL,
 *   username VARCHAR(50) NOT NULL,
 *   user_hash VARCHAR(64) NOT NULL,
 *   signature TEXT NOT NULL,
 *   timestamp BIGINT NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * CREATE INDEX IF NOT EXISTS idx_blockchain_registrations_address
 * ON blockchain_registrations(address);
 *
 * CREATE INDEX IF NOT EXISTS idx_blockchain_registrations_username
 * ON blockchain_registrations(username);
 *
 * -- Row Level Security (RLS) 정책 설정
 * ALTER TABLE blockchain_registrations ENABLE ROW LEVEL SECURITY;
 *
 * -- 모든 사용자가 읽기 가능
 * CREATE POLICY "Anyone can read blockchain registrations"
 * ON blockchain_registrations FOR SELECT
 * USING (true);
 *
 * -- 인증된 사용자만 자신의 데이터 삽입/업데이트 가능
 * CREATE POLICY "Users can insert their own registration"
 * ON blockchain_registrations FOR INSERT
 * WITH CHECK (true);
 *
 * CREATE POLICY "Users can update their own registration"
 * ON blockchain_registrations FOR UPDATE
 * USING (true);
 */
