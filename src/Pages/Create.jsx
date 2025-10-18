import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAccount } from 'wagmi';
import Modal from '../components/Modal';
import { useMint, useApprove } from '../hooks/useNFT';
import { useList } from '../hooks/useMarket';
import { uploadToIPFS } from '../lib/ipfs';
import { parseEther } from '../lib/format';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)} 0;
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
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1.5)};
  background: ${({ $completed, theme }) =>
    $completed ? `${theme.colors.success}20` : theme.colors.bgLight};
  border: 1px solid ${({ $active, $completed, theme }) =>
    $active ? theme.colors.primary : $completed ? theme.colors.success : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};

  span {
    font-size: ${({ theme }) => theme.font.size.sm};
    color: ${({ theme }) => theme.colors.text};
  }
`;

function Create() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    file: null,
  });

  const [preview, setPreview] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const { mint, isPending: isMinting, isSuccess: mintSuccess } = useMint();
  const { approve, isPending: isApproving, isSuccess: approveSuccess } = useApprove();
  const { list, isPending: isListing, isSuccess: listSuccess } = useList();

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
    setCurrentStep(0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));

      // 이미지 미리보기
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      alert('이미지를 선택해주세요.');
      return;
    }

    try {
      // Step 1: IPFS 업로드
      setCurrentStep(1);
      const tokenURI = await uploadToIPFS(formData.file, {
        name: formData.name,
        description: formData.description,
        price: formData.price,
      });

      // Step 2: NFT 민팅
      setCurrentStep(2);
      await mint(address, tokenURI);

      // 민팅 완료 후 토큰 ID 확인 필요 (이벤트 리스닝 또는 트랜잭션 receipt에서)
      // 여기서는 임시로 하드코딩 (실제로는 민팅 이벤트에서 가져와야 함)
      const tokenId = 1; // TODO: 실제 토큰 ID 가져오기

      // Step 3: Approve
      setCurrentStep(3);
      await approve(tokenId);

      // Step 4: 마켓플레이스에 등록
      setCurrentStep(4);
      const priceWei = parseEther(formData.price);
      await list(tokenId, formData.price);

      // 완료
      setCurrentStep(5);
      alert('NFT가 성공적으로 등록되었습니다!');
      setTimeout(() => {
        handleCloseModal();
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('NFT 등록 실패:', error);
      alert('NFT 등록에 실패했습니다: ' + error.message);
    }
  };

  const isPending = isMinting || isApproving || isListing;

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
            <Label htmlFor="file">이미지 파일</Label>
            <FileInput
              type="file"
              id="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
            <FileLabel htmlFor="file">
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
                  <p>클릭하여 이미지 선택</p>
                  <span>PNG, JPG, GIF (최대 10MB)</span>
                </>
              )}
            </FileLabel>
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
          </InputGroup>

          {isPending && (
            <ProgressSteps>
              <Step $active={currentStep === 1} $completed={currentStep > 1}>
                <span>{currentStep > 1 ? '✓' : '1'}</span>
                <span>IPFS 업로드</span>
              </Step>
              <Step $active={currentStep === 2} $completed={currentStep > 2}>
                <span>{currentStep > 2 ? '✓' : '2'}</span>
                <span>NFT 민팅</span>
              </Step>
              <Step $active={currentStep === 3} $completed={currentStep > 3}>
                <span>{currentStep > 3 ? '✓' : '3'}</span>
                <span>판매 권한 승인</span>
              </Step>
              <Step $active={currentStep === 4} $completed={currentStep > 4}>
                <span>{currentStep > 4 ? '✓' : '4'}</span>
                <span>마켓플레이스 등록</span>
              </Step>
            </ProgressSteps>
          )}

          <Button type="submit" disabled={isPending || !formData.file}>
            {isPending ? '처리 중...' : '등록하기'}
          </Button>
        </Form>
      </Modal>
    </Container>
  );
}

export default Create;
