import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { requestPayment, convertETHToKRW, convertKRWToETH } from '../lib/tossPayments';
import { useUser } from '../contexts/UserContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(3)};
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.textSub};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.radius.sm};
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.bgLight};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const NFTInfo = styled.div`
  background: ${({ theme }) => theme.colors.bgLight};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const NFTImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radius.md};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const NFTName = styled.h3`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing(1)} 0;
`;

const NFTDescription = styled.p`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
  margin: 0 0 ${({ theme }) => theme.spacing(2)} 0;
`;

const PriceSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const PriceLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const PriceInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(1)};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const PriceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const Button = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};

  ${({ $variant, theme }) => {
    if ($variant === 'primary') {
      return `
        background: ${theme.colors.primary};
        color: white;
        
        &:hover:not(:disabled) {
          background: ${theme.colors.primaryHover};
        }
      `;
    } else {
      return `
        background: ${theme.colors.bgLight};
        color: ${theme.colors.text};
        border: 1px solid ${theme.colors.border};
        
        &:hover:not(:disabled) {
          background: ${theme.colors.border};
        }
      `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: ${({ theme }) => theme.spacing(1)};

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radius.md};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

function PaymentModal({ isOpen, onClose, nft, onSuccess }) {
  const { user } = useUser();
  const [krwAmount, setKrwAmount] = useState(0);
  const [ethAmount, setEthAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // NFT 가격을 KRW로 변환
  useEffect(() => {
    if (nft && nft.price) {
      const krw = convertETHToKRW(parseFloat(nft.price));
      setKrwAmount(krw);
      setEthAmount(parseFloat(nft.price));
    }
  }, [nft]);

  // KRW 입력 시 ETH로 변환
  const handleKrwChange = (e) => {
    const krw = parseInt(e.target.value) || 0;
    setKrwAmount(krw);
    setEthAmount(convertKRWToETH(krw));
  };

  // ETH 입력 시 KRW로 변환
  const handleEthChange = (e) => {
    const eth = parseFloat(e.target.value) || 0;
    setEthAmount(eth);
    setKrwAmount(convertETHToKRW(eth));
  };

  // 결제 요청 처리
  const handlePayment = async () => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (krwAmount <= 0) {
      setError('결제 금액을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('💳 결제 요청 시작:', { nft, krwAmount, ethAmount });
      
      const response = await requestPayment(nft, user.id);
      
      console.log('✅ 결제 요청 성공:', response);
      
      // 결제 성공 콜백 호출
      if (onSuccess) {
        onSuccess({
          orderId: response.orderId,
          amount: krwAmount,
          ethAmount: ethAmount
        });
      }
      
      // 모달 닫기
      onClose();
      
    } catch (error) {
      console.error('❌ 결제 요청 실패:', error);
      setError(error.message || '결제 요청에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !nft) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>NFT 구매</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <NFTInfo>
          {nft.image && (
            <NFTImage src={nft.image} alt={nft.name} />
          )}
          <NFTName>{nft.name || 'Untitled NFT'}</NFTName>
          <NFTDescription>{nft.description || 'No description available'}</NFTDescription>
        </NFTInfo>

        {error && (
          <ErrorMessage>{error}</ErrorMessage>
        )}

        <PriceSection>
          <PriceLabel>결제 금액 (KRW)</PriceLabel>
          <PriceInput
            type="number"
            value={krwAmount}
            onChange={handleKrwChange}
            placeholder="결제 금액을 입력하세요"
            min="0"
            step="1000"
          />
          <PriceInfo>
            <span>ETH: {ethAmount.toFixed(6)}</span>
            <span>환율: 1 ETH = 3,000,000 KRW</span>
          </PriceInfo>
        </PriceSection>

        <ButtonGroup>
          <Button $variant="secondary" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <Button $variant="primary" onClick={handlePayment} disabled={isLoading}>
            {isLoading && <LoadingSpinner />}
            {isLoading ? '결제 요청 중...' : '토스페이먼츠로 결제'}
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
}

export default PaymentModal;
