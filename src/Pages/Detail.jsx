import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAccount, useChainId } from 'wagmi';
import BadgeNFT from '../components/BadgeNFT';
import PaymentModal from '../components/PaymentModal';
import WalletConnectModal from '../components/WalletConnectModal';
import { useNFTDetail } from '../hooks/useNFTDetail';
import { useUser } from '../contexts/UserContext';
import { formatEther, shortenAddress, formatDate } from '../lib/format';
import { getOptimizedImageUrl } from '../lib/imageUtils';

// 네트워크별 Etherscan URL
const EXPLORER_URLS = {
  31337: 'http://localhost:8545', // Localhost (Hardhat)
  11155111: 'https://sepolia.etherscan.io', // Sepolia
};

// 네트워크별 이름
const NETWORK_NAMES = {
  31337: 'Localhost 8545 (Hardhat)',
  11155111: 'Sepolia Testnet',
};

// 네트워크별 컨트랙트 주소
const CONTRACT_ADDRESSES = {
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  11155111: import.meta.env.VITE_VAULT_NFT_ADDRESS_SEPOLIA || null,
};

function getExplorerUrl(chainId) {
  return EXPLORER_URLS[chainId] || EXPLORER_URLS[31337];
}

function getNetworkName(chainId) {
  return NETWORK_NAMES[chainId] || 'Unknown Network';
}

function getContractAddress(chainId) {
  return CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[31337];
}

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
  height: 500px; /* 고정 높이 설정 */
  background: ${({ theme }) => theme.colors.bgLight};
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* 반응형 디자인 */
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    height: 400px;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    height: 300px;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: opacity 0.3s ease;
  
  /* 이미지 로딩 중 스켈레톤 효과 */
  &[src=""] {
    opacity: 0;
  }
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
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const PriceSubValue = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
  margin-top: 4px;
  font-weight: ${({ theme }) => theme.font.weight.normal};
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
  const { user } = useUser();
  const chainId = useChainId();

  // 현재 네트워크 정보
  const explorerUrl = getExplorerUrl(chainId);
  const networkName = getNetworkName(chainId);
  const contractAddress = getContractAddress(chainId);

  // 우리의 NFT 시스템에서 데이터 조회
  const { nft, loading, error, refetch } = useNFTDetail(id);
  
  // 이미지 확대 보기 상태
  const [showImageModal, setShowImageModal] = useState(false);
  
  // 결제 모달 상태
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // 지갑 연결 모달 상태
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // 로그인 상태 확인
  useEffect(() => {
    if (!user) {
      // 로그인되지 않은 상태에서는 상세 페이지를 보여주지 않고 모달만 표시
      setShowWalletModal(true);
    }
  }, [user]);
  
  // 원화 가격은 useNFTDetail에서 제공되는 priceKrw 필드 사용

  const handleBuy = () => {
    if (!isConnected) {
      alert('지갑을 먼저 연결해주세요.');
      return;
    }

    if (address === nft?.creatorId) {
      alert('자신의 NFT는 구매할 수 없습니다.');
      return;
    }

    // 토스페이먼츠 결제 모달 열기
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    console.log('💳 결제 성공:', paymentData);
    setShowPaymentModal(false);
    
    // 결제 성공 후 처리
    alert(`결제가 성공적으로 완료되었습니다!\n주문번호: ${paymentData.orderId}\n금액: ${paymentData.amount?.toLocaleString()}원`);
    
    // 페이지 새로고침으로 최신 데이터 반영
    refetch();
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

  // 로그인되지 않은 상태에서는 지갑 연결 모달만 표시
  if (!user) {
    return (
      <Container>
        <WalletConnectModal 
          isOpen={showWalletModal}
          onClose={() => {
            setShowWalletModal(false);
            navigate('/');
          }}
        />
      </Container>
    );
  }

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

  // imageUtils의 getOptimizedImageUrl 사용 (detail 크기: 800x800)
  const imageUrl = getOptimizedImageUrl(nft.image, 'detail');

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
              {nft.priceKrw && nft.priceKrw > 0 ? 
                `${nft.priceKrw.toLocaleString()}원` : 
                '가격 미정'
              }
              {nft.priceKrw && nft.priceKrw > 0 && nft.price && nft.price !== '0' && (
                <PriceSubValue>
                  ({nft.price.includes('.') ? nft.price : formatEther(nft.price)} ETH)
                </PriceSubValue>
              )}
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

          {/* 블록체인 정보 섹션 */}
          {(nft.tokenId || nft.transactionHash || nft.metadataUri) && (
            <DetailBox>
              <DetailTitle>⛓️ 블록체인 정보</DetailTitle>

              {nft.tokenId && (
                <DetailItem>
                  <DetailLabel>토큰 ID</DetailLabel>
                  <DetailValue>#{nft.tokenId}</DetailValue>
                </DetailItem>
              )}

              {nft.transactionHash && (
                <DetailItem>
                  <DetailLabel>트랜잭션 해시</DetailLabel>
                  <DetailValue
                    style={{
                      color: '#6366f1',
                      cursor: chainId !== 31337 ? 'pointer' : 'default',
                      textDecoration: chainId !== 31337 ? 'underline' : 'none'
                    }}
                    onClick={() => {
                      if (chainId !== 31337) {
                        window.open(`${explorerUrl}/tx/${nft.transactionHash}`, '_blank');
                      }
                    }}
                    title={chainId !== 31337 ? "클릭하여 Etherscan에서 확인" : "Localhost - 탐색기 없음"}
                  >
                    {shortenAddress(nft.transactionHash)}
                  </DetailValue>
                </DetailItem>
              )}

              {contractAddress && (
                <DetailItem>
                  <DetailLabel>컨트랙트 주소</DetailLabel>
                  <DetailValue
                    style={{
                      color: '#6366f1',
                      cursor: chainId !== 31337 ? 'pointer' : 'default',
                      textDecoration: chainId !== 31337 ? 'underline' : 'none'
                    }}
                    onClick={() => {
                      if (chainId !== 31337) {
                        window.open(`${explorerUrl}/address/${contractAddress}`, '_blank');
                      }
                    }}
                    title={chainId !== 31337 ? "클릭하여 Etherscan에서 확인" : "Localhost - 탐색기 없음"}
                  >
                    {shortenAddress(contractAddress)}
                  </DetailValue>
                </DetailItem>
              )}

              {nft.blockNumber && (
                <DetailItem>
                  <DetailLabel>블록 번호</DetailLabel>
                  <DetailValue>#{nft.blockNumber}</DetailValue>
                </DetailItem>
              )}

              {nft.metadataUri && (
                <DetailItem>
                  <DetailLabel>메타데이터</DetailLabel>
                  <DetailValue>On-chain 저장됨 ✓</DetailValue>
                </DetailItem>
              )}

              <DetailItem>
                <DetailLabel>네트워크</DetailLabel>
                <DetailValue>{networkName}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>민팅 상태</DetailLabel>
                <DetailValue style={{ color: '#10b981', fontWeight: 'bold' }}>
                  {nft.transactionHash ? '✓ 블록체인 민팅 완료' : '로컬 저장'}
                </DetailValue>
              </DetailItem>
            </DetailBox>
          )}
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

      {/* 실제 토스페이먼츠 결제 모달 */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        nft={nft}
        onSuccess={handlePaymentSuccess}
      />
    </Container>
  );
}

export default Detail;
