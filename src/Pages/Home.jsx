import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import NFTCard from '../components/NFTCard';
import { useUser } from '../contexts/UserContext';
import { useListingCounter } from '../hooks/useMarket';
import { useNFTs } from '../hooks/useNFTs';
import { useNFTCount } from '../hooks/useNFTCount';

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

// 모달 애니메이션
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(4)};
  max-width: 400px;
  width: 90%;
  box-shadow: ${({ theme }) => theme.shadow.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  text-align: center;
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const OptionButton = styled.button`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.bgLight};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  text-align: left;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primaryHover : theme.colors.border};
    transform: translateX(4px);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $primary, theme }) => $primary ? theme.colors.primary : theme.colors.bgLight};
  color: ${({ $primary, theme }) => $primary ? 'white' : theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.sm};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ $primary, theme }) => $primary ? theme.colors.primaryHover : theme.colors.border};
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


const PriceFilterButton = styled.button`
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.bgLight};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};

  &:hover {
    background: ${({ theme }) => theme.colors.primary}10;
    transform: translateY(-1px);
  }
`;

const SearchSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  margin: ${({ theme }) => theme.spacing(2)} 0 ${({ theme }) => theme.spacing(3)} 0;
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;
    gap: ${({ theme }) => theme.spacing(2)};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 500px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
  transition: ${({ theme }) => theme.transition.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSub};
  }
`;

const ResultsText = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
  white-space: nowrap;
  flex-shrink: 0;
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
  justify-content: space-between; /* 양쪽 끝으로 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  margin-top: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  gap: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap; /* 작은 화면에서 줄바꿈 허용 */

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    justify-content: space-between;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showPriceModal, setShowPriceModal] = useState(false);
  const { listingCounter } = useListingCounter();
  
  // 실제 NFT 데이터를 가져오는 훅 사용
  const { nfts, loading, error, refetch } = useNFTs();
  
  // NFT 개수를 가져오는 훅 사용
  const { count: nftCount, loading: countLoading, refetch: refetchCount } = useNFTCount();

  const handleCreateClick = () => {
    navigate('/create');
  };

  // 가격 범위 옵션
  const priceRanges = [
    { label: '전체', value: 'all' },
    { label: '0.01 ETH 이하', value: '0.01' },
    { label: '0.01 - 0.1 ETH', value: '0.01-0.1' },
    { label: '0.1 - 1 ETH', value: '0.1-1' },
    { label: '1 ETH 이상', value: '1+' }
  ];

  // 가격 범위 선택
  const handlePriceSelect = (value) => {
    setPriceFilter(value);
    setShowPriceModal(false);
  };

  // NFT 필터링 및 정렬 로직
  const filteredAndSortedNFTs = React.useMemo(() => {
    let filtered = nfts || [];

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(nft => 
        nft.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.id?.toString().includes(searchTerm)
      );
    }

    // 가격 필터링
    if (priceFilter !== 'all') {
      filtered = filtered.filter(nft => {
        const price = parseFloat(nft.price) || 0;
        switch (priceFilter) {
          case '0.01':
            return price <= 0.01;
          case '0.01-0.1':
            return price > 0.01 && price <= 0.1;
          case '0.1-1':
            return price > 0.1 && price <= 1;
          case '1+':
            return price > 1;
          default:
            return true;
        }
      });
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'price-low':
          return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
        case 'price-high':
          return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [nfts, searchTerm, priceFilter, sortBy]);

  // 검색 핸들러
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // NFT 등록 후 목록 새로고침을 위한 useEffect
  useEffect(() => {
    const handleStorageChange = () => {
      refetch(); // NFT 목록 새로고침
      refetchCount(); // NFT 개수 새로고침
    };

    // 로컬 스토리지 변경 감지
    window.addEventListener('storage', handleStorageChange);
    
    // 페이지 포커스 시 새로고침
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [refetch, refetchCount]);


  return (
    <Container>
      <Hero>
        <HeroTitle>블록체인 기반 NFT 마켓플레이스</HeroTitle>
        <HeroSubtitle>
          독특한 디지털 아트를 발견하고, 거래하고, 소유하세요
        </HeroSubtitle>

        <Stats>
          <StatItem>
            <strong>{countLoading ? '...' : nftCount}</strong>
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
        </SectionHeader>

        {/* 정렬 방식 선택 섹션을 검색창 위로 이동 */}
        <SortSection>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <PriceFilterButton onClick={() => setShowPriceModal(true)}>
              가격 필터
              {priceFilter !== 'all' && (
                <span style={{ marginLeft: '4px', fontSize: '12px' }}>
                  ({priceRanges.find(range => range.value === priceFilter)?.label || '전체'})
                </span>
              )}
            </PriceFilterButton>
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
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {user && (
              <MobileCreateButton onClick={handleCreateClick}>
                NFT 등록
              </MobileCreateButton>
            )}
          </div>
        </SortSection>

        {/* 검색창과 결과 텍스트를 나란히 배치 */}
        <SearchSection>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="NFT 이름, 설명, 또는 ID로 검색..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </SearchContainer>
          {filteredAndSortedNFTs.length > 0 && (
            <ResultsText>
              {filteredAndSortedNFTs.length}개의 결과를 찾았습니다
            </ResultsText>
          )}
        </SearchSection>

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
        ) : filteredAndSortedNFTs.length > 0 ? (
          <Grid>
            {filteredAndSortedNFTs.map((nft) => (
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

      {/* 가격 필터링 모달 */}
      {showPriceModal && (
        <ModalOverlay onClick={() => setShowPriceModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>가격 범위 선택</ModalTitle>
            <OptionList>
              {priceRanges.map((range) => (
                <OptionButton
                  key={range.value}
                  $active={priceFilter === range.value}
                  onClick={() => handlePriceSelect(range.value)}
                >
                  {priceFilter === range.value && '✓ '}
                  {range.label}
                </OptionButton>
              ))}
            </OptionList>
            <ModalButtons>
              <ModalButton onClick={() => setShowPriceModal(false)}>
                취소
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default Home;
