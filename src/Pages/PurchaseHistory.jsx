import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import RefundModal from '../components/RefundModal';
import PurchaseHistoryCard from '../components/PurchaseHistoryCard';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xxl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.font.size.lg};
  color: ${({ theme }) => theme.colors.textSub};
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
`;

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
  flex: 1;
  min-width: 200px;
`;

const PurchaseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(8)};
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid transparent;
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: ${({ theme }) => theme.spacing(4)} auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.bgLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  margin-bottom: ${({ theme }) => theme.spacing(4)};

  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }
`;

function PurchaseHistory() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchPurchaseHistory();
    }
  }, [user?.id]);

  const fetchPurchaseHistory = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_purchase_history', {
        user_uuid: user.id
      });

      if (error) {
        throw new Error(`구매 내역 조회 실패: ${error.message}`);
      }

      setPurchases(data || []);
      console.log('✅ 구매 내역 조회 성공:', data?.length || 0, '개');

    } catch (err) {
      console.error('❌ 구매 내역 조회 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesFilter = filter === 'all' || purchase.status === filter;
    const matchesSearch = searchTerm === '' || 
      purchase.nft_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.payment_history?.order_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <Container>
        <BackButton onClick={() => navigate('/portfolio')}>
          ← 포트폴리오로 돌아가기
        </BackButton>
        <LoadingSpinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <BackButton onClick={() => navigate('/portfolio')}>
          ← 포트폴리오로 돌아가기
        </BackButton>
        <EmptyState>
          <h3>오류가 발생했습니다</h3>
          <p>{error}</p>
          <button onClick={fetchPurchaseHistory}>다시 시도</button>
        </EmptyState>
      </Container>
    );
  }

  const handleRefundRequest = (purchase) => {
    setSelectedPurchase(purchase);
    setShowRefundModal(true);
  };

  const handleRefundSuccess = () => {
    setShowRefundModal(false);
    setSelectedPurchase(null);
    fetchPurchaseHistory(); // 목록 새로고침
  };

  return (
    <Container>
      <BackButton onClick={() => navigate('/portfolio')}>
        ← 포트폴리오로 돌아가기
      </BackButton>

      <Header>
        <Title>구매 내역</Title>
        <Subtitle>나의 NFT 구매 기록을 확인하세요</Subtitle>
      </Header>

      <FilterBar>
        <FilterSelect 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">전체</option>
          <option value="completed">완료</option>
          <option value="pending">대기중</option>
          <option value="failed">실패</option>
        </FilterSelect>
        
        <SearchInput
          type="text"
          placeholder="NFT ID 또는 주문번호로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </FilterBar>

      {filteredPurchases.length === 0 ? (
        <EmptyState>
          <h3>구매 내역이 없습니다</h3>
          <p>아직 구매한 NFT가 없습니다.</p>
        </EmptyState>
      ) : (
        <PurchaseList>
          {filteredPurchases.map((purchase) => (
            <PurchaseHistoryCard
              key={purchase.id}
              purchase={purchase}
              onRefundRequest={handleRefundRequest}
            />
          ))}
        </PurchaseList>
      )}

      {showRefundModal && selectedPurchase && (
        <RefundModal
          isOpen={showRefundModal}
          onClose={() => setShowRefundModal(false)}
          payment={selectedPurchase}
          nft={{ id: selectedPurchase.nft_id, name: `NFT #${selectedPurchase.nft_id}` }}
          onSuccess={handleRefundSuccess}
        />
      )}
    </Container>
  );
}

export default PurchaseHistory;
