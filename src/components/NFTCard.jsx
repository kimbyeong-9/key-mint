import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BadgeNFT from './BadgeNFT';
import { formatEther, shortenAddress } from '../lib/format';
import { ipfsToHttp } from '../lib/ipfs';

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${({ theme }) => theme.shadow.lg};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 비율 */
  background: ${({ theme }) => theme.colors.bgLight};
  overflow: hidden;
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
  top: ${({ theme }) => theme.spacing(1.5)};
  right: ${({ theme }) => theme.spacing(1.5)};
`;

const Content = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
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

  const handleClick = () => {
    navigate(`/item/${nft.listingId || nft.tokenId}`);
  };

  const imageUrl = nft.image ? ipfsToHttp(nft.image) : '/placeholder-nft.png';

  return (
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
              {nft.price ? `${formatEther(nft.price)} ETH` : 'N/A'}
            </PriceValue>
          </Price>

          {nft.seller && (
            <Owner>
              판매자: {shortenAddress(nft.seller)}
            </Owner>
          )}
        </Footer>
      </Content>
    </Card>
  );
}

export default NFTCard;
