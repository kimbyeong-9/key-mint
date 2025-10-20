// Supabase 연결 및 users 테이블 확인 테스트
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lrlqolmmuxmvuatvbjip.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxybHFvbG1tdXhtdnVhdHZiamlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NTcwNzgsImV4cCI6MjA3NjQzMzA3OH0.8CAPUeycn0pZQLZlvL_GmnMljFO3oj0ZxJ8_iqblAAU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsersTable() {
  console.log('🔍 Supabase 연결 테스트 시작...\n');

  try {
    // users 테이블에서 데이터 조회 시도
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ users 테이블이 존재하지 않습니다!');
        console.log('\n📝 다음 단계:');
        console.log('1. Supabase 대시보드 접속: https://supabase.com/dashboard');
        console.log('2. key-mint 프로젝트 선택');
        console.log('3. SQL Editor에서 sql/supabase-schema.sql 실행');
        console.log('\n또는 프로젝트 루트에서:');
        console.log('cat sql/supabase-schema.sql');
        return false;
      }

      console.log('⚠️ 오류 발생:', error.message);
      console.log('오류 코드:', error.code);
      return false;
    }

    console.log('✅ users 테이블이 존재합니다!');
    console.log(`📊 현재 사용자 수: ${data ? data.length : 0}명`);

    if (data && data.length > 0) {
      console.log('\n👥 첫 번째 사용자:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('\n💡 테이블은 존재하지만 데이터가 없습니다.');
    }

    return true;

  } catch (err) {
    console.log('❌ 연결 오류:', err.message);
    return false;
  }
}

async function checkAllTables() {
  console.log('\n📋 모든 테이블 조회...\n');

  try {
    const { data, error } = await supabase.rpc('get_tables');

    if (error) {
      console.log('⚠️ RPC 함수 없음 - 대체 방법 사용');
      // 직접 쿼리는 anon key로는 불가능할 수 있음
    } else {
      console.log('테이블 목록:', data);
    }
  } catch (err) {
    console.log('ℹ️ 테이블 목록 조회는 service_role key가 필요할 수 있습니다.');
  }
}

// 실행
checkUsersTable()
  .then(async (exists) => {
    if (exists) {
      console.log('\n🎉 Supabase 연결 성공!');
    }
  })
  .catch((err) => {
    console.error('💥 예상치 못한 오류:', err);
  });
