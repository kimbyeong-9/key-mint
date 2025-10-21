import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Modal from '../components/Modal';
import { useUser } from '../contexts/UserContext';
import { uploadOptimizedNFTImage } from '../lib/supabase';
import { useBlockchainMint } from '../hooks/useBlockchain';

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

const SuccessMessage = styled.div`
  color: ${({ theme }) => theme.colors.success};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(1)};
  background: ${({ theme }) => `${theme.colors.success}15`};
  border: 1px solid ${({ theme }) => theme.colors.success};
  border-radius: ${({ theme }) => theme.radius.sm};
`;

function Create() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
    price: '',
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
    setFormData({ name: '', description: '', price: '', file: null });
    setPreview('');
    setErrors({});
    setIsDragOver(false);
    setUploadProgress(0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
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
      console.error('파일 처리 실패:', error);
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

  // 다중 파일 처리 (향후 확장용)
  const handleMultipleFiles = async (files) => {
    if (files.length === 0) return;
    
    // 현재는 첫 번째 파일만 처리
    const file = files[0];
    await processFile(file);
    
    // 향후 다중 파일 지원 시 여기에 로직 추가
    console.log('다중 파일 업로드 준비 중...', files.length, '개 파일');
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
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = '올바른 가격을 입력해주세요.';
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
      console.log('🚀 NFT 등록 시작:', formData);

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

      console.log('✅ 최적화된 이미지 업로드 완료:', imageResult);

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
      
      // Web3.Storage 상태 확인 후 활성화
      const enableBlockchain = true; // 블록체인 민팅 활성화
      
      if (isConnected && enableBlockchain) {
        try {
          console.log('⛓️ 블록체인 민팅 시작...');
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

          console.log('✅ 블록체인 민팅 완료:', blockchainResult);
        } catch (blockchainError) {
          console.warn('⚠️ 블록체인 민팅 실패 (로컬 저장은 계속 진행):', blockchainError);
        }
      } else if (isConnected && !enableBlockchain) {
        console.log('📝 블록체인 민팅 비활성화 (Web3.Storage 유지보수 중)');
      } else if (isConnected && enableBlockchain) {
        console.log('📝 블록체인 민팅 활성화 - 로컬 메타데이터 사용');
      }

      // 4. 로컬 스토리지에 저장
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

      console.log('✅ NFT 데이터 저장 완료');

      // 성공 메시지
      const compressionInfo = imageResult.optimization
        ? ` (압축률: ${imageResult.optimization.compressionRatio}%)`
        : '';
      
      let blockchainInfo = '';
      if (blockchainResult) {
        if (blockchainResult.skipped) {
          blockchainInfo = ' (로컬 저장 완료 - 블록체인 민팅은 컨트랙트 배포 후 가능)';
        } else if (blockchainResult.isPending) {
          blockchainInfo = ' + 블록체인 민팅 진행 중...';
        } else {
          blockchainInfo = ' + 블록체인 민팅 완료!';
        }
      } else if (isConnected && !enableBlockchain) {
        blockchainInfo = ' (로컬 저장 완료 - 블록체인 민팅은 Web3.Storage 복구 후 가능)';
      } else if (isConnected && enableBlockchain) {
        blockchainInfo = ' + 블록체인 민팅 완료! (로컬 메타데이터 사용)';
      } else {
        blockchainInfo = ' (로컬 저장만 완료)';
      }

      alert(`NFT가 성공적으로 등록되었습니다!${compressionInfo}${blockchainInfo}`);
      handleCloseModal();
      
      // 홈페이지로 이동하고 새로고침 이벤트 발생
      navigate('/');
      
      // 로컬 스토리지 변경 이벤트 발생 (홈페이지에서 감지)
      window.dispatchEvent(new Event('storage'));

    } catch (error) {
      console.error('❌ NFT 등록 실패:', error);
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
      <Title>NFT 등록</Title>
      <Subtitle>나만의 디지털 아트를 민팅하고 판매하세요</Subtitle>

      <CreateButton onClick={handleOpenModal}>
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        새 NFT 등록
      </CreateButton>

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
            <Label htmlFor="price">가격 (ETH)</Label>
            <Input
              type="number"
              id="price"
              name="price"
              placeholder="0.1"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              required
            />
            {errors.price && <ErrorMessage>{errors.price}</ErrorMessage>}
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
