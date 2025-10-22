import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { useRefund } from '../hooks/useRefund';
import { useNotification } from './NotificationSystem';

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
  z-index: 10000;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(4)};
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${({ theme }) => theme.shadow.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.size.xl};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSub};
  font-size: ${({ theme }) => theme.font.size.lg};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.radius.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSub};
  }
`;

const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSub};
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const Button = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary};
          color: white;
          &:hover:not(:disabled) {
            background: ${theme.colors.primaryHover};
          }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.border};
          color: ${theme.colors.text};
          &:hover:not(:disabled) {
            background: ${theme.colors.textSub};
          }
        `;
      default:
        return `
          background: ${theme.colors.border};
          color: ${theme.colors.text};
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.font.size.sm};
  background: rgba(239, 68, 68, 0.1);
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid rgba(239, 68, 68, 0.2);
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const InfoMessage = styled.div`
  color: ${({ theme }) => theme.colors.info};
  font-size: ${({ theme }) => theme.font.size.sm};
  background: rgba(59, 130, 246, 0.1);
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid rgba(59, 130, 246, 0.2);
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const REFUND_REASONS = [
  { value: 'duplicate_payment', label: '중복 결제' },
  { value: 'wrong_nft', label: '잘못된 NFT 구매' },
  { value: 'technical_issue', label: '기술적 문제' },
  { value: 'change_mind', label: '구매 의사 변경' },
  { value: 'nft_issue', label: 'NFT 문제 (이미지 깨짐, 메타데이터 오류 등)' },
  { value: 'other', label: '기타' }
];

function RefundModal({ isOpen, onClose, payment, nft }) {
  const { createRefundRequest, checkRefundEligibility, isLoading } = useRefund();
  const { addNotification } = useNotification();
  
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [eligibility, setEligibility] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && payment) {
      checkEligibility();
    }
  }, [isOpen, payment]);

  const checkEligibility = async () => {
    try {
      const result = await checkRefundEligibility(payment.id);
      setEligibility(result);
    } catch (err) {
      setError('환불 가능 여부를 확인할 수 없습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason) {
      setError('환불 사유를 선택해주세요.');
      return;
    }

    if (reason === 'other' && !customReason.trim()) {
      setError('기타 사유를 입력해주세요.');
      return;
    }

    try {
      const refundReason = reason === 'other' ? customReason : REFUND_REASONS.find(r => r.value === reason)?.label;
      
      await createRefundRequest(payment.id, nft?.id, refundReason);
      
      addNotification('환불 요청이 성공적으로 제출되었습니다.', 'success');
      onClose();
      
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setReason('');
    setCustomReason('');
    setError(null);
    setEligibility(null);
    onClose();
  };

  if (!isOpen || !payment || !nft) return null;

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaExclamationTriangle />
            환불 요청
          </ModalTitle>
          <CloseButton onClick={handleClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          {eligibility && !eligibility.eligible && (
            <ErrorMessage>
              <FaExclamationTriangle />
              {eligibility.reason}
            </ErrorMessage>
          )}

          {eligibility && eligibility.eligible && (
            <InfoMessage>
              <FaCheckCircle />
              환불 가능합니다. ({Math.floor(eligibility.hoursRemaining)}시간 남음)
            </InfoMessage>
          )}

          {error && (
            <ErrorMessage>
              <FaExclamationTriangle />
              {error}
            </ErrorMessage>
          )}

          <FormGroup>
            <Label>NFT 정보</Label>
            <Input
              value={`${nft.name || 'NFT'} - ${payment.amount_krw?.toLocaleString()}원`}
              disabled
            />
          </FormGroup>

          <FormGroup>
            <Label>환불 사유 *</Label>
            <Select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            >
              <option value="">사유를 선택해주세요</option>
              {REFUND_REASONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormGroup>

          {reason === 'other' && (
            <FormGroup>
              <Label>기타 사유 *</Label>
              <TextArea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="환불 사유를 자세히 입력해주세요"
                required
              />
            </FormGroup>
          )}

          <ButtonGroup>
            <Button
              type="button"
              $variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              $variant="primary"
              disabled={isLoading || !eligibility?.eligible}
            >
              {isLoading && <LoadingSpinner />}
              환불 요청
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
}

export default RefundModal;
