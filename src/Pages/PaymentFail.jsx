import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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

const FailIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: #ef4444;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.font.size.lg};
  color: ${({ theme }) => theme.colors.textSub};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const ErrorDetails = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  text-align: left;
`;

const ErrorCode = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: #dc2626;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const ErrorMessage = styled.div`
  color: #7f1d1d;
  font-size: ${({ theme }) => theme.font.size.sm};
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

function PaymentFail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const errorCode = searchParams.get('code') || 'UNKNOWN_ERROR';
  const errorMessage = searchParams.get('message') || '결제 처리 중 오류가 발생했습니다.';
  const orderId = searchParams.get('orderId');

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetry = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  return (
    <Container>
      <Card>
        <FailIcon>❌</FailIcon>
        <Title>결제에 실패했습니다</Title>
        <Message>죄송합니다. 결제 처리 중 문제가 발생했습니다.</Message>
        
        <ErrorDetails>
          <ErrorCode>오류 코드: {errorCode}</ErrorCode>
          <ErrorMessage>{errorMessage}</ErrorMessage>
          {orderId && (
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
              주문번호: {orderId}
            </div>
          )}
        </ErrorDetails>
        
        <ButtonGroup>
          <Button $variant="secondary" onClick={handleGoHome}>
            홈으로
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