/**
 * 블록체인 등록 API (SupabaseMCP 사용)
 * 실제 블록체인 등록을 시뮬레이션하는 API
 */

export async function registerUserOnBlockchain(registrationData) {
  try {
    console.log('🔗 SupabaseMCP를 통한 블록체인 등록 시작:', registrationData);

    // SupabaseMCP를 사용하여 사용자 등록 정보 저장
    const registrationResult = await window.supabaseMCP?.execute_sql({
      query: `
        INSERT INTO blockchain_registrations (
          address,
          username,
          user_hash,
          signature,
          timestamp,
          created_at
        ) VALUES (
          '${registrationData.address}',
          '${registrationData.username}',
          '${registrationData.userHash}',
          '${registrationData.signature}',
          ${registrationData.timestamp},
          NOW()
        )
        ON CONFLICT (address) DO UPDATE SET
          username = EXCLUDED.username,
          user_hash = EXCLUDED.user_hash,
          signature = EXCLUDED.signature,
          timestamp = EXCLUDED.timestamp,
          updated_at = NOW()
        RETURNING *
      `
    });

    if (registrationResult && registrationResult.length > 0) {
      console.log('✅ SupabaseMCP 블록체인 등록 성공:', registrationResult[0]);
      return {
        success: true,
        data: registrationResult[0],
        message: '블록체인 등록이 완료되었습니다.'
      };
    } else {
      throw new Error('SupabaseMCP 등록 실패');
    }

  } catch (error) {
    console.error('❌ SupabaseMCP 블록체인 등록 오류:', error);
    throw new Error(`블록체인 등록 실패: ${error.message}`);
  }
}

/**
 * 사용자 등록 상태 확인
 */
export async function checkUserRegistrationStatus(address) {
  try {
    const result = await window.supabaseMCP?.execute_sql({
      query: `
        SELECT * FROM blockchain_registrations 
        WHERE address = '${address}'
        ORDER BY created_at DESC 
        LIMIT 1
      `
    });

    return result && result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('❌ 등록 상태 확인 오류:', error);
    return null;
  }
}

/**
 * 블록체인 등록 테이블 생성 (초기 설정용)
 */
export async function createBlockchainRegistrationTable() {
  try {
    const result = await window.supabaseMCP?.execute_sql({
      query: `
        CREATE TABLE IF NOT EXISTS blockchain_registrations (
          id SERIAL PRIMARY KEY,
          address VARCHAR(42) UNIQUE NOT NULL,
          username VARCHAR(50) NOT NULL,
          user_hash VARCHAR(64) NOT NULL,
          signature TEXT NOT NULL,
          timestamp BIGINT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_blockchain_registrations_address 
        ON blockchain_registrations(address);
        
        CREATE INDEX IF NOT EXISTS idx_blockchain_registrations_username 
        ON blockchain_registrations(username);
      `
    });

    console.log('✅ 블록체인 등록 테이블 생성 완료');
    return result;
  } catch (error) {
    console.error('❌ 테이블 생성 오류:', error);
    throw error;
  }
}
