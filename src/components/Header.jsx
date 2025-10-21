import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAccount } from 'wagmi';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { useUser } from '../contexts/UserContext';
import { useWalletConnection } from '../hooks/useWalletConnection';

const HeaderContainer = styled.header`
  width: 100%;
  background: ${({ theme }) => theme.colors.bgLight};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
`;

const HeaderContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing(2)};
  }
`;

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-decoration: none;
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    opacity: 0.8;
    transform: translateY(-2px);
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    gap: ${({ theme }) => theme.spacing(2)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing(1.5)};
  }
`;

const NavLink = styled(Link)`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.textSub};
  transition: ${({ theme }) => theme.transition.fast};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radius.sm};
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.card};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.sm};
    padding: ${({ theme }) => theme.spacing(0.5)} ${({ theme }) => theme.spacing(1)};
  }
`;

const UserGreeting = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radius.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.sm};
    gap: ${({ theme }) => theme.spacing(0.5)};
    padding: ${({ theme }) => theme.spacing(0.5)} ${({ theme }) => theme.spacing(1)};
  }
`;

const GreetingText = styled.span`
  color: ${({ theme }) => theme.colors.textSub};
  font-size: ${({ theme }) => theme.font.size.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.sm};
  }
`;

const Nickname = styled.span`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: #60a5fa; /* 더 밝은 파란색 */
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    color: #3b82f6; /* 호버 시 더 밝은 파란색 */
    text-decoration-color: #3b82f6; /* 밑줄 색상 표시 */
    transform: translateY(-1px);
    text-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.md};
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.radius.md};
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.card};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: block;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSub};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radius.md};
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.card};
  }
`;

const DesktopLogoutButton = styled(LogoutButton)`
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`;

// 지갑 연결 섹션 스타일
const WalletConnectSection = styled.div`
  padding: ${({ theme }) => theme.spacing(2)} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const WalletConnectLabel = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

// 사용자 정보 모달 스타일
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 5vh;
  z-index: 9998;
  cursor: pointer;
  backdrop-filter: blur(2px);
  transition: all 0.3s ease;
  overflow-y: auto;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(4)};
  max-width: 450px;
  width: 90%;
  max-height: 80vh;
  box-shadow: ${({ theme }) => theme.shadow.lg};
  position: relative;
  animation: modalFadeIn 0.3s ease-out;
  cursor: default;
  user-select: none;
  overflow-y: auto;
  margin: 20px 20px 40px 20px;

  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing(3)};
    max-width: 90%;
    max-height: 85vh;
    margin: 15px 15px 30px 15px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(2.5)};
    border-radius: ${({ theme }) => theme.radius.md};
    max-width: 95%;
    max-height: 90vh;
    margin: 10px 10px 20px 10px;
  }
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  text-align: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.lg};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }
`;

const ModalInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(1.5)} 0;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(1)} 0;
  }
`;

const ModalLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.textSub};
  font-weight: ${({ theme }) => theme.font.weight.medium};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.sm};
  }
`;

const ModalValue = styled.span`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.font.weight.semibold};
  word-break: break-all;
  text-align: right;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.sm};
  }
`;

const Web3Tag = styled.span`
  background-color: ${({ theme }) => theme.colors.success};
  color: white;
  padding: ${({ theme }) => theme.spacing(0.5)} ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  white-space: nowrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 10px;
    padding: 3px 6px;
  }
`;

const WalletAddress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ConnectedStatus = styled.span`
  color: ${({ theme }) => theme.colors.success};
  font-size: 12px;
  font-weight: 500;
`;

const DisconnectedStatus = styled.span`
  color: ${({ theme }) => theme.colors.textSub};
  font-size: 14px;
`;

// 지갑 연결 UI 스타일
const ConnectedWalletInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const WalletAddressText = styled.div`
  font-family: 'Courier New', monospace;
  background: ${({ theme }) => theme.colors.card};
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const DisconnectButton = styled.button`
  background: ${({ theme }) => theme.colors.error};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.errorHover};
  }
`;

const WalletConnectButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: 100%;
`;

const WalletButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 12px 16px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  min-width: 120px;

  &:hover {
    background: ${({ theme }) => theme.colors.bgLight};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const WalletIcon = styled.span`
  font-size: 18px;
`;

const WalletConnectButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 12px 16px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  margin-bottom: 8px;

  &:hover {
    background: ${({ theme }) => theme.colors.bgLight};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:active {
    transform: translateY(1px);
  }
`;

// 상태 박스 오른쪽에 작게 놓일 해제 버튼 배치용 래퍼
const WalletStatusWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const DisconnectInlineButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSub};
  font-size: 13px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.bgLight};
  }
`;

// 지갑 연결 모달 스타일
const WalletModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 5vh;
  z-index: 9999;
  cursor: pointer;
  backdrop-filter: blur(2px);
  transition: all 0.3s ease;
  overflow-y: auto;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const WalletModalContent = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(4)};
  max-width: 450px;
  width: 90%;
  max-height: 80vh;
  box-shadow: ${({ theme }) => theme.shadow.lg};
  position: relative;
  animation: modalFadeIn 0.3s ease-out;
  cursor: default;
  user-select: none;
  overflow-y: auto;
  margin: 20px 20px 40px 20px;

  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing(3)};
    max-width: 90%;
    max-height: 85vh;
    margin: 15px 15px 30px 15px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(2.5)};
    border-radius: ${({ theme }) => theme.radius.md};
    max-width: 95%;
    max-height: 90vh;
    margin: 10px 10px 20px 10px;
  }
`;

const WalletModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  text-align: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.lg};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }
`;

const WalletModalCloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSub};
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  border-radius: 4px;
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.bgLight};
  }
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSub};
  font-size: ${({ theme }) => theme.font.size.xl};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.radius.sm};
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.bgLight};
  }
`;

const MobileMenu = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${({ theme }) => theme.colors.bgLight};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    flex-direction: column;
    padding: ${({ theme }) => theme.spacing(3)};
    gap: ${({ theme }) => theme.spacing(2)};
    box-shadow: ${({ theme }) => theme.shadow.lg};
    transform: ${({ $isOpen }) => ($isOpen ? 'translateY(0)' : 'translateY(-100%)')};
    opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
    visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
    transition: all 0.3s ease;
  }
`;

const MobileNavLink = styled(Link)`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.textSub};
  padding: ${({ theme }) => theme.spacing(1.5)};
  border-radius: ${({ theme }) => theme.radius.sm};
  text-align: center;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.card};
  }
`;

const DesktopNav = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    gap: ${({ theme }) => theme.spacing(2)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing(1)};
  }
`;

const CreateButton = styled.button`
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-weight: ${({ theme }) => theme.font.weight.semibold};
  font-size: ${({ theme }) => theme.font.size.md};
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

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
    font-size: ${({ theme }) => theme.font.size.sm};
  }
`;

const DesktopCreateButton = styled(CreateButton)`
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`;

function Header() {
  const navigate = useNavigate();
  const { user, userType, logout } = useUser();
  const { address, isConnected } = useAccount();
  const { disconnectWallet, isLoading: walletLoading, error: walletError } = useWalletConnection(user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const { openConnectModal } = useConnectModal();
  const [isOpeningWalletList, setIsOpeningWalletList] = useState(false);

  // 사용자 로그인 상태 확인
  const isLoggedIn = user && user.id;

  const handleCreateClick = () => {
    navigate('/create');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleUserInfoModal = () => {
    setShowUserInfoModal(!showUserInfoModal);
  };

  const openWalletList = async () => {
    if (isOpeningWalletList) return;
    try {
      setIsOpeningWalletList(true);
      if (openConnectModal) await openConnectModal();
    } finally {
      setIsOpeningWalletList(false);
      setMobileMenuOpen(false);
    }
  };

  // 지갑 연결 함수 (RainbowKit의 ConnectButton을 사용)
  const connectWallet = async (walletType) => {
    try {
      if (walletType === 'metamask') {
        if (window.ethereum) {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log('✅ MetaMask 연결 성공');
        } else {
          alert('MetaMask가 설치되지 않았습니다. MetaMask를 설치해주세요.');
          window.open('https://metamask.io/download/', '_blank');
        }
      } else if (walletType === 'coinbase') {
        if (window.coinbaseWalletExtension) {
          await window.coinbaseWalletExtension.request({ method: 'eth_requestAccounts' });
          console.log('✅ Coinbase Wallet 연결 성공');
        } else {
          alert('Coinbase Wallet이 설치되지 않았습니다. Coinbase Wallet을 설치해주세요.');
          window.open('https://www.coinbase.com/wallet', '_blank');
        }
      } else if (walletType === 'walletconnect') {
        // WalletConnect는 RainbowKit의 ConnectButton을 통해 처리
        console.log('WalletConnect 연결은 RainbowKit을 통해 처리됩니다.');
      }
    } catch (error) {
      console.error('❌ 지갑 연결 실패:', error);
      alert('지갑 연결에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 지갑 연결 상태는 useWalletConnection 훅에서 자동으로 처리됩니다

  // ESC 키로 모달 닫기, 스크롤 방지
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (showUserInfoModal) setShowUserInfoModal(false);
      }
    };

    if (showUserInfoModal) {
      document.addEventListener('keydown', handleEscKey);
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      // 모달이 닫힐 때 body 스크롤 복원
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showUserInfoModal]);

  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <Logo to="/">Key Mint</Logo>

          <Nav>
            {/* 데스크톱 네비게이션 */}
            <DesktopNav>
              {isLoggedIn ? (
                // 로그인된 상태
                <>
                  <UserGreeting onClick={toggleUserInfoModal} data-user-greeting>
                    <GreetingText>어서오세요</GreetingText>
                    <Nickname>{user.username}</Nickname>
                    <GreetingText>님</GreetingText>
                  </UserGreeting>
                  <DesktopCreateButton onClick={handleCreateClick}>
                    NFT 등록
                  </DesktopCreateButton>
                  <DesktopLogoutButton onClick={logout}>
                    로그아웃
                  </DesktopLogoutButton>
                </>
              ) : (
                // 로그인되지 않은 상태
                <>
                  <NavLink to="/login">로그인</NavLink>
                  <NavLink to="/signup">회원가입</NavLink>
                </>
              )}
            </DesktopNav>

            {/* 모바일 햄버거 버튼 - 로그인된 사용자만 표시 */}
            {isLoggedIn && (
              <MobileMenuButton
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="메뉴"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </MobileMenuButton>
            )}
          </Nav>

          {/* 모바일 드롭다운 메뉴 - 로그인된 사용자만 */}
          {isLoggedIn && (
            <MobileMenu $isOpen={mobileMenuOpen}>
                     <UserGreeting onClick={toggleUserInfoModal} data-user-greeting>
                       <GreetingText>어서오세요</GreetingText>
                       <Nickname>{user.username}</Nickname>
                       <GreetingText>님</GreetingText>
                     </UserGreeting>
                     
                    {/* 지갑 연결/해제 영역 */}
                    {isConnected ? (
                      <WalletStatusWrapper>
                        <WalletConnectButton disabled>
                          <WalletIcon>🔗</WalletIcon>
                          {`지갑 연결됨 (${address?.slice(0, 6)}...)`}
                        </WalletConnectButton>
                        <DisconnectInlineButton onClick={disconnectWallet} disabled={walletLoading}>
                          {walletLoading ? '해제 중…' : '연결 해제'}
                        </DisconnectInlineButton>
                      </WalletStatusWrapper>
                    ) : (
                      <WalletConnectButton onClick={openWalletList} disabled={isOpeningWalletList}>
                        <WalletIcon>🔗</WalletIcon>
                        {isOpeningWalletList ? '열는 중...' : '지갑 연결'}
                      </WalletConnectButton>
                    )}
                     
              <CreateButton onClick={() => { handleCreateClick(); closeMobileMenu(); }}>
                NFT 등록
              </CreateButton>
              <LogoutButton onClick={() => { logout(); closeMobileMenu(); }}>
                로그아웃
              </LogoutButton>
            </MobileMenu>
          )}
        </HeaderContent>

      </HeaderContainer>

      {/* 사용자 정보 모달 - HeaderContainer 밖에서 렌더링 */}
      {showUserInfoModal && isLoggedIn && (
        <ModalOverlay
          onClick={() => {
            console.log('ModalOverlay clicked - closing modal');
            setShowUserInfoModal(false);
          }}
        >
          <ModalContent 
            data-modal-content
            onClick={(e) => {
              console.log('ModalContent clicked - preventing close');
              e.stopPropagation();
            }}
          >
          <ModalCloseButton onClick={toggleUserInfoModal}>✕</ModalCloseButton>
          <ModalTitle>사용자 정보</ModalTitle>
          <ModalInfoRow>
            <ModalLabel>사용자</ModalLabel>
            <ModalValue>{user.username}</ModalValue>
          </ModalInfoRow>
          <ModalInfoRow>
            <ModalLabel>이메일</ModalLabel>
            <ModalValue>{user.email}</ModalValue>
          </ModalInfoRow>
          <ModalInfoRow>
            <ModalLabel>계정 타입</ModalLabel>
            <ModalValue>
              {user.is_web3_user || isConnected ? <Web3Tag>WEB3 사용자</Web3Tag> : '일반 사용자'}
            </ModalValue>
          </ModalInfoRow>
          <ModalInfoRow>
            <ModalLabel>지갑 연결</ModalLabel>
            <ModalValue>
              {isConnected && address ? (
                <WalletAddress>
                  {address.slice(0, 6)}...{address.slice(-4)}
                  <ConnectedStatus>연결됨</ConnectedStatus>
                </WalletAddress>
              ) : (
                <DisconnectedStatus>연결되지 않음</DisconnectedStatus>
              )}
            </ModalValue>
          </ModalInfoRow>
        </ModalContent>
      </ModalOverlay>
    )}

      {/* 커스텀 지갑 모달 제거: RainbowKit 모달만 사용 */}
    </>
  );
}

export default Header;
