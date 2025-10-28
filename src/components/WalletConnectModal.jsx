import { useState } from 'react';
import styled from 'styled-components';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.bgLight};
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: ${({ theme }) => theme.spacing(6)};
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadow.large};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.textSub};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: center;
  align-items: stretch;
`;

const ConnectButtonWrapper = styled.div`
  width: 100%;
  
  /* RainbowKit ConnectButton 스타일 오버라이드 */
  & > div {
    width: 100% !important;
  }
  
  button {
    width: 100% !important;
    padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)} !important;
    font-size: ${({ theme }) => theme.font.size.md} !important;
    font-weight: ${({ theme }) => theme.font.weight.medium} !important;
    border-radius: ${({ theme }) => theme.radius.md} !important;
    transition: ${({ theme }) => theme.transition.normal} !important;
    min-height: 48px !important; /* 나중에 하기 버튼과 동일한 높이 */
  }
`;

const CloseButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.colors.bgLight};
  color: ${({ theme }) => theme.colors.textSub};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};
  min-height: 48px; /* 지갑 연결 버튼과 동일한 높이 */

  &:hover {
    background: ${({ theme }) => theme.colors.card};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Icon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing(3)};
  font-size: 32px;
`;

function WalletConnectModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Icon>🔗</Icon>
        <Title>지갑 연결 필요</Title>
        <Description>
          NFT 상세 정보를 보려면 지갑을 연결해주세요.
          <br />
          지갑을 연결하면 NFT를 구매하고 판매할 수 있습니다.
        </Description>
        
        <ButtonGroup>
          <ConnectButtonWrapper>
            <ConnectButton />
          </ConnectButtonWrapper>
          <CloseButton onClick={onClose}>
            나중에 하기
          </CloseButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
}

export default WalletConnectModal;
