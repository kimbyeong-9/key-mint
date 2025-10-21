import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePortfolio } from '../hooks/usePortfolio';
import { useETHBalance } from '../hooks/useETHBalance';
import { formatEther, formatDate } from '../lib/format';

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.bgLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.textSub};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadow.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.size.xl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing(3)};
`;

const NFTCard = styled.div`
  background: ${({ theme }) => theme.colors.bgLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing(3)};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const NFTImage = styled.div`
  width: 100%;
  height: 150px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
`;

const NFTTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const NFTPrice = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const ActivityList = styled.div`
  background: ${({ theme }) => theme.colors.bgLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(2)} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityInfo = styled.div`
  flex: 1;
`;

const ActivityType = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const ActivityDate = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
`;

const ActivityAmount = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: ${({ theme }) => theme.font.size.lg};
  color: ${({ theme }) => theme.colors.textSub};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(6)};
  color: ${({ theme }) => theme.colors.textSub};
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  margin-top: ${({ theme }) => theme.spacing(4)};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

function Portfolio() {
  const navigate = useNavigate();
  const { portfolio, nftOwnership, activityLogs, loading, error, refreshPortfolio } = usePortfolio();
  const { balance } = useETHBalance();
  const [activeTab, setActiveTab] = useState('nfts');

  const handleNFTClick = (nftId) => {
    navigate(`/item/${nftId}`);
  };

  const getActivityTypeText = (type) => {
    switch (type) {
      case 'purchase': return '구매';
      case 'sale': return '판매';
      case 'view': return '조회';
      case 'favorite': return '즐겨찾기';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>포트폴리오를 불러오는 중...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <EmptyState>
          <h3>오류가 발생했습니다</h3>
          <p>{error}</p>
          <Button onClick={refreshPortfolio}>다시 시도</Button>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>내 포트폴리오</Title>
        <Subtitle>나의 NFT 컬렉션과 활동 내역을 확인하세요</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatValue>{portfolio?.total_nfts || 0}</StatValue>
          <StatLabel>보유 NFT</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{formatEther(portfolio?.total_spent_eth || 0)} ETH</StatValue>
          <StatLabel>총 구매 금액</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{(portfolio?.total_spent_krw || 0).toLocaleString()}원</StatValue>
          <StatLabel>총 구매 금액 (KRW)</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{formatEther(balance)} ETH</StatValue>
          <StatLabel>현재 잔액</StatLabel>
        </StatCard>
      </StatsGrid>

      <ActionButtons>
        <ActionButton onClick={() => navigate('/portfolio/purchases')}>
          구매 내역 보기
        </ActionButton>
        <ActionButton onClick={() => navigate('/')}>
          NFT 둘러보기
        </ActionButton>
      </ActionButtons>

      <Section>
        <SectionTitle>보유 NFT ({nftOwnership.length}개)</SectionTitle>
        {nftOwnership.length > 0 ? (
          <NFTGrid>
            {nftOwnership.map((nft) => (
              <NFTCard key={nft.id} onClick={() => handleNFTClick(nft.nft_id)}>
                <NFTImage>NFT 이미지</NFTImage>
                <NFTTitle>NFT #{nft.nft_id}</NFTTitle>
                <NFTPrice>{formatEther(nft.purchase_price_eth)} ETH</NFTPrice>
              </NFTCard>
            ))}
          </NFTGrid>
        ) : (
          <EmptyState>
            <h3>보유한 NFT가 없습니다</h3>
            <p>첫 번째 NFT를 구매해보세요!</p>
            <Button onClick={() => navigate('/')}>NFT 둘러보기</Button>
          </EmptyState>
        )}
      </Section>

      <Section>
        <SectionTitle>최근 활동</SectionTitle>
        <ActivityList>
          {activityLogs.length > 0 ? (
            activityLogs.map((activity) => (
              <ActivityItem key={activity.id}>
                <ActivityInfo>
                  <ActivityType>{getActivityTypeText(activity.activity_type)}</ActivityType>
                  <ActivityDate>{formatDate(activity.created_at)}</ActivityDate>
                </ActivityInfo>
                {activity.amount_eth && (
                  <ActivityAmount>{formatEther(activity.amount_eth)} ETH</ActivityAmount>
                )}
              </ActivityItem>
            ))
          ) : (
            <EmptyState>
              <p>활동 내역이 없습니다</p>
            </EmptyState>
          )}
        </ActivityList>
      </Section>
    </Container>
  );
}

export default Portfolio;
