import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import NFTCard from '../components/NFTCard';
import { useUser } from '../contexts/UserContext';
import { useListingCounter } from '../hooks/useMarket';
import { useNFTs } from '../hooks/useNFTs';

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(2)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)};
  }
`;

const Hero = styled.section`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(3)};
  background: linear-gradient(
    135deg,
    ${({ theme }) => `${theme.colors.primary}15`},
    ${({ theme }) => `${theme.colors.secondary}15`}
  );
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(2)};
    margin-bottom: ${({ theme }) => theme.spacing(4)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(2)};
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }
`;

const HeroTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  line-height: 1.2;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 48px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.font.size.lg};
  color: ${({ theme }) => theme.colors.textSub};
  max-width: 600px;
  margin: 0 auto ${({ theme }) => theme.spacing(4)};
  line-height: 1.6;
`;


const Stats = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(4)};
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};

  strong {
    font-size: ${({ theme }) => theme.font.size.xl};
    font-weight: ${({ theme }) => theme.font.weight.bold};
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  span {
    font-size: ${({ theme }) => theme.font.size.sm};
    color: ${({ theme }) => theme.colors.textSub};
  }
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  gap: ${({ theme }) => theme.spacing(2)};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const FilterButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`;

const SortSection = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  gap: ${({ theme }) => theme.spacing(2)};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    justify-content: flex-start;
    flex-wrap: wrap;
    margin-top: ${({ theme }) => theme.spacing(1.5)};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }
`;


const SortButton = styled.button`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.card};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text : theme.colors.textSub};
  border: 1px solid ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  white-space: nowrap;

  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.hover : theme.colors.bgLight};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
  }

  &:active {
    transform: translateY(1px);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(0.75)} ${({ theme }) => theme.spacing(1.5)};
    font-size: ${({ theme }) => theme.font.size.xs};
  }
`;

const MobileCreateButton = styled.button`
  display: none;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-weight: ${({ theme }) => theme.font.weight.semibold};
  font-size: ${({ theme }) => theme.font.size.sm};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadow.primary};
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: block;
  }
`;


const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: start; /* 카드들을 상단 정렬 */

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: ${({ theme }) => theme.spacing(2)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing(2)};
    /* 모바일에서 카드 간격 최적화 */
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(8)} ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.card};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};

  h3 {
    font-size: ${({ theme }) => theme.font.size.xl};
    color: ${({ theme }) => theme.colors.textSub};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  p {
    font-size: ${({ theme }) => theme.font.size.md};
    color: ${({ theme }) => theme.colors.textDark};
  }
`;


const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(8)};

  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid ${({ theme }) => theme.colors.border};
    border-top-color: ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

function Home() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [filter, setFilter] = useState('all'); // all, recent, popular
  const { listingCounter } = useListingCounter();
  
  // 실제 NFT 데이터를 가져오는 훅 사용
  const { nfts, loading, error, refetch } = useNFTs();

  const handleCreateClick = () => {
    navigate('/create');
  };

  // NFT 등록 후 목록 새로고침을 위한 useEffect
  useEffect(() => {
    const handleStorageChange = () => {
      refetch();
    };

    // 로컬 스토리지 변경 감지
    window.addEventListener('storage', handleStorageChange);
    
    // 페이지 포커스 시 새로고침
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [refetch]);

  // 필터링 로직
  const filteredNFTs = nfts.filter(nft => {
    switch (filter) {
      case 'recent':
        return true; // 이미 최신순으로 정렬됨
      case 'popular':
        return true; // 추후 인기도 기준 추가 예정
      default:
        return true;
    }
  });

  return (
    <Container>
      <Hero>
        <HeroTitle>블록체인 기반 NFT 마켓플레이스</HeroTitle>
        <HeroSubtitle>
          독특한 디지털 아트를 발견하고, 거래하고, 소유하세요
        </HeroSubtitle>

        <Stats>
          <StatItem>
            <strong>{nfts.length}</strong>
            <span>등록된 NFT</span>
          </StatItem>
          <StatItem>
            <strong>{new Set(nfts.map(nft => nft.creatorId)).size}</strong>
            <span>활성 크리에이터</span>
          </StatItem>
          <StatItem>
            <strong>0</strong>
            <span>완료된 거래</span>
          </StatItem>
        </Stats>
      </Hero>



      <Section>
        <SectionHeader>
          <SectionTitle>NFT 컬렉션</SectionTitle>
          {user && (
            <MobileCreateButton onClick={handleCreateClick}>
              NFT 등록
            </MobileCreateButton>
          )}
        </SectionHeader>

        {/* 정렬 방식 선택 섹션 */}
        <SortSection>
          <SortButton
            $active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            전체
          </SortButton>
          <SortButton
            $active={filter === 'recent'}
            onClick={() => setFilter('recent')}
          >
            최신순
          </SortButton>
          <SortButton
            $active={filter === 'popular'}
            onClick={() => setFilter('popular')}
          >
            인기순
          </SortButton>
        </SortSection>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <EmptyState>
            <h3>오류가 발생했습니다</h3>
            <p>{error}</p>
            <button 
              onClick={refetch}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              다시 시도
            </button>
          </EmptyState>
        ) : filteredNFTs.length > 0 ? (
          <Grid>
            {filteredNFTs.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </Grid>
        ) : (
          <EmptyState>
            <h3>등록된 NFT가 없습니다</h3>
            <p>첫 번째 NFT를 등록해보세요!</p>
            {user && (
              <button 
                onClick={handleCreateClick}
                style={{
                  marginTop: '16px',
                  padding: '12px 24px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                NFT 등록하기
              </button>
            )}
          </EmptyState>
        )}
      </Section>
    </Container>
  );
}

export default Home;
