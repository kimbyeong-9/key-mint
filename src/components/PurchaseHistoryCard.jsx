import styled from 'styled-components';
import { FaUndo } from 'react-icons/fa';
import StatusBadge from './StatusBadge';
import { formatEther, formatKRW, formatDate } from '../lib/format';

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(4)};
  transition: ${({ theme }) => theme.transition.normal};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadow.lg};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const Info = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.font.size.lg};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const Date = styled.p`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
`;

const Details = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const DetailLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
`;

const DetailValue = styled.span`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const TransactionHash = styled.span`
  font-family: 'Courier New', monospace;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.primary};
  word-break: break-all;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const RefundButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.colors.warning};
  border: none;
  border-radius: ${({ theme }) => theme.radius.sm};
  color: white;
  font-size: ${({ theme }) => theme.font.size.sm};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.warningHover || '#d97706'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function PurchaseHistoryCard({ purchase, onRefundRequest }) {
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return '완료';
      case 'pending': return '대기중';
      case 'failed': return '실패';
      default: return status;
    }
  };

  const canRefund = () => {
    const purchaseTime = new Date(purchase.purchase_date);
    const now = new Date();
    const hoursDiff = (now - purchaseTime) / (1000 * 60 * 60);
    return hoursDiff <= 24 && purchase.status === 'completed';
  };

  return (
    <Card>
      <Header>
        <Info>
          <Title>NFT #{purchase.nft_id}</Title>
          <Date>{formatDate(purchase.created_at)}</Date>
        </Info>
        <StatusBadge status={purchase.status}>
          {getStatusText(purchase.status)}
        </StatusBadge>
      </Header>

      <Details>
        <DetailItem>
          <DetailLabel>구매 가격 (ETH)</DetailLabel>
          <DetailValue>{formatEther(purchase.eth_amount)} ETH</DetailValue>
        </DetailItem>

        <DetailItem>
          <DetailLabel>구매 가격 (KRW)</DetailLabel>
          <DetailValue>{formatKRW(purchase.amount_krw || 0)}</DetailValue>
        </DetailItem>

        <DetailItem>
          <DetailLabel>주문 번호</DetailLabel>
          <DetailValue>{purchase.order_id || 'N/A'}</DetailValue>
        </DetailItem>

        <DetailItem>
          <DetailLabel>거래 해시</DetailLabel>
          <TransactionHash>
            {purchase.transaction_hash || 'N/A'}
          </TransactionHash>
        </DetailItem>

        <DetailItem>
          <DetailLabel>완료 시간</DetailLabel>
          <DetailValue>
            {purchase.completed_at ? formatDate(purchase.completed_at) : 'N/A'}
          </DetailValue>
        </DetailItem>
      </Details>

      {canRefund() && (
        <ActionButtons>
          <RefundButton onClick={() => onRefundRequest(purchase)}>
            <FaUndo />
            환불 요청
          </RefundButton>
        </ActionButtons>
      )}
    </Card>
  );
}

export default PurchaseHistoryCard;
