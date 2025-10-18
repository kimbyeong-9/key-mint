import { useState, useEffect } from 'react';
import styled from 'styled-components';
import NFTCard from '../components/NFTCard';
import { useListingCounter } from '../hooks/useMarket';

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)} 0;
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
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const FilterButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const FilterButton = styled.button`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.bgLight};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text : theme.colors.textSub};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.hover : theme.colors.card};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing(3)};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
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
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, recent, popular
  const { listingCounter } = useListingCounter();

  // NFT 목록 로드
  useEffect(() => {
    const loadNFTs = async () => {
      try {
        setLoading(true);

        // TODO: 백엔드 API에서 NFT 목록 가져오기
        // const response = await fetch('/api/nfts');
        // const data = await response.json();
        // setNfts(data);

        // 임시 더미 데이터
        const dummyNFTs = [
          {
            listingId: 1,
            tokenId: 1,
            name: 'Crypto Art #001',
            description: '독특한 디지털 아트워크',
            image: 'https://via.placeholder.com/400',
            price: '1000000000000000000', // 1 ETH in Wei
            seller: '0x1234567890123456789012345678901234567890',
          },
          {
            listingId: 2,
            tokenId: 2,
            name: 'Digital Masterpiece',
            description: '프리미엄 NFT 컬렉션',
            image: 'https://via.placeholder.com/400',
            price: '2000000000000000000', // 2 ETH
            seller: '0x2345678901234567890123456789012345678901',
          },
          {
            listingId: 3,
            tokenId: 3,
            name: 'Abstract Dreams',
            description: '추상적인 꿈의 세계',
            image: 'https://via.placeholder.com/400',
            price: '500000000000000000', // 0.5 ETH
            seller: '0x3456789012345678901234567890123456789012',
          },
        ];

        // 실제로는 API에서 데이터를 가져와야 합니다
        setTimeout(() => {
          setNfts(dummyNFTs);
          setLoading(false);
        }, 1000);

      } catch (error) {
        console.error('NFT 로드 실패:', error);
        setLoading(false);
      }
    };

    loadNFTs();
  }, [filter]);

  const filteredNFTs = nfts; // 필터링 로직은 나중에 추가

  return (
    <Container>
      <Hero>
        <HeroTitle>블록체인 기반 NFT 마켓플레이스</HeroTitle>
        <HeroSubtitle>
          독특한 디지털 아트를 발견하고, 거래하고, 소유하세요
        </HeroSubtitle>

        <Stats>
          <StatItem>
            <strong>{listingCounter?.toString() || '0'}</strong>
            <span>등록된 NFT</span>
          </StatItem>
          <StatItem>
            <strong>100+</strong>
            <span>활성 사용자</span>
          </StatItem>
          <StatItem>
            <strong>50+</strong>
            <span>완료된 거래</span>
          </StatItem>
        </Stats>
      </Hero>

      <Section>
        <SectionHeader>
          <SectionTitle>NFT 컬렉션</SectionTitle>
          <FilterButtons>
            <FilterButton
              $active={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              전체
            </FilterButton>
            <FilterButton
              $active={filter === 'recent'}
              onClick={() => setFilter('recent')}
            >
              최신
            </FilterButton>
            <FilterButton
              $active={filter === 'popular'}
              onClick={() => setFilter('popular')}
            >
              인기
            </FilterButton>
          </FilterButtons>
        </SectionHeader>

        {loading ? (
          <LoadingSpinner />
        ) : filteredNFTs.length > 0 ? (
          <Grid>
            {filteredNFTs.map((nft) => (
              <NFTCard key={nft.listingId || nft.tokenId} nft={nft} />
            ))}
          </Grid>
        ) : (
          <EmptyState>
            <h3>등록된 NFT가 없습니다</h3>
            <p>첫 번째 NFT를 등록해보세요!</p>
          </EmptyState>
        )}
      </Section>
    </Container>
  );
}

export default Home;
