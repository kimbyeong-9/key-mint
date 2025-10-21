import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { handlePaymentSuccess } from '../lib/tossPayments';
import { useETHBalance } from '../hooks/useETHBalance';
import { usePortfolio } from '../hooks/usePortfolio';
import { useNotification } from '../components/NotificationSystem';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.bg};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(4)};
  max-width: 500px;
  width: 100%;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing(3)} auto;
  font-size: 40px;
  color: white;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing(2)} 0;
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.textSub};
  margin: 0 0 ${({ theme }) => theme.spacing(3)} 0;
  line-height: 1.6;
`;

const PaymentInfo = styled.div`
  background: ${({ theme }) => theme.colors.bgLight};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  text-align: left;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
`;

const InfoValue = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
`;

const Button = styled.button`
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
        
        &:hover {
          background: ${theme.colors.primaryHover};
        }
      `;
    } else {
      return `
        background: ${theme.colors.bgLight};
        color: ${theme.colors.text};
        border: 1px solid ${theme.colors.border};
        
        &:hover {
          background: ${theme.colors.border};
        }
      `;
    }
  }}
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

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchBalance } = useETHBalance();
  const { refreshPortfolio } = usePortfolio();
  const { notifyPurchaseSuccess, notifyPortfolioUpdate } = useNotification();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // URL 파라미터에서 결제 정보 추출
        const orderId = searchParams.get('orderId');
        const paymentKey = searchParams.get('paymentKey');
        const amount = searchParams.get('amount');

        if (!orderId || !paymentKey || !amount) {
          throw new Error('결제 정보가 올바르지 않습니다.');
        }

        console.log('💳 결제 성공 처리:', { orderId, paymentKey, amount });

        // 결제 완료 처리
        const processedPayment = await handlePaymentSuccess(orderId, paymentKey, parseInt(amount));
        setPaymentData(processedPayment);

        console.log('✅ 결제 완료 처리 성공:', processedPayment);
        
        // ETH 잔액 및 포트폴리오 새로고침
        await fetchBalance();
        await refreshPortfolio();
        
        // 알림 표시
        notifyPortfolioUpdate();

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

  const handleViewNFTs = () => {
    navigate('/');
  };

  if (isProcessing) {
    return (
      <Container>
        <Card>
          <LoadingSpinner />
          <Title>결제 처리 중...</Title>
          <Message>결제 정보를 확인하고 있습니다.</Message>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>❌</div>
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
        <SuccessIcon>✓</SuccessIcon>
        <Title>결제가 완료되었습니다!</Title>
        <Message>
          NFT 구매가 성공적으로 완료되었습니다.<br />
          이제 해당 NFT를 소유하게 되었습니다.
        </Message>

        {paymentData && (
          <PaymentInfo>
            <InfoItem>
              <InfoLabel>주문 번호</InfoLabel>
              <InfoValue>{paymentData.orderId}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>결제 금액</InfoLabel>
              <InfoValue>{paymentData.amount?.toLocaleString()}원</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>결제 시간</InfoLabel>
              <InfoValue>
                {new Date(paymentData.completedAt).toLocaleString('ko-KR')}
              </InfoValue>
            </InfoItem>
          </PaymentInfo>
        )}

        <ButtonGroup>
          <Button $variant="secondary" onClick={handleGoHome}>
            홈으로 돌아가기
          </Button>
          <Button $variant="primary" onClick={handleViewNFTs}>
            NFT 보기
          </Button>
        </ButtonGroup>
      </Card>
    </Container>
  );
}

export default PaymentSuccess;
