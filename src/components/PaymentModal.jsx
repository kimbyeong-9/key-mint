import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { requestPayment, convertETHToKRW, convertKRWToETH } from '../lib/tossPayments';
import { useUser } from '../contexts/UserContext';
import { useETHBalance } from '../hooks/useETHBalance';

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

const PriceDisplay = styled.div`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing(1)} 0;
  margin: ${({ theme }) => theme.spacing(1)} 0;
  background: ${({ theme }) => `${theme.colors.primary}10`};
  border: 1px solid ${({ theme }) => `${theme.colors.primary}30`};
  border-radius: ${({ theme }) => theme.radius.md};
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

const MockPaymentNotice = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const MockNoticeIcon = styled.span`
  font-size: 20px;
`;

const MockNoticeText = styled.span`
  color: #92400e;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

function PaymentModal({ isOpen, onClose, nft, onSuccess }) {
  const { user } = useUser();
  const { balance, fetchBalance } = useETHBalance();
  const [krwAmount, setKrwAmount] = useState(0);
  const [ethAmount, setEthAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // NFT 가격을 KRW로 변환
  useEffect(() => {
    const initializeAmounts = async () => {
      if (nft && nft.price) {
        try {
          const krw = await convertETHToKRW(parseFloat(nft.price));
          setKrwAmount(krw);
          setEthAmount(parseFloat(nft.price));
        } catch (error) {
          console.error('환율 변환 실패:', error);
          // 폴백: 고정 환율 사용
          const ETH_TO_KRW_RATE = 3000000;
          const krw = Math.round(parseFloat(nft.price) * ETH_TO_KRW_RATE);
          setKrwAmount(krw);
          setEthAmount(parseFloat(nft.price));
        }
      }
    };

    initializeAmounts();
  }, [nft]);

  // KRW 입력 시 ETH로 변환
  const handleKrwChange = async (e) => {
    const krw = parseInt(e.target.value) || 0;
    setKrwAmount(krw);
    try {
      const eth = await convertKRWToETH(krw);
      setEthAmount(eth);
    } catch (error) {
      console.error('환율 변환 실패:', error);
      // 폴백: 고정 환율 사용
      const ETH_TO_KRW_RATE = 3000000;
      setEthAmount(parseFloat((krw / ETH_TO_KRW_RATE).toFixed(6)));
    }
  };

  // ETH 입력 시 KRW로 변환
  const handleEthChange = async (e) => {
    const eth = parseFloat(e.target.value) || 0;
    setEthAmount(eth);
    try {
      const krw = await convertETHToKRW(eth);
      setKrwAmount(krw);
    } catch (error) {
      console.error('환율 변환 실패:', error);
      // 폴백: 고정 환율 사용
      const ETH_TO_KRW_RATE = 3000000;
      setKrwAmount(Math.round(eth * ETH_TO_KRW_RATE));
    }
  };

  // 실제 토스페이먼츠 결제 요청 처리
  const handlePayment = async () => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (!nft || !nft.id) {
      setError('NFT 정보가 올바르지 않습니다.');
      return;
    }

    if (krwAmount <= 0) {
      setError('결제 금액을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('💳 실제 결제 요청 시작:', { nft, krwAmount, ethAmount });
      
      // NFT 데이터 검증 및 보완
      const validatedNFT = {
        id: nft.id,
        name: nft.name && nft.name.trim() !== '' ? nft.name : 'NFT 구매',
        price: nft.price || '0',
        description: nft.description || 'No description available'
      };
      
      console.log('🔍 NFT 데이터 검증:', {
        id: validatedNFT.id,
        name: validatedNFT.name,
        price: validatedNFT.price,
        originalName: nft.name
      });
      
      const response = await requestPayment(validatedNFT, user.id);
      
      console.log('✅ 토스페이먼츠 결제 요청 성공:', response);
      
      // 결제창이 열리기 전에 모달 닫기
      setIsLoading(false);
      onClose();
      
      console.log('🔄 토스페이먼츠 결제창으로 이동합니다...');
      
    } catch (error) {
      console.error('❌ 결제 요청 실패:', error);
      
      // 에러 메시지 개선
      let errorMessage = '결제 요청에 실패했습니다.';
      
      if (error.message.includes('JSON 파싱 실패')) {
        errorMessage = '서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('HTTP 오류')) {
        errorMessage = '서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('빈 응답')) {
        errorMessage = '서버에서 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
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
          {krwAmount > 0 && (
            <PriceDisplay>
              {krwAmount.toLocaleString()}원
            </PriceDisplay>
          )}
          <PriceInfo>
            <span>ETH: {ethAmount.toFixed(6)}</span>
            <span>환율: 1 ETH = {Math.round(3000000).toLocaleString()} KRW</span>
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
