import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import styled, { keyframes } from 'styled-components';
import BadgeNFT from './BadgeNFT';
import WalletConnectModal from './WalletConnectModal';
import { formatEther, shortenAddress } from '../lib/format';
import { ipfsToHttp } from '../lib/ipfs';

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};
  display: flex;
  flex-direction: column;
  height: 100%; /* 카드 전체 높이 통일 */

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${({ theme }) => theme.shadow.lg};
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  /* 모바일 최적화 */
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    min-height: 320px; /* 모바일에서 최소 높이 보장 */
    max-height: 400px; /* 모바일에서 최대 높이 제한 */
  }
`;

// 스켈레톤 애니메이션
const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 250px; /* 고정 높이 설정 */
  background: ${({ theme }) => theme.colors.bgLight};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  /* 반응형 디자인 */
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    height: 200px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    height: 200px; /* 모바일에서도 고정 높이 */
    min-height: 200px; /* 최소 높이 보장 */
    max-height: 200px; /* 최대 높이 제한 */
  }
`;

// 로딩 스켈레톤
const ImageSkeleton = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.bgLight} 0%,
    ${({ theme }) => theme.colors.border} 50%,
    ${({ theme }) => theme.colors.bgLight} 100%
  );
  background-size: 468px 100%;
  animation: ${shimmer} 1.5s infinite ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 48px;
    height: 48px;
    color: ${({ theme }) => theme.colors.textDark};
    opacity: 0.3;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: opacity 0.3s ease;
  opacity: ${({ $isLoaded }) => ($isLoaded ? 1 : 0)};

  /* 모바일에서 이미지 최적화 */
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    object-fit: cover;
    object-position: center;
  }
`;

const BadgeContainer = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(1.5)};
  right: ${({ theme }) => theme.spacing(1.5)};
`;

const Content = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  flex: 1; /* 남은 공간을 모두 차지 */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 내용을 위아래로 분산 */
  
  /* 모바일 최적화 */
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(1.5)};
    min-height: 120px; /* 모바일에서 최소 높이 보장 */
  }
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${({ theme }) => theme.spacing(2)};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Price = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PriceLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.colors.textDark};
`;

const PriceValue = styled.span`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

const PriceSubValue = styled.span`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.colors.textSub};
  margin-top: 2px;
  display: block;
`;

const Owner = styled.div`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.colors.textSub};
`;


function NFTCard({ nft }) {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);
  const imgRef = useRef(null);

  // Intersection Observer로 지연 로딩
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // 화면에 들어오기 50px 전에 로드 시작
        threshold: 0.01,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    if (isConnected) {
      navigate(`/item/${nft.id}`);
    } else {
      setShowWalletModal(true);
    }
  };

  // 이미지 로드 성공 처리
  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  // 이미지 에러 처리
  const handleImageError = () => {
    console.warn('⚠️ 이미지 로딩 실패:', nft.image);
    setImageError(true);
    setIsImageLoaded(true); // 에러 시에도 스켈레톤 제거
  };

  // 이미지 URL 처리 - Supabase Storage URL 또는 IPFS URL
  // Supabase Storage 이미지 변환 적용 (최적화된 크기로 로드)
  const getOptimizedImageUrl = (url) => {
    if (!url || imageError) return '/placeholder-nft.png';

    // Supabase Storage URL인 경우 변환 파라미터 추가
    if (url.includes('supabase.co/storage')) {
      // 카드 이미지: 400x400 크기로 최적화
      return `${url}?width=400&height=400&quality=80&format=webp`;
    }

    // IPFS URL인 경우 HTTP 변환
    if (url.startsWith('ipfs://')) {
      return ipfsToHttp(url);
    }

    return url;
  };

  const imageUrl = nft.image ? getOptimizedImageUrl(nft.image) : '/placeholder-nft.png';

  return (
    <>
      <Card ref={cardRef} onClick={handleClick}>
        <ImageContainer>
          {/* 이미지 로딩 중일 때 스켈레톤 표시 */}
          {!isImageLoaded && isVisible && (
            <ImageSkeleton>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </ImageSkeleton>
          )}

          {/* 화면에 보일 때만 이미지 로드 */}
          {isVisible && (
            <Image
              ref={imgRef}
              src={imageUrl}
              alt={nft.name}
              $isLoaded={isImageLoaded}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}

          <BadgeContainer>
            <BadgeNFT />
          </BadgeContainer>
        </ImageContainer>

        <Content>
          <Title>{nft.name || 'Untitled NFT'}</Title>
          <Description>{nft.description || 'No description available'}</Description>

          <Footer>
            <Price>
              <PriceLabel>가격</PriceLabel>
              <PriceValue>
                {nft.priceKrw && nft.priceKrw > 0 ?
                  `${nft.priceKrw.toLocaleString()}원` :
                  '가격 미정'
                }
              </PriceValue>
              {nft.price && nft.price !== '0' && nft.priceKrw && nft.priceKrw > 0 && (
                <PriceSubValue>
                  ({nft.price.includes('.') ? nft.price : formatEther(nft.price)} ETH)
                </PriceSubValue>
              )}
            </Price>

            {nft.creator && (
              <Owner>
                크리에이터: {nft.creator}
              </Owner>
            )}
          </Footer>
        </Content>
      </Card>

      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </>
  );
}

export default NFTCard;
