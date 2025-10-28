import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAccount } from 'wagmi';
import { useBuy, useListing, useFeePercent } from '../hooks/useMarket';
import { useTokenURI } from '../hooks/useNFT';
import { formatEther } from '../lib/format';
import { fetchMetadata, ipfsToHttp } from '../lib/ipfs';
import { convertETHToKRW } from '../lib/tossPayments';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)} 0;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const NFTInfo = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

const NFTImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const NFTDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const NFTName = styled.h2`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const NFTDescription = styled.p`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
`;

const PriceBreakdown = styled.div`
  margin-top: ${({ theme }) => theme.spacing(3)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ $total, theme }) =>
    $total ? theme.colors.text : theme.colors.textSub};
  font-weight: ${({ $total, theme }) =>
    $total ? theme.font.weight.bold : theme.font.weight.normal};

  ${({ $total, theme }) =>
    $total &&
    `
    padding-top: ${theme.spacing(2)};
    border-top: 1px solid ${theme.colors.border};
    font-size: ${theme.font.size.lg};
  `}
`;

const PriceLabel = styled.span``;

const PriceValue = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const PriceSubValue = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
  margin-top: 2px;
`;

const InfoBox = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => `${theme.colors.secondary}15`};
  border: 1px solid ${({ theme }) => `${theme.colors.secondary}40`};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ $primary, theme }) =>
    $primary ? theme.colors.primary : theme.colors.bgLight};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: Georgian({ theme }) => theme.font.weight.semibold};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};

  &:hover:not(:disabled) {
    background: ${({ $primary, theme }) =>
      $primary ? theme.colors.hover : theme.colors.card};
    transform: translateY(-2px);
    box-shadow: ${({ $primary, theme }) =>
      $primary ? theme.shadow.primary : theme.shadow.md};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.sm};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  background: ${({ $type, theme }) =>
    $type === 'success'
      ? `${theme.colors.success}20`
      : $type === 'error'
      ? `${theme.colors.danger}20`
      : `${theme.colors.primary}20`};
  color: ${({ $type, theme }) =>
    $type === 'success'
      ? theme.colors.success
      : $type === 'error'
      ? theme.colors.danger
      : theme.colors.primary};
  border: 1px solid ${({ $type, theme }) =>
    $type === 'success'
      ? theme.colors.success
      : $type === 'error'
      ? theme.colors.danger
      : theme.colors.primary};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: ${({ theme }) => theme.font.size.lg};
  color: ${({ theme }) => theme.colors.textSub};
`;

function Checkout() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  const [metadata, setMetadata] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [krwPrices, setKrwPrices] = useState({ price: 0, fee: 0, total: 0 });

  const { listing, isLoading: listingLoading } = useListing(listingId);
  const { tokenURI, isLoading: tokenURILoading } = useTokenURI(listing?.tokenId);
  const { feePercent } = useFeePercent();
  const { buy, isPending, isConfirming, isSuccess, error } = useBuy();

  // 가격 데이터를 useMemo로 최적화
  const priceData = useMemo(() => {
    if (!listing) return { price: BigInt(0), fee: BigInt(0), total: BigInt(0) };
    
    const price = BigInt(listing.price);
    const fee = feePercent ? (price * BigInt(feePercent)) / BigInt(10000) : BigInt(0);
    const total = price;
    
    return { price, fee, total };
  }, [listing, feePercent]);

  // 메타데이터 로드
  useEffect(() => {
    const loadMetadata = async () => {
      if (tokenURI) {
        try {
          const data = await fetchMetadata(tokenURI);
          setMetadata(data);
        } catch (error) {
          console.error('메타데이터 로드 실패:', error);
        }
      }
    };

    loadMetadata();
  }, [tokenURI]);

  // 원화 가격 계산
  useEffect(() => {
    const calculateKrwPrices = async () => {
      if (listing) {
        try {
          const priceEth = parseFloat(formatEther(priceData.price));
          const feeEth = parseFloat(formatEther(priceData.fee));
          const totalEth = parseFloat(formatEther(priceData.total));

          const priceKrw = await convertETHToKRW(priceEth);
          const feeKrw = await convertETHToKRW(feeEth);
          const totalKrw = await convertETHToKRW(totalEth);

          setKrwPrices({ price: priceKrw, fee: feeKrw, total: totalKrw });
        } catch (error) {
          console.error('원화 가격 계산 실패:', error);
          // 폴백: 고정 환율 사용
          const ETH_TO_KRW_RATE = 3000000;
          const priceEth = parseFloat(formatEther(priceData.price));
          const feeEth = parseFloat(formatEther(priceData.fee));
          const totalEth = parseFloat(formatEther(priceData.total));

          setKrwPrices({
            price: Math.round(priceEth * ETH_TO_KRW_RATE),
            fee: Math.round(feeEth * ETH_TO_KRW_RATE),
            total: Math.round(totalEth * ETH_TO_KRW_RATE)
          });
        }
      }
    };

    calculateKrwPrices();
  }, [listing, feePercent, priceData]);

  // 구매 성공 시
  useEffect(() => {
    if (isSuccess) {
      setStatusMessage('구매가 완료되었습니다! 잠시 후 홈으로 이동합니다...');
      setStatusType('success');

      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }, [isSuccess, navigate]);

  // 에러 처리
  useEffect(() => {
    if (error) {
      setStatusMessage(`구매 실패: ${error.message}`);
      setStatusType('error');
    }
  }, [error]);

  const handleBuy = async () => {
    if (!isConnected) {
      alert('지갑을 먼저 연결해주세요.');
      return;
    }

    try {
      setStatusMessage('트랜잭션 승인 대기 중...');
      setStatusType('info');

      await buy(listingId, listing.price);

      setStatusMessage('블록체인에 기록 중...');
    } catch (error) {
      console.error('구매 실패:', error);
      setStatusMessage(`구매 실패: ${error.message}`);
      setStatusType('error');
    }
  };

  const handleCancel = () => {
    navigate(`/item/${listingId}`);
  };

  if (listingLoading || tokenURILoading) {
    return (
      <Container>
        <LoadingContainer>로딩 중...</LoadingContainer>
      </Container>
    );
  }

  if (!listing || !listing.active) {
    return (
      <Container>
        <Title>결제</Title>
        <Card>
          <InfoBox>
            해당 NFT를 찾을 수 없거나 판매가 종료되었습니다.
          </InfoBox>
          <Button onClick={() => navigate('/')}>홈으로 돌아가기</Button>
        </Card>
      </Container>
    );
  }

  const imageUrl = metadata?.image ? ipfsToHttp(metadata.image) : '/placeholder-nft.png';

  return (
    <Container>
      <Title>결제</Title>

      {statusMessage && (
        <StatusMessage $type={statusType}>{statusMessage}</StatusMessage>
      )}

      <Card>
        <NFTInfo>
          <NFTImage src={imageUrl} alt={metadata?.name || 'NFT'} />
          <NFTDetails>
            <NFTName>{metadata?.name || 'Untitled NFT'}</NFTName>
            <NFTDescription>
              {metadata?.description || 'No description'}
            </NFTDescription>
          </NFTDetails>
        </NFTInfo>

        <PriceBreakdown>
          <PriceRow>
            <PriceLabel>가격</PriceLabel>
            <PriceValue>
              {krwPrices.price.toLocaleString()}원
              <PriceSubValue>({formatEther(priceData.price)} ETH)</PriceSubValue>
            </PriceValue>
          </PriceRow>

          <PriceRow>
            <PriceLabel>수수료 ({feePercent ? (Number(feePercent) / 100).toFixed(2) : '0'}%)</PriceLabel>
            <PriceValue>
              {krwPrices.fee.toLocaleString()}원
              <PriceSubValue>({formatEther(priceData.fee)} ETH)</PriceSubValue>
            </PriceValue>
          </PriceRow>

          <PriceRow $total>
            <PriceLabel>총 결제 금액</PriceLabel>
            <PriceValue>
              {krwPrices.total.toLocaleString()}원
              <PriceSubValue>({formatEther(priceData.total)} ETH)</PriceSubValue>
            </PriceValue>
          </PriceRow>
        </PriceBreakdown>
      </Card>

      <InfoBox>
        <strong>결제 안내:</strong> 지갑에서 트랜잭션을 승인하면 NFT가 자동으로
        전송됩니다. 트랜잭션이 블록체인에 기록되기까지 몇 분이 소요될 수 있습니다.
      </InfoBox>

      <ButtonGroup>
        <Button onClick={handleCancel} disabled={isPending || isConfirming}>
          취소
        </Button>
        <Button
          $primary
          onClick={handleBuy}
          disabled={isPending || isConfirming || isSuccess}
        >
          {isPending || isConfirming ? '처리 중...' : isSuccess ? '완료!' : '구매하기'}
        </Button>
      </ButtonGroup>
    </Container>
  );
}

export default Checkout;
