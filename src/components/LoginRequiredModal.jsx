import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.bgLight};
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: ${({ theme }) => theme.spacing(6)};
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadow.large};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.textSub};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: center;
  align-items: stretch;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadow.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

const CloseButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.colors.bgLight};
  color: ${({ theme }) => theme.colors.textSub};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.card};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Icon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing(3)};
  font-size: 32px;
`;

function LoginRequiredModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    navigate('/login');
    onClose();
  };

  const handleClose = () => {
    navigate('/');
    onClose();
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Icon>🔐</Icon>
        <Title>로그인이 필요합니다</Title>
        <Description>
          NFT 상세 정보를 보려면 로그인이 필요합니다.
          <br />
          로그인 후 다양한 NFT 컬렉션을 확인할 수 있습니다.
        </Description>
        
        <ButtonGroup>
          <LoginButton onClick={handleLogin}>
            로그인하기
          </LoginButton>
          <CloseButton onClick={handleClose}>
            나중에 하기
          </CloseButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
}

export default LoginRequiredModal;

