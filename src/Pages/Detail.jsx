import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAccount } from 'wagmi';
import BadgeNFT from '../components/BadgeNFT';
import { useListing } from '../hooks/useMarket';
import { useTokenURI, useOwnerOf } from '../hooks/useNFT';
import { formatEther, shortenAddress, formatDate } from '../lib/format';
import { fetchMetadata, ipfsToHttp } from '../lib/ipfs';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)} 0;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.colors.bgLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.textSub};
  font-size: ${({ theme }) => theme.font.size.sm};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  margin-bottom: ${({ theme }) => theme.spacing(3)};

  &:hover {
    background: ${({ theme }) => theme.colors.card};
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(4)};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const ImageSection = styled.div`
  position: relative;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: ${({ theme }) => theme.colors.bgLight};
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const BadgeContainer = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.2;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.textSub};
  line-height: 1.6;
`;

const PriceBox = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const PriceLabel = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textDark};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const PriceValue = styled.div`
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const BuyButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semibold};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.hover};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadow.primary};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DetailBox = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const DetailTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(1.5)} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textDark};
`;

const DetailValue = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const AddressLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: ${({ theme }) => theme.font.size.lg};
  color: ${({ theme }) => theme.colors.textSub};
`;

function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();

  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);

  const { listing, isLoading: listingLoading } = useListing(id);
  const { tokenURI, isLoading: tokenURILoading } = useTokenURI(listing?.tokenId);
  const { owner, isLoading: ownerLoading } = useOwnerOf(listing?.tokenId);

  // 메타데이터 로드
  useEffect(() => {
    const loadMetadata = async () => {
      if (tokenURI) {
        try {
          const data = await fetchMetadata(tokenURI);
          setMetadata(data);
        } catch (error) {
          console.error('메타데이터 로드 실패:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadMetadata();
  }, [tokenURI]);

  const handleBuy = () => {
    if (!isConnected) {
      alert('지갑을 먼저 연결해주세요.');
      return;
    }

    if (address === listing?.seller) {
      alert('자신의 NFT는 구매할 수 없습니다.');
      return;
    }

    navigate(`/checkout/${id}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (listingLoading || tokenURILoading || ownerLoading || loading) {
    return (
      <Container>
        <LoadingContainer>로딩 중...</LoadingContainer>
      </Container>
    );
  }

  if (!listing || !listing.active) {
    return (
      <Container>
        <BackButton onClick={handleBack}>← 돌아가기</BackButton>
        <LoadingContainer>
          해당 NFT를 찾을 수 없거나 판매가 종료되었습니다.
        </LoadingContainer>
      </Container>
    );
  }

  const imageUrl = metadata?.image ? ipfsToHttp(metadata.image) : '/placeholder-nft.png';

  return (
    <Container>
      <BackButton onClick={handleBack}>← 돌아가기</BackButton>

      <Content>
        <ImageSection>
          <ImageContainer>
            <Image src={imageUrl} alt={metadata?.name || 'NFT'} />
            <BadgeContainer>
              <BadgeNFT />
            </BadgeContainer>
          </ImageContainer>
        </ImageSection>

        <InfoSection>
          <div>
            <Title>{metadata?.name || 'Untitled NFT'}</Title>
            <Description>
              {metadata?.description || 'No description available'}
            </Description>
          </div>

          <PriceBox>
            <PriceLabel>현재 가격</PriceLabel>
            <PriceValue>{formatEther(listing.price)} ETH</PriceValue>
            <BuyButton
              onClick={handleBuy}
              disabled={!listing.active || address === listing.seller}
            >
              {address === listing.seller ? '자신의 NFT' : '구매하기'}
            </BuyButton>
          </PriceBox>

          <DetailBox>
            <DetailTitle>상세 정보</DetailTitle>
            <DetailItem>
              <DetailLabel>컨트랙트 주소</DetailLabel>
              <DetailValue>
                <AddressLink
                  href={`https://sepolia.etherscan.io/address/${listing.nftContract}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {shortenAddress(listing.nftContract)}
                </AddressLink>
              </DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>토큰 ID</DetailLabel>
              <DetailValue>#{listing.tokenId?.toString()}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>소유자</DetailLabel>
              <DetailValue>
                <AddressLink
                  href={`https://sepolia.etherscan.io/address/${owner}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {shortenAddress(owner)}
                </AddressLink>
              </DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>판매자</DetailLabel>
              <DetailValue>
                <AddressLink
                  href={`https://sepolia.etherscan.io/address/${listing.seller}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {shortenAddress(listing.seller)}
                </AddressLink>
              </DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>블록체인</DetailLabel>
              <DetailValue>Ethereum (Sepolia)</DetailValue>
            </DetailItem>
          </DetailBox>
        </InfoSection>
      </Content>
    </Container>
  );
}

export default Detail;
