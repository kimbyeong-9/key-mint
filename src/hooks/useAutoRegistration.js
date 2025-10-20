import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useUser } from '../contexts/UserContext';
import { registerUserOnBlockchain, checkUserRegistrationStatus } from '../api/blockchain-registration';

/**
 * 자동 블록체인 등록 훅
 * 지갑 연결 시 자동으로 블록체인에 사용자 등록
 */
export function useAutoRegistration() {
  const { address, isConnected } = useAccount();
  const { user } = useUser();
  const { signMessageAsync } = useSignMessage();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);

  // 자동 등록 함수
  const autoRegister = async () => {
    if (!address || !user || isRegistering) return;

    try {
      setIsRegistering(true);
      setRegistrationError(null);

      console.log('🚀 자동 블록체인 등록 시작:', { address, username: user.username });

      // 1. 사용자 데이터 해시 생성
      const userData = {
        username: user.username,
        email: user.email,
        address: address,
        timestamp: Date.now()
      };

      const userDataString = JSON.stringify(userData);
      const userHash = await hashString(userDataString);

      // 2. 서명 메시지 생성
      const message = `Key Mint 블록체인 등록\n사용자명: ${user.username}\n해시: ${userHash}\n시간: ${new Date().toISOString()}`;

      // 3. 사용자 서명 요청
      const signature = await signMessageAsync({ message });
      
      console.log('✅ 사용자 서명 완료:', signature);

      // 4. 블록체인 등록 데이터 준비
      const registrationData = {
        address: address,
        username: user.username,
        userHash: userHash,
        signature: signature,
        timestamp: Date.now()
      };

      // 5. SupabaseMCP를 통한 블록체인 등록
      const result = await registerUserOnBlockchain(registrationData);
      
      if (result.success) {
        console.log('✅ 블록체인 등록 성공:', result);
        setIsRegistered(true);
        
        // 로컬 스토리지에 등록 상태 저장
        localStorage.setItem('blockchain_registered', 'true');
        localStorage.setItem('registration_data', JSON.stringify(registrationData));
        
      } else {
        throw new Error(result.message || '블록체인 등록 실패');
      }

    } catch (error) {
      console.error('❌ 자동 등록 오류:', error);
      
      // 팝업 차단 오류인 경우 사용자 친화적 메시지
      if (error.message.includes('Popup window was blocked')) {
        setRegistrationError('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용하고 다시 시도해주세요.');
      } else if (error.message.includes('User rejected')) {
        setRegistrationError('사용자가 서명을 거부했습니다.');
      } else {
        setRegistrationError(error.message);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  // 문자열 해시 함수 (SHA-256)
  const hashString = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // 지갑 연결 시 등록 상태 확인만 (자동 등록은 하지 않음)
  useEffect(() => {
    console.log('🔍 등록 상태 체크:', { isConnected, address, user: !!user, isRegistered });
    
    if (isConnected && address && user && !isRegistered) {
      // 이미 등록된 사용자인지 확인
      const alreadyRegistered = localStorage.getItem('blockchain_registered');
      if (alreadyRegistered === 'true') {
        console.log('✅ 이미 등록된 사용자입니다.');
        setIsRegistered(true);
        return;
      }

      // 자동 등록은 하지 않고, 사용자가 수동으로 등록할 수 있도록 준비
      console.log('📋 블록체인 등록이 필요합니다. 사용자가 수동으로 등록할 수 있습니다.');
    }
  }, [isConnected, address, user, isRegistered]);

  // 오류 상태 초기화 함수
  const clearError = () => {
    setRegistrationError(null);
  };

  return {
    isRegistering,
    isRegistered,
    registrationError,
    autoRegister,
    clearError
  };
}
