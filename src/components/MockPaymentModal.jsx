import React, { useState } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const PaymentInfo = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

const InfoValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
`;

const Amount = styled.div`
  text-align: center;
  margin: 24px 0;
`;

const AmountLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
`;

const AmountValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
`;

const CardForm = styled.div`
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const CardRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background: #f3f4f6;
  color: #374151;
  
  &:hover:not(:disabled) {
    background: #e5e7eb;
  }
`;

const PayButton = styled(Button)`
  background: #3b82f6;
  color: white;
  
  &:hover:not(:disabled) {
    background: #2563eb;
  }
`;

const ProcessingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProcessingText = styled.div`
  margin-top: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
`;

const MockNotice = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
  text-align: center;
`;

const MockNoticeText = styled.div`
  font-size: 14px;
  color: #92400e;
  font-weight: 500;
`;

const MockPaymentModal = ({ isOpen, onClose, nft, userId, onPaymentSuccess }) => {
  const [cardNumber, setCardNumber] = useState('1234-5678-9012-3456');
  const [expiryDate, setExpiryDate] = useState('12/25');
  const [cvv, setCvv] = useState('123');
  const [cardHolder, setCardHolder] = useState('홍길동');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // 모의 결제 처리
      const orderId = `NFT_${Date.now()}_${userId}`;
      const amountKrw = Math.round(parseFloat(nft.price) * 3000000); // ETH to KRW
      const amountEth = parseFloat(nft.price);
      
      const response = await fetch('/api/mock-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          orderId,
          amountKrw,
          amountEth,
          nftId: nft.id,
          nftName: nft.name
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // 3초 후 결제 완료 처리
        setTimeout(() => {
          setIsProcessing(false);
          onPaymentSuccess(result.data);
          onClose();
        }, 3000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ 모의 결제 실패:', error);
      setIsProcessing(false);
      alert('결제 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>🎭 모의 결제</Title>
          <Subtitle>실제 돈은 빠지지 않는 테스트 결제입니다</Subtitle>
        </Header>

        <MockNotice>
          <MockNoticeText>
            ⚠️ 이는 모의 결제입니다. 실제 돈은 빠지지 않습니다.
          </MockNoticeText>
        </MockNotice>

        <PaymentInfo>
          <InfoRow>
            <InfoLabel>상품명</InfoLabel>
            <InfoValue>{nft.name}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>NFT ID</InfoLabel>
            <InfoValue>{nft.id}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>가격 (ETH)</InfoLabel>
            <InfoValue>{nft.price} ETH</InfoValue>
          </InfoRow>
        </PaymentInfo>

        <Amount>
          <AmountLabel>결제 금액</AmountLabel>
          <AmountValue>
            {Math.round(parseFloat(nft.price) * 3000000).toLocaleString()}원
          </AmountValue>
        </Amount>

        <CardForm>
          <FormGroup>
            <Label>카드 번호</Label>
            <Input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234-5678-9012-3456"
            />
          </FormGroup>
          
          <CardRow>
            <FormGroup>
              <Label>만료일</Label>
              <Input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
              />
            </FormGroup>
            <FormGroup>
              <Label>CVV</Label>
              <Input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
              />
            </FormGroup>
          </CardRow>
          
          <FormGroup>
            <Label>카드 소유자명</Label>
            <Input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="홍길동"
            />
          </FormGroup>
        </CardForm>

        <ButtonGroup>
          <CancelButton onClick={onClose} disabled={isProcessing}>
            취소
          </CancelButton>
          <PayButton onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? '처리 중...' : '결제하기'}
          </PayButton>
        </ButtonGroup>

        {isProcessing && (
          <ProcessingOverlay>
            <Spinner />
            <ProcessingText>결제 처리 중...</ProcessingText>
          </ProcessingOverlay>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default MockPaymentModal;
