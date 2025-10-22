import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { handlePaymentSuccess } from '../lib/tossPayments';
import { useUser } from '../contexts/UserContext';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: ${({ theme }) => theme.spacing(2)};
`;

const Card = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(4)};
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const SuccessIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: #10b981;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.font.size.lg};
  color: ${({ theme }) => theme.colors.textSub};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const PaymentDetails = styled.div`
  background: #f8fafc;
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  text-align: left;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.textSub};
`;

const DetailValue = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $variant }) => $variant === 'primary' && `
    background: #3b82f6;
    color: white;
    
    &:hover {
      background: #2563eb;
    }
  `}
  
  ${({ $variant }) => $variant === 'secondary' && `
    background: #f1f5f9;
    color: #475569;
    
    &:hover {
      background: #e2e8f0;
    }
  `}
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const paymentKey = searchParams.get('paymentKey');
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');

        if (!paymentKey || !orderId || !amount) {
          throw new Error('결제 정보가 올바르지 않습니다.');
        }

        console.log('💳 결제 성공 페이지 - 결제 처리 시작:', { paymentKey, orderId, amount });

        // 결제 완료 처리
        const result = await handlePaymentSuccess(orderId, paymentKey, parseInt(amount));
        
        setPaymentData(result);
        console.log('✅ 결제 완료 처리 성공:', result);
        
      } catch (error) {
        console.error('❌ 결제 처리 실패:', error);
        setError(error.message);
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoPortfolio = () => {
    navigate('/portfolio');
  };

  if (isProcessing) {
    return (
      <Container>
        <Card>
          <LoadingSpinner />
          <Title>결제 처리 중...</Title>
          <Message>잠시만 기다려주세요.</Message>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card>
          <SuccessIcon>❌</SuccessIcon>
          <Title>결제 처리 실패</Title>
          <Message>{error}</Message>
          <ButtonGroup>
            <Button $variant="primary" onClick={handleGoHome}>
              홈으로 돌아가기
            </Button>
          </ButtonGroup>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <SuccessIcon>✅</SuccessIcon>
        <Title>결제가 완료되었습니다!</Title>
        <Message>NFT 구매가 성공적으로 완료되었습니다.</Message>
        
        {paymentData && (
          <PaymentDetails>
            <DetailRow>
              <DetailLabel>주문번호</DetailLabel>
              <DetailValue>{paymentData.orderId}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>결제금액</DetailLabel>
              <DetailValue>{paymentData.amount?.toLocaleString()}원</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>결제일시</DetailLabel>
              <DetailValue>{new Date(paymentData.completedAt).toLocaleString()}</DetailValue>
            </DetailRow>
          </PaymentDetails>
        )}
        
        <ButtonGroup>
          <Button $variant="secondary" onClick={handleGoHome}>
            홈으로
          </Button>
          <Button $variant="primary" onClick={handleGoPortfolio}>
            포트폴리오 보기
          </Button>
        </ButtonGroup>
      </Card>
    </Container>
  );
}

export default PaymentSuccess;