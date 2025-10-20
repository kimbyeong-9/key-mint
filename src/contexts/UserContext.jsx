import { createContext, useContext, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { onAuthStateChange } from '../lib/supabase';

const UserContext = createContext();

export function UserProvider({ children }) {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('guest'); // 'guest', 'web2', 'web3'

  // Auth 상태 변경 감지
  useEffect(() => {
    let subscription = null;
    
    try {
      // Supabase Auth가 사용 가능한지 확인
      if (typeof window !== 'undefined' && window.supabase) {
        const authStateChange = onAuthStateChange(async (event, session) => {
          console.log('🔍 Auth 상태 변경:', { event, session });
          
          if (session?.user) {
            // 로그인된 상태
            const userData = {
              id: session.user.id,
              email: session.user.email,
              username: session.user.user_metadata?.username || 'Unknown',
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
  const login = async (email, password) => {
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
  const logout = () => {
    setUser(null);
    setUserType('guest');
    console.log('👋 사용자 로그아웃됨');
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
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
