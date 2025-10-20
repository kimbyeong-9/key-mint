import { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import WalletConnectButton from './WalletConnectButton';
import { useAutoRegistration } from '../hooks/useAutoRegistration';
import styled from 'styled-components';

const WalletSectionContainer = styled.section`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  box-shadow: ${({ theme }) => theme.shadow.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing(3)};
    margin-bottom: ${({ theme }) => theme.spacing(4)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(2)};
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  text-align: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.lg};
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }
`;

const WalletContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    gap: ${({ theme }) => theme.spacing(3)};
  }
`;

const NetworkInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.bgLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(2)};
    font-size: ${({ theme }) => theme.font.size.sm};
  }
`;

const NetworkIcon = styled.div`
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #627eea, #4f46e5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
`;

const WalletInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.bgLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  min-width: 200px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(2)};
    min-width: auto;
    width: 100%;
  }
`;

const BalanceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semibold};
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.md};
  }
`;

const AddressInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
  font-family: monospace;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.xs};
  }
`;

const WalletAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

const ConnectPrompt = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => `${theme.colors.primary}10`};
  border: 1px solid ${({ theme }) => `${theme.colors.primary}30`};
  border-radius: ${({ theme }) => theme.radius.md};

  h3 {
    font-size: ${({ theme }) => theme.font.size.lg};
    font-weight: ${({ theme }) => theme.font.weight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  p {
    font-size: ${({ theme }) => theme.font.size.md};
    color: ${({ theme }) => theme.colors.textSub};
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(3)};

    h3 {
      font-size: ${({ theme }) => theme.font.size.md};
    }

    p {
      font-size: ${({ theme }) => theme.font.size.sm};
    }
  }
`;

const RegistrationStatus = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ $status, theme }) => {
    if ($status === 'registering') return `${theme.colors.warning}15`;
    if ($status === 'registered') return `${theme.colors.success}15`;
    if ($status === 'error') return `${theme.colors.danger}15`;
    if ($status === 'pending') return `${theme.colors.primary}15`;
    return theme.colors.bgLight;
  }};
  border: 1px solid ${({ $status, theme }) => {
    if ($status === 'registering') return `${theme.colors.warning}30`;
    if ($status === 'registered') return `${theme.colors.success}30`;
    if ($status === 'error') return `${theme.colors.danger}30`;
    if ($status === 'pending') return `${theme.colors.primary}30`;
    return theme.colors.border;
  }};
  border-radius: ${({ theme }) => theme.radius.md};
  text-align: center;

  .status-icon {
    font-size: 20px;
    margin-bottom: ${({ theme }) => theme.spacing(1)};
  }

  .status-text {
    font-size: ${({ theme }) => theme.font.size.sm};
    font-weight: ${({ theme }) => theme.font.weight.medium};
    color: ${({ $status, theme }) => {
      if ($status === 'registering') return theme.colors.warning;
      if ($status === 'registered') return theme.colors.success;
      if ($status === 'error') return theme.colors.danger;
      if ($status === 'pending') return theme.colors.primary;
      return theme.colors.text;
    }};
    margin-bottom: ${({ $status, theme }) => $status === 'pending' ? theme.spacing(2) : 0};
  }
`;

const ManualRegisterButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semibold};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};
  margin-top: ${({ theme }) => theme.spacing(1)};

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadow.primary};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

function WalletSection() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  
  // 자동 블록체인 등록 훅
  const { isRegistering, isRegistered, registrationError, autoRegister, clearError } = useAutoRegistration();

  return (
    <WalletSectionContainer>
      <SectionTitle>🔗 지갑 & 네트워크</SectionTitle>
      
      <WalletContent>
        {/* 네트워크 정보 */}
        <NetworkInfo>
          <NetworkIcon>Ξ</NetworkIcon>
          <span>{chain?.name || 'Ethereum'}</span>
        </NetworkInfo>

        {/* 지갑 연결 상태 */}
        {isConnected ? (
          <>
            <WalletInfo>
              <WalletAvatar>
                🐼
              </WalletAvatar>
              <BalanceInfo>
                {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0 ETH'}
              </BalanceInfo>
              <AddressInfo>
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
              </AddressInfo>
              <WalletConnectButton />
            </WalletInfo>
            
            {/* 자동 블록체인 등록 상태 */}
            {isRegistering && (
              <RegistrationStatus $status="registering">
                <div className="status-icon">⏳</div>
                <div className="status-text">블록체인에 자동 등록 중...</div>
              </RegistrationStatus>
            )}
            
            {isRegistered && (
              <RegistrationStatus $status="registered">
                <div className="status-icon">✅</div>
                <div className="status-text">블록체인 등록 완료! Web3 기능이 활성화되었습니다.</div>
              </RegistrationStatus>
            )}
            
            {registrationError && (
              <RegistrationStatus $status="error">
                <div className="status-icon">❌</div>
                <div className="status-text">등록 오류: {registrationError}</div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                  <ManualRegisterButton onClick={() => autoRegister()}>
                    다시 시도
                  </ManualRegisterButton>
                  <ManualRegisterButton 
                    onClick={clearError}
                    style={{ background: '#6c757d' }}
                  >
                    닫기
                  </ManualRegisterButton>
                </div>
              </RegistrationStatus>
            )}
            
            {/* 등록되지 않은 경우 수동 등록 버튼 표시 */}
            {!isRegistered && !isRegistering && !registrationError && (
              <RegistrationStatus $status="pending">
                <div className="status-icon">🔐</div>
                <div className="status-text">블록체인 등록이 필요합니다. 아래 버튼을 클릭하여 등록하세요.</div>
                <ManualRegisterButton onClick={() => autoRegister()}>
                  블록체인에 등록
                </ManualRegisterButton>
              </RegistrationStatus>
            )}
          </>
        ) : (
          <ConnectPrompt>
            <h3>지갑을 연결하세요</h3>
            <p>NFT를 구매하고 판매하려면 지갑을 연결해야 합니다.</p>
            <WalletConnectButton />
          </ConnectPrompt>
        )}
      </WalletContent>
    </WalletSectionContainer>
  );
}

export default WalletSection;
