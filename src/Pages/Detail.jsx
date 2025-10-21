import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAccount } from 'wagmi';
import BadgeNFT from '../components/BadgeNFT';
import { useNFTDetail } from '../hooks/useNFTDetail';
import { formatEther, shortenAddress, formatDate } from '../lib/format';

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

// 이미지 확대 보기 모달 스타일
const ImageModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;
`;

const ModalImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ImageContainerClickable = styled(ImageContainer)`
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    transform: scale(1.02);
  }
`;

function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();

  // 우리의 NFT 시스템에서 데이터 조회
  const { nft, loading, error, refetch } = useNFTDetail(id);
  
  // 이미지 확대 보기 상태
  const [showImageModal, setShowImageModal] = useState(false);

  const handleBuy = () => {
    if (!isConnected) {
      alert('지갑을 먼저 연결해주세요.');
      return;
    }

    if (address === nft?.creatorId) {
      alert('자신의 NFT는 구매할 수 없습니다.');
      return;
    }

    // TODO: 실제 구매 로직 구현
    alert('구매 기능은 아직 구현되지 않았습니다.');
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleImageClick = () => {
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>로딩 중...</LoadingContainer>
      </Container>
    );
  }

  if (error || !nft) {
    return (
      <Container>
        <BackButton onClick={handleBack}>← 돌아가기</BackButton>
        <LoadingContainer>
          {error || '해당 NFT를 찾을 수 없습니다.'}
        </LoadingContainer>
      </Container>
    );
  }

  const imageUrl = nft.image || '/placeholder-nft.png';

  return (
    <Container>
      <BackButton onClick={handleBack}>← 돌아가기</BackButton>

      <Content>
        <ImageSection>
          <ImageContainerClickable onClick={handleImageClick}>
            <Image src={imageUrl} alt={nft.name} />
            <BadgeContainer>
              <BadgeNFT />
            </BadgeContainer>
          </ImageContainerClickable>
        </ImageSection>

        <InfoSection>
          <div>
            <Title>{nft.name}</Title>
            <Description>{nft.description}</Description>
          </div>

          <PriceBox>
            <PriceLabel>현재 가격</PriceLabel>
            <PriceValue>
              {nft.price && nft.price !== '0' ? 
                (nft.price.includes('.') ? `${nft.price} ETH` : `${formatEther(nft.price)} ETH`) : 
                '가격 미정'
              }
            </PriceValue>
            <BuyButton
              onClick={handleBuy}
              disabled={address === nft.creatorId}
            >
              {address === nft.creatorId ? '자신의 NFT' : '구매하기'}
            </BuyButton>
          </PriceBox>

          <DetailBox>
            <DetailTitle>상세 정보</DetailTitle>
            <DetailItem>
              <DetailLabel>NFT ID</DetailLabel>
              <DetailValue>#{nft.id}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>크리에이터</DetailLabel>
              <DetailValue>{nft.creator}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>생성일</DetailLabel>
              <DetailValue>{formatDate(nft.createdAt)}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>상태</DetailLabel>
              <DetailValue>{nft.status === 'draft' ? '임시 저장' : '활성'}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>파일명</DetailLabel>
              <DetailValue>{nft.imageMetadata?.fileName}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>파일 크기</DetailLabel>
              <DetailValue>
                {nft.imageMetadata?.fileSize ? 
                  `${(nft.imageMetadata.fileSize / 1024 / 1024).toFixed(2)} MB` : 
                  'N/A'
                }
              </DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>이미지 크기</DetailLabel>
              <DetailValue>
                {nft.imageMetadata?.width && nft.imageMetadata?.height ? 
                  `${nft.imageMetadata.width} × ${nft.imageMetadata.height}` : 
                  'N/A'
                }
              </DetailValue>
            </DetailItem>
            {nft.optimization && (
              <>
                <DetailItem>
                  <DetailLabel>압축률</DetailLabel>
                  <DetailValue>{nft.optimization.compressionRatio}%</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>원본 크기</DetailLabel>
                  <DetailValue>
                    {nft.optimization.originalSize ? 
                      `${(nft.optimization.originalSize / 1024 / 1024).toFixed(2)} MB` : 
                      'N/A'
                    }
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>최적화 크기</DetailLabel>
                  <DetailValue>
                    {nft.optimization.optimizedSize ? 
                      `${(nft.optimization.optimizedSize / 1024 / 1024).toFixed(2)} MB` : 
                      'N/A'
                    }
                  </DetailValue>
                </DetailItem>
              </>
            )}
          </DetailBox>
        </InfoSection>
      </Content>

      {/* 이미지 확대 보기 모달 */}
      {showImageModal && (
        <ImageModal onClick={handleCloseImageModal}>
          <CloseButton onClick={handleCloseImageModal}>&times;</CloseButton>
          <ModalImage 
            src={imageUrl} 
            alt={nft.name}
            onClick={(e) => e.stopPropagation()}
          />
        </ImageModal>
      )}
    </Container>
  );
}

export default Detail;
