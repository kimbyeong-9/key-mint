import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Modal from '../components/Modal';
import StatusMessage from '../components/StatusMessage';
import { useUser } from '../contexts/UserContext';
import { uploadOptimizedNFTImage, supabase } from '../lib/supabase';
import { useBlockchainMint } from '../hooks/useBlockchain';
import { removeCommas, addCommas, convertKRWtoETH } from '../lib/priceUtils';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(2)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(2)};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.textSub};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semibold};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadow.primary};
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing(1.5)};
  background: ${({ theme }) => theme.colors.bgLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.text};
  transition: ${({ theme }) => theme.transition.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textDark};
  }
`;

const PriceInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PriceInput = styled(Input)`
  padding-right: 40px; /* "원" 텍스트를 위한 공간 */
`;

const CurrencyUnit = styled.span`
  position: absolute;
  right: ${({ theme }) => theme.spacing(1.5)};
  color: ${({ theme }) => theme.colors.textSub};
  font-size: ${({ theme }) => theme.font.size.md};
  pointer-events: none;
  user-select: none;
`;

const Textarea = styled.textarea`
  padding: ${({ theme }) => theme.spacing(1.5)};
  background: ${({ theme }) => theme.colors.bgLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.text};
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: ${({ theme }) => theme.transition.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textDark};
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.colors.bgLight};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  position: relative;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.card};
  }

  svg {
    width: 48px;
    height: 48px;
    color: ${({ theme }) => theme.colors.textSub};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  p {
    font-size: ${({ theme }) => theme.font.size.md};
    color: ${({ theme }) => theme.colors.textSub};
  }

  span {
    font-size: ${({ theme }) => theme.font.size.sm};
    color: ${({ theme }) => theme.colors.textDark};
    margin-top: ${({ theme }) => theme.spacing(1)};
  }
`;

const DragDropArea = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== '$isDragOver',
})`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ $isDragOver, theme }) => 
    $isDragOver ? `${theme.colors.primary}15` : theme.colors.bgLight};
  border: 2px dashed ${({ $isDragOver, theme }) => 
    $isDragOver ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  position: relative;
  min-height: 200px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.card};
  }

  svg {
    width: 48px;
    height: 48px;
    color: ${({ $isDragOver, theme }) => 
      $isDragOver ? theme.colors.primary : theme.colors.textSub};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    transition: ${({ theme }) => theme.transition.fast};
  }

  p {
    font-size: ${({ theme }) => theme.font.size.md};
    color: ${({ $isDragOver, theme }) => 
      $isDragOver ? theme.colors.primary : theme.colors.textSub};
    transition: ${({ theme }) => theme.transition.fast};
  }

  span {
    font-size: ${({ theme }) => theme.font.size.sm};
    color: ${({ theme }) => theme.colors.textDark};
    margin-top: ${({ theme }) => theme.spacing(1)};
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 2px;
  overflow: hidden;
  margin-top: ${({ theme }) => theme.spacing(2)};

  &::after {
    content: '';
    display: block;
    width: ${({ $progress }) => $progress}%;
    height: 100%;
    background: ${({ theme }) => theme.colors.primary};
    transition: width 0.3s ease;
  }
`;

const DragOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => `${theme.colors.primary}20`};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  pointer-events: none;

  p {
    font-size: ${({ theme }) => theme.font.size.lg};
    font-weight: ${({ theme }) => theme.font.weight.bold};
    color: ${({ theme }) => theme.colors.primary};
    margin: 0;
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.radius.md};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing(1.5)};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
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

const ProgressSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing(1.5)};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const PriceInfo = styled.div`
  color: ${({ theme }) => theme.colors.textSub};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

function Create() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(true);
  
  // 블록체인 민팅 훅
  const { 
    mintNFT, 
    isMinting, 
    mintError, 
    mintSuccess, 
    transactionHash, 
    isConfirmed 
  } = useBlockchainMint();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '', // ETH 가격 (계산된 값)
    krwPrice: '', // 원화 가격 (사용자 입력)
    file: null,
  });

  const [preview, setPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const dragDropRef = useRef(null);

  const handleOpenModal = () => {
    if (!isConnected) {
      alert('지갑을 먼저 연결해주세요.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', description: '', price: '', krwPrice: '', file: null });
    setPreview('');
    setErrors({});
    setIsDragOver(false);
    setUploadProgress(0);
    navigate('/'); // 모달 닫을 때 홈으로 이동
  };


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'krwPrice') {
      // 콤마 제거 후 숫자만 추출
      const numericValue = removeCommas(value);

      // 숫자가 아닌 경우 빈 문자열로 처리
      if (numericValue === '' || /^\d+$/.test(numericValue)) {
        const krwAmount = parseInt(numericValue) || 0;
        const ethAmount = convertKRWtoETH(krwAmount);

        // 콤마가 포함된 값으로 표시
        const formattedValue = numericValue === '' ? '' : addCommas(numericValue);

        setFormData((prev) => ({
          ...prev,
          krwPrice: formattedValue,
          price: ethAmount.toString()
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // 에러 초기화
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 파일 처리 공통 함수
  const processFile = async (file) => {
    try {
      // 이미지 유틸리티 함수 import
      const { validateImageFile } = await import('../lib/imageUtils.js');
      
      // 파일 검증
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, file: validation.errors.join(', ') }));
        return;
      }

      setFormData((prev) => ({ ...prev, file }));
      setErrors(prev => ({ ...prev, file: '' }));

      // 이미지 미리보기
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

    } catch (error) {
      setErrors(prev => ({ ...prev, file: '파일 처리 중 오류가 발생했습니다.' }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processFile(file);
    }
  };

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    
    if (files.length === 0) {
      return;
    }

    // 첫 번째 파일만 처리 (나중에 다중 파일 지원 추가)
    const file = files[0];
    await processFile(file);
  };

  // 클릭 이벤트 핸들러 (모바일/데스크톱 공통)
  const handleAreaClick = () => {
    document.getElementById('file').click();
  };

  // 터치 이벤트를 안전하게 처리하기 위한 useEffect
  useEffect(() => {
    const dragDropElement = dragDropRef.current;
    if (!dragDropElement) return;

    const handleTouchStart = (e) => {
      setIsDragOver(true);
    };

    const handleTouchEnd = (e) => {
      setIsDragOver(false);
    };

    const handleTouchMove = (e) => {
      // 터치 이동 중에는 드래그 상태 유지
    };

    // passive: false로 설정하여 preventDefault 사용 가능
    dragDropElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    dragDropElement.addEventListener('touchend', handleTouchEnd, { passive: false });
    dragDropElement.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      dragDropElement.removeEventListener('touchstart', handleTouchStart);
      dragDropElement.removeEventListener('touchend', handleTouchEnd);
      dragDropElement.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'NFT 이름을 입력해주세요.';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력해주세요.';
    }
    
    // 콤마 제거 후 숫자 검증
    const numericKrwPrice = removeCommas(formData.krwPrice);
    if (!numericKrwPrice || parseInt(numericKrwPrice) <= 0) {
      newErrors.krwPrice = '올바른 가격을 입력해주세요.';
    }
    
    if (!formData.file) {
      newErrors.file = '이미지를 선택해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // NFT 등록 시작

      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // 1. 최적화된 이미지를 Supabase Storage에 업로드
      const imageResult = await uploadOptimizedNFTImage(formData.file, {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.8,
        thumbnailSize: 300,
        thumbnailQuality: 0.7,
        extractEXIF: true
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // 2. NFT 데이터를 로컬 스토리지에 저장 (임시)
      const nftData = {
        id: imageResult.id,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        image: imageResult.url, // 최적화된 이미지 URL
        thumbnailUrl: imageResult.thumbnailUrl, // 썸네일 URL
        imagePath: imageResult.path,
        creator: user.username,
        creatorId: user.id,
        createdAt: new Date().toISOString(),
        status: 'draft', // 임시 저장 상태
        optimization: imageResult.optimization // 최적화 정보
      };

      // 3. 블록체인 민팅 (현재 Web3.Storage 유지보수로 인해 비활성화)
      let blockchainResult = null;
      
      // 블록체인 민팅 활성화 (Sepolia 테스트넷)
      const enableBlockchain = true;
      
      if (isConnected && enableBlockchain) {
        try {
          blockchainResult = await mintNFT({
            ...nftData,
            imageMetadata: {
              fileName: imageResult.fileName,
              fileSize: imageResult.fileSize,
              mimeType: imageResult.mimeType,
              width: imageResult.width,
              height: imageResult.height,
              exifData: imageResult.optimization?.exifData,
              originalSize: imageResult.optimization?.originalSize,
              optimizedSize: imageResult.optimization?.optimizedSize,
              compressionRatio: imageResult.optimization?.compressionRatio
            }
          });
        } catch (blockchainError) {
          // 사용자가 트랜잭션을 거부한 경우 특별 처리
          if (blockchainError.code === 4001 || blockchainError.message?.includes('User denied')) {
            alert('⚠️ MetaMask에서 트랜잭션을 거부하셨습니다.\n\nNFT는 로컬에 저장되지만 블록체인에 민팅되지 않았습니다.\n\n다시 시도하려면 "등록" 버튼을 클릭하고 MetaMask에서 "승인"을 선택해주세요.');
          }
        }
      }

      // 4. Supabase에 NFT 메타데이터 저장
      let savedNftId = null;
      try {
        // 현재 로그인된 사용자 정보 가져오기
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !currentUser) {
          throw new Error('로그인이 필요합니다. 먼저 로그인해주세요.');
        }

        // 고유한 NFT ID 생성
        const nftId = `nft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        savedNftId = nftId;
        
        // 고유한 토큰 ID 생성 (블록체인 민팅 실패 시에도 고유성 보장)
        // 데이터베이스에서 정수 타입을 기대하므로 숫자로 변환
        const uniqueTokenId = blockchainResult?.tokenId ? 
          parseInt(blockchainResult.tokenId.toString()) : 
          Math.floor(Date.now() / 1000);
        
        // 1. nft_metadata 테이블에 메타데이터 저장
        const { data: metadataData, error: metadataError } = await supabase
          .from('nft_metadata')
          .insert({
            nft_id: nftId,
            name: formData.name,
            description: formData.description,
            image_url: imageResult.url,
            metadata_uri: blockchainResult?.metadataURI || null,
            attributes: [],
            creator_address: currentUser.id, // Supabase 사용자 ID 사용
            token_id: uniqueTokenId,
            transaction_hash: blockchainResult?.transactionHash || null,
            block_number: blockchainResult?.blockNumber || null
          })
          .select();

        if (metadataError) {
          throw new Error(`메타데이터 저장 실패: ${metadataError.message}`);
        }

        // 2. nft_listings 테이블에 리스팅 정보 저장
               const { data: listingData, error: listingError } = await supabase
                 .from('nft_listings')
                 .insert({
                   nft_id: nftId,
                   nft_contract_address: blockchainResult?.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
                   token_id: uniqueTokenId,
                   seller_address: currentUser.id, // Supabase 사용자 ID 사용
                   price_eth: parseFloat(formData.price),
                   price_krw: parseInt(removeCommas(formData.krwPrice)), // 콤마 제거 후 원화 가격
                   is_active: true
                 })
                 .select();

        if (listingError) {
          throw new Error(`리스팅 저장 실패: ${listingError.message}`);
        }
      } catch (dbError) {
        // 데이터베이스 저장 실패해도 로컬 저장은 계속 진행
      }

      // 5. 로컬 스토리지에도 백업 저장
      const finalNFTData = {
        ...nftData,
        blockchain: blockchainResult ? {
          transactionHash: blockchainResult.transactionHash,
          metadataURI: blockchainResult.metadataURI,
          isPending: blockchainResult.isPending
        } : null,
        status: blockchainResult ? 'minted' : 'draft'
      };

      const existingNFTs = JSON.parse(localStorage.getItem('draftNFTs') || '[]');
      existingNFTs.push(finalNFTData);
      localStorage.setItem('draftNFTs', JSON.stringify(existingNFTs));

      // 성공 메시지
      const compressionInfo = imageResult.optimization
        ? ` (압축률: ${imageResult.optimization.compressionRatio}%)`
        : '';
      
      let blockchainInfo = '';
      if (blockchainResult) {
        if (blockchainResult.skipped) {
          if (blockchainResult.reason === '민터 권한 없음') {
            blockchainInfo = ' (로컬 저장 완료 - 민터 권한이 필요합니다)';
          } else {
            blockchainInfo = ' (로컬 저장 완료 - 블록체인 민팅 건너뜀)';
          }
        } else if (blockchainResult.isPending) {
          blockchainInfo = ' + 블록체인 민팅 진행 중...';
        } else {
          blockchainInfo = ' + 블록체인 민팅 완료!';
        }
      } else if (isConnected && !enableBlockchain) {
        blockchainInfo = ' (로컬 저장 완료 - 블록체인 민팅 비활성화)';
      } else if (isConnected && enableBlockchain) {
        blockchainInfo = ' + 블록체인 민팅 시도됨';
      } else {
        blockchainInfo = ' (로컬 저장만 완료)';
      }

      // Supabase 저장 상태 메시지
      const supabaseInfo = savedNftId ? ' + Supabase 데이터베이스 저장 완료!' : ' (Supabase 저장 실패 - 로컬 저장만 완료)';

      alert(`NFT가 성공적으로 등록되었습니다!${compressionInfo}${blockchainInfo}${supabaseInfo}`);
      handleCloseModal();
      
      // 홈페이지로 이동하고 새로고침 이벤트 발생
      navigate('/');
      
      // 로컬 스토리지 변경 이벤트 발생 (홈페이지에서 감지)
      window.dispatchEvent(new Event('storage'));

    } catch (error) {
      alert('NFT 등록에 실패했습니다: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 지갑 연결 및 로그인 확인
  if (!user) {
    return (
      <Container>
        <Title>NFT 등록</Title>
        <Subtitle>NFT를 등록하려면 먼저 로그인해주세요</Subtitle>
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <a href="/login" style={{ 
            color: '#00539C', 
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            로그인하러 가기
          </a>
        </div>
      </Container>
    );
  }

  if (!isConnected) {
    return (
      <Container>
        <Title>NFT 등록</Title>
        <Subtitle>NFT를 등록하려면 지갑을 연결해주세요</Subtitle>
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <ConnectButton />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="NFT 등록하기"
      >
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>이미지 파일</Label>
            <FileInput
              type="file"
              id="file"
              name="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
            <DragDropArea
              ref={dragDropRef}
              $isDragOver={isDragOver}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleAreaClick}
            >
              {isDragOver && (
                <DragOverlay>
                  <p>이미지를 여기에 드롭하세요</p>
                </DragOverlay>
              )}
              
              {preview ? (
                <PreviewImage src={preview} alt="Preview" />
              ) : (
                <>
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p>이미지를 드래그하거나 클릭하여 선택</p>
                  <span>PNG, JPG, GIF, WebP (최대 10MB)</span>
                </>
              )}
              
              {isSubmitting && (
                <ProgressBar $progress={uploadProgress} />
              )}
            </DragDropArea>
            {errors.file && <ErrorMessage>{errors.file}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Label htmlFor="name">NFT 이름</Label>
            <Input
              type="text"
              id="name"
              name="name"
              placeholder="NFT 이름을 입력하세요"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="NFT에 대한 설명을 입력하세요"
              value={formData.description}
              onChange={handleChange}
              required
            />
            {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Label htmlFor="krwPrice">가격 (원화)</Label>
            <PriceInputContainer>
              <PriceInput
                type="text"
                id="krwPrice"
                name="krwPrice"
                placeholder="300,000"
                value={formData.krwPrice}
                onChange={handleChange}
                required
              />
              <CurrencyUnit>원</CurrencyUnit>
            </PriceInputContainer>
            {formData.price && (
              <PriceInfo>
                ETH: {parseFloat(formData.price).toFixed(6)}
              </PriceInfo>
            )}
            {errors.krwPrice && <ErrorMessage>{errors.krwPrice}</ErrorMessage>}
          </InputGroup>

          <Button type="submit" disabled={isSubmitting || isMinting}>
            {isMinting ? '블록체인 민팅 중...' : isSubmitting ? '저장 중...' : 'NFT 등록하기'}
          </Button>
        </Form>
      </Modal>
    </Container>
  );
}

export default Create;
