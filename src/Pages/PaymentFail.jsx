import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { handlePaymentFailure } from '../lib/tossPayments';

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

const FailIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #f44336;
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

const ErrorInfo = styled.div`
  background: #fee;
  border: 1px solid #fcc;
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  text-align: left;
`;

const ErrorItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ErrorLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: #c33;
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const ErrorValue = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: #c33;
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

function PaymentFail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorData, setErrorData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processError = async () => {
      try {
        // URL 파라미터에서 오류 정보 추출
        const orderId = searchParams.get('orderId');
        const errorCode = searchParams.get('errorCode');
        const errorMessage = searchParams.get('errorMessage');

        if (!orderId) {
          throw new Error('주문 정보가 올바르지 않습니다.');
        }

        console.log('❌ 결제 실패 처리:', { orderId, errorCode, errorMessage });

        // 결제 실패 처리
        const processedError = await handlePaymentFailure(
          orderId, 
          errorCode || 'UNKNOWN_ERROR', 
          errorMessage || '알 수 없는 오류가 발생했습니다.'
        );
        setErrorData(processedError);

        console.log('✅ 결제 실패 처리 완료:', processedError);

      } catch (error) {
        console.error('❌ 오류 처리 실패:', error);
        setError(error.message);
      } finally {
        setIsProcessing(false);
      }
    };

    processError();
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetry = () => {
    navigate('/');
  };

  if (isProcessing) {
    return (
      <Container>
        <Card>
          <LoadingSpinner />
          <Title>오류 처리 중...</Title>
          <Message>오류 정보를 확인하고 있습니다.</Message>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card>
          <FailIcon>❌</FailIcon>
          <Title>처리 오류</Title>
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
        <FailIcon>❌</FailIcon>
        <Title>결제가 실패했습니다</Title>
        <Message>
          결제 처리 중 오류가 발생했습니다.<br />
          다시 시도하거나 다른 결제 방법을 사용해주세요.
        </Message>

        {errorData && (
          <ErrorInfo>
            <ErrorItem>
              <ErrorLabel>주문 번호</ErrorLabel>
              <ErrorValue>{errorData.orderId}</ErrorValue>
            </ErrorItem>
            <ErrorItem>
              <ErrorLabel>오류 코드</ErrorLabel>
              <ErrorValue>{errorData.errorCode}</ErrorValue>
            </ErrorItem>
            <ErrorItem>
              <ErrorLabel>오류 메시지</ErrorLabel>
              <ErrorValue>{errorData.errorMessage}</ErrorValue>
            </ErrorItem>
            <ErrorItem>
              <ErrorLabel>발생 시간</ErrorLabel>
              <ErrorValue>
                {new Date(errorData.failedAt).toLocaleString('ko-KR')}
              </ErrorValue>
            </ErrorItem>
          </ErrorInfo>
        )}

        <ButtonGroup>
          <Button $variant="secondary" onClick={handleGoHome}>
            홈으로 돌아가기
          </Button>
          <Button $variant="primary" onClick={handleRetry}>
            다시 시도
          </Button>
        </ButtonGroup>
      </Card>
    </Container>
  );
}

export default PaymentFail;
