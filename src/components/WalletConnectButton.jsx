import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styled from 'styled-components';

const ButtonContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  z-index: 10;
  color: white;
  font-size: 12px;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 4px;
  z-index: 20;
  white-space: nowrap;
`;

function WalletConnectButton({ 
  onConnectStart, 
  onConnectSuccess, 
  onConnectError,
  disabled = false,
  ...props 
}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleConnect = async () => {
    const now = Date.now();
    
    // 중복 클릭 방지 (1초 내 중복 클릭 차단)
    if (now - lastClickTime < 1000) {
      console.warn('지갑 연결 요청이 너무 빈번합니다. 잠시 기다려주세요.');
      return;
    }

    setLastClickTime(now);
    setIsConnecting(true);
    setError(null);

    try {
      onConnectStart?.();
      
      // 에러가 발생하면 3초 후 자동으로 상태 초기화
      setTimeout(() => {
        setIsConnecting(false);
      }, 3000);
      
    } catch (err) {
      console.error('지갑 연결 오류:', err);
      setError('지갑 연결에 실패했습니다. 다시 시도해주세요.');
      setIsConnecting(false);
      onConnectError?.(err);
    }
  };

  const handleSuccess = () => {
    setIsConnecting(false);
    setError(null);
    onConnectSuccess?.();
  };

  const handleError = (err) => {
    setIsConnecting(false);
    setError('지갑 연결에 실패했습니다. MetaMask를 확인해주세요.');
    onConnectError?.(err);
  };

  return (
    <ButtonContainer>
      <ConnectButton
        onConnect={handleSuccess}
        onConnectError={handleError}
        disabled={disabled || isConnecting}
        {...props}
      />
      
      {isConnecting && (
        <LoadingOverlay>
          연결 중...
        </LoadingOverlay>
      )}
      
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
    </ButtonContainer>
  );
}

export default WalletConnectButton;
