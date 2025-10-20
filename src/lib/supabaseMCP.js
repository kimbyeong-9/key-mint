// Supabase MCP 클라이언트 초기화
// 이 파일은 Supabase MCP를 사용하여 데이터베이스 작업을 수행합니다.

/**
 * Supabase MCP 클라이언트 초기화
 */
export function initializeSupabaseMCP() {
  // MCP 클라이언트가 이미 초기화되어 있는지 확인
  if (window.supabaseMCP) {
    console.log('✅ Supabase MCP 클라이언트가 이미 초기화되어 있습니다.');
    return window.supabaseMCP;
  }

  // MCP 클라이언트 생성
  window.supabaseMCP = {
    /**
     * SQL 쿼리 실행
     * @param {Object} params - 쿼리 매개변수
     * @param {string} params.query - 실행할 SQL 쿼리
     * @returns {Promise<Array>} 쿼리 결과
     */
    async execute_sql({ query }) {
      try {
        console.log('🔍 MCP SQL 쿼리 실행:', query);
        
        // 실제 MCP 서버로 요청을 보내는 로직
        // 현재는 개발 환경에서 mock 데이터 반환
        if (import.meta.env.DEV) {
          return await mockSupabaseQuery(query);
        }
        
        // 프로덕션에서는 실제 MCP 서버 호출
        const response = await fetch('/api/supabase-mcp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result.data || [];
      } catch (error) {
        console.error('❌ MCP SQL 쿼리 실행 실패:', error);
        throw error;
      }
    },

    /**
     * 사용자 생성 (MCP 전용)
     * @param {Object} userData - 사용자 데이터
     * @returns {Promise<Object>} 생성된 사용자 데이터
     */
    async createUser(userData) {
      const query = `
        INSERT INTO users (username, email, password, address, wallet_address, is_web3_user, created_at, updated_at)
        VALUES (
          '${userData.username}',
          '${userData.email}',
          '${userData.password}',
          '${userData.address}',
          '${userData.wallet_address}',
          ${userData.is_web3_user},
          NOW(),
          NOW()
        )
        RETURNING *
      `;
      
      const result = await this.execute_sql({ query });
      return result[0];
    },

    /**
     * 이메일로 사용자 조회
     * @param {string} email - 이메일 주소
     * @returns {Promise<Object|null>} 사용자 데이터 또는 null
     */
    async getUserByEmail(email) {
      const query = `SELECT * FROM users WHERE email = '${email}' LIMIT 1`;
      const result = await this.execute_sql({ query });
      return result.length > 0 ? result[0] : null;
    },

    /**
     * 지갑 주소로 사용자 조회
     * @param {string} address - 지갑 주소
     * @returns {Promise<Object|null>} 사용자 데이터 또는 null
     */
    async getUserByAddress(address) {
      const query = `SELECT * FROM users WHERE address = '${address}' LIMIT 1`;
      const result = await this.execute_sql({ query });
      return result.length > 0 ? result[0] : null;
    }
  };

  console.log('✅ Supabase MCP 클라이언트가 초기화되었습니다.');
  return window.supabaseMCP;
}

/**
 * 개발 환경에서 사용할 Mock 데이터
 * @param {string} query - SQL 쿼리
 * @returns {Promise<Array>} Mock 데이터
 */
async function mockSupabaseQuery(query) {
  console.log('🔧 Mock Supabase 쿼리 실행:', query);
  
  // 쿼리 타입에 따라 다른 응답 반환
  if (query.includes('SELECT email FROM users WHERE email')) {
    // 이메일 중복 체크
    return [];
  }
  
  if (query.includes('SELECT address FROM users WHERE address')) {
    // 지갑 주소 중복 체크
    return [];
  }
  
  if (query.includes('INSERT INTO users')) {
    // 사용자 생성
    const mockUser = {
      id: 'mock-user-id-' + Date.now(),
      username: 'mock_user',
      email: 'mock@example.com',
      address: '0x1234567890123456789012345678901234567890',
      wallet_address: '0x1234567890123456789012345678901234567890',
      is_web3_user: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return [mockUser];
  }
  
  if (query.includes('SELECT * FROM users WHERE email')) {
    // 이메일로 사용자 조회
    return [];
  }
  
  if (query.includes('SELECT * FROM users WHERE address')) {
    // 지갑 주소로 사용자 조회
    return [];
  }
  
  // 기본 응답
  return [];
}

// MCP 클라이언트 초기화
initializeSupabaseMCP();
