import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import styled from 'styled-components';
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
  
  /* 모바일에서 이미지 최적화 */
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    object-fit: cover;
    object-position: center;
    /* 모바일에서 가로/세로 이미지 모두 일관되게 표시 */
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

const Owner = styled.div`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.colors.textSub};
`;

function NFTCard({ nft }) {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleClick = () => {
    if (isConnected) {
      navigate(`/item/${nft.id}`);
    } else {
      setShowWalletModal(true);
    }
  };

  // 이미지 URL 처리 - Supabase Storage URL 또는 IPFS URL
  const imageUrl = nft.image ? 
    (nft.image.startsWith('http') ? nft.image : ipfsToHttp(nft.image)) : 
    '/placeholder-nft.png';

  return (
    <>
      <Card onClick={handleClick}>
        <ImageContainer>
          <Image src={imageUrl} alt={nft.name} loading="lazy" />
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
                {nft.price && nft.price !== '0' ? 
                  (nft.price.includes('.') ? `${nft.price} ETH` : `${formatEther(nft.price)} ETH`) : 
                  '가격 미정'
                }
              </PriceValue>
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
