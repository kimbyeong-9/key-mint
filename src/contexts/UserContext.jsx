import { createContext, useContext, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { onAuthStateChange } from '../lib/supabase';

const UserContext = createContext();

export function UserProvider({ children }) {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태를 true로 설정
  const [userType, setUserType] = useState('guest'); // 'guest', 'web2', 'web3'

  // Auth 상태 변경 감지 및 초기 세션 복원
  useEffect(() => {
    let subscription = null;
    
    try {
      // Supabase Auth가 사용 가능한지 확인
      if (typeof window !== 'undefined' && window.supabase) {
        // 1. 초기 세션 복원 (새로운 기기에서 로그인 상태 유지)
        const restoreSession = async () => {
          try {
            console.log('🔄 초기 세션 복원 중...');
            const { data: { session }, error } = await window.supabase.auth.getSession();
            
            if (error) {
              console.error('❌ 세션 복원 실패:', error);
              setUser(null);
              setIsLoading(false);
              return;
            }
            
            if (session?.user) {
              // 기존 세션이 있는 경우 사용자 정보 복원
              const userData = {
                id: session.user.id,
                email: session.user.email,
                username: session.user.user_metadata?.username || session.user.user_metadata?.display_name || 'Unknown',
                display_name: session.user.user_metadata?.display_name || session.user.user_metadata?.username || session.user.user_metadata?.full_name || 'Unknown',
                address: session.user.user_metadata?.address || null,
                wallet_address: session.user.user_metadata?.wallet_address || null,
                is_web3_user: session.user.user_metadata?.is_web3_user || false,
                created_at: session.user.created_at,
              };
              setUser(userData);
              console.log('✅ 기존 세션 복원됨:', userData);
            } else {
              console.log('ℹ️ 기존 세션 없음 - 로그아웃 상태');
              setUser(null);
            }
            
            // 세션 복원 완료 후 로딩 상태 해제
            setIsLoading(false);
          } catch (error) {
            console.error('❌ 세션 복원 중 오류:', error);
            setUser(null);
            setIsLoading(false);
          }
        };

        // 2. Auth 상태 변경 감지
        const authStateChange = onAuthStateChange(async (event, session) => {
          console.log('🔍 Auth 상태 변경:', { event, session });
          
          if (session?.user) {
            // 로그인된 상태
            const userData = {
              id: session.user.id,
              email: session.user.email,
              username: session.user.user_metadata?.username || session.user.user_metadata?.display_name || 'Unknown',
              display_name: session.user.user_metadata?.display_name || session.user.user_metadata?.username || session.user.user_metadata?.full_name || 'Unknown',
              address: session.user.user_metadata?.address || null,
              wallet_address: session.user.user_metadata?.wallet_address || null,
              is_web3_user: session.user.user_metadata?.is_web3_user || false,
              created_at: session.user.created_at,
            };
            setUser(userData);
            console.log('✅ 사용자 로그인됨:', userData);
          } else {
            // 로그아웃된 상태
            setUser(null);
            console.log('👋 사용자 로그아웃됨');
          }
        });

        // 초기 세션 복원 실행
        restoreSession();

        if (authStateChange?.data?.subscription) {
          subscription = authStateChange.data.subscription;
        }
      } else {
        console.warn('⚠️ Supabase Auth가 사용 불가능합니다. 기본 상태로 설정합니다.');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth 상태 감지 오류:', error);
      // Auth가 사용 불가능한 경우 기본 상태로 설정
      setUser(null);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // 사용자 타입 결정
  useEffect(() => {
    if (user && isConnected && address) {
      setUserType('web3'); // Web3 사용자 (지갑 연결됨)
    } else if (user && !isConnected) {
      setUserType('web2'); // Web2 사용자 (일반 회원가입)
    } else {
      setUserType('guest'); // 게스트
    }
  }, [user, isConnected, address]);

  // 사용자 로그인 (Auth 상태는 자동으로 감지됨)
  const login = async (email) => {
    setIsLoading(true);
    try {
      console.log('🔍 UserContext 로그인 시도:', { email });

      // Auth 상태는 onAuthStateChange에서 자동으로 처리됨
      // 여기서는 성공 응답만 반환
      return { success: true, user: user };
    } catch (error) {
      console.error('❌ UserContext 로그인 실패:', error);
      return { success: false, error: '로그인에 실패했습니다.' };
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 로그아웃
  const logout = async () => {
    try {
      // Supabase Auth에서 실제 로그아웃 수행
      if (typeof window !== 'undefined' && window.supabase) {
        const { error } = await window.supabase.auth.signOut();
        if (error) {
          console.error('❌ Supabase 로그아웃 오류:', error);
        }
      }
      
      // 로컬 상태 초기화
      setUser(null);
      setUserType('guest');
      console.log('👋 사용자 로그아웃됨');
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      // 오류가 발생해도 로컬 상태는 초기화
      setUser(null);
      setUserType('guest');
    }
  };

  // 지갑 연결 시 사용자 정보 업데이트
  const connectWallet = async () => {
    if (user && address) {
      // 기존 사용자에 지갑 주소 추가
      try {
        // TODO: Supabase에서 사용자 정보 업데이트
        console.log('지갑 연결됨:', address);
      } catch (error) {
        console.error('지갑 연결 업데이트 실패:', error);
      }
    }
  };

  const value = {
    user,
    userType,
    isLoading,
    isConnected,
    address,
    login,
    logout,
    connectWallet,
    setUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    console.error('❌ useUser must be used within a UserProvider');
    // 개발 환경에서만 에러를 throw하고, 프로덕션에서는 기본값 반환
    if (process.env.NODE_ENV === 'development') {
      throw new Error('useUser must be used within a UserProvider');
    }
    // 프로덕션에서는 기본값 반환
    return {
      user: null,
      userType: 'guest',
      isLoading: false,
      isConnected: false,
      address: null,
      login: () => Promise.resolve({ success: false }),
      logout: () => {},
      connectWallet: () => {},
      setUser: () => {}
    };
  }
  return context;
}
