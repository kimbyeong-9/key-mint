import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAccount } from 'wagmi';
import { useRegister } from '../hooks/useUserRegistry';

const Container = styled.div`
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const SignupBox = styled.div`
  width: 100%;
  max-width: 480px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(4)};
  box-shadow: ${({ theme }) => theme.shadow.lg};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.textSub};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const WalletInfo = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => `${theme.colors.primary}15`};
  border: 1px solid ${({ theme }) => `${theme.colors.primary}40`};
  border-radius: ${({ theme }) => theme.radius.md};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  text-align: center;

  p {
    font-size: ${({ theme }) => theme.font.size.sm};
    color: ${({ theme }) => theme.colors.textSub};
    margin-bottom: ${({ theme }) => theme.spacing(1)};
  }

  strong {
    font-size: ${({ theme }) => theme.font.size.md};
    color: ${({ theme }) => theme.colors.primary};
    word-break: break-all;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
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

const Info = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => `${theme.colors.secondary}15`};
  border: 1px solid ${({ theme }) => `${theme.colors.secondary}40`};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
  line-height: 1.6;

  strong {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing(3)};
  padding-top: ${({ theme }) => theme.spacing(3)};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};

  a {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.font.weight.semibold};
    margin-left: ${({ theme }) => theme.spacing(1)};

    &:hover {
      text-decoration: underline;
    }
  }
`;

const StatusMessage = styled.div`
  padding: ${({ theme }) => theme.spacing(1.5)};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.sm};
  text-align: center;
  background: ${({ $type, theme }) =>
    $type === 'success' ? `${theme.colors.success}20` : `${theme.colors.danger}20`};
  color: ${({ $type, theme }) =>
    $type === 'success' ? theme.colors.success : theme.colors.danger};
  border: 1px solid ${({ $type, theme }) =>
    $type === 'success' ? theme.colors.success : theme.colors.danger};
`;

function Signup() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { register, isPending, isConfirming, isSuccess, error } = useRegister();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 지갑 연결 확인
    if (!isConnected || !address) {
      alert('지갑을 먼저 연결해주세요.');
      return;
    }

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // 1단계: 백엔드에 사용자 정보 저장
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          username: formData.username,
          email: formData.email,
        }),
      });

      if (!response.ok) {
        throw new Error('사용자 등록 실패');
      }

      setStatusMessage('백엔드 등록 완료! 블록체인에 기록 중...');

      // 2단계: 블록체인에 사용자 등록 (해시값만 저장)
      await register(formData.username);

      setStatusMessage('블록체인 등록 완료!');

    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('회원가입에 실패했습니다: ' + error.message);
    }
  };

  // 트랜잭션 성공 시
  if (isSuccess) {
    setTimeout(() => {
      alert('회원가입이 완료되었습니다!');
      navigate('/');
    }, 2000);
  }

  return (
    <Container>
      <SignupBox>
        <Title>회원가입</Title>
        <Subtitle>블록체인 기반 NFT 마켓플레이스</Subtitle>

        {isConnected && address ? (
          <>
            <WalletInfo>
              <p>연결된 지갑</p>
              <strong>{address}</strong>
            </WalletInfo>

            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <Label htmlFor="username">사용자명</Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="사용자명을 입력하세요"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={20}
                />
              </InputGroup>

              <InputGroup>
                <Label htmlFor="email">이메일</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </InputGroup>

              <InputGroup>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </InputGroup>

              <InputGroup>
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </InputGroup>

              <Info>
                <strong>블록체인 등록:</strong> 회원가입 시 사용자명의 해시값이 블록체인에
                기록됩니다. 개인정보는 암호화되어 안전하게 보호됩니다.
              </Info>

              {statusMessage && (
                <StatusMessage $type={isSuccess ? 'success' : 'info'}>
                  {statusMessage}
                </StatusMessage>
              )}

              {error && (
                <StatusMessage $type="error">
                  에러: {error.message}
                </StatusMessage>
              )}

              <Button
                type="submit"
                disabled={isPending || isConfirming || isSuccess}
              >
                {isPending || isConfirming ? '등록 중...' : isSuccess ? '완료!' : '회원가입'}
              </Button>
            </Form>
          </>
        ) : (
          <Info>
            <strong>지갑 연결 필요:</strong> 회원가입을 위해서는 먼저 상단의 &quot;Connect Wallet&quot; 버튼을 클릭하여 지갑을 연결해주세요.
          </Info>
        )}

        <LoginLink>
          이미 계정이 있으신가요?
          <Link to="/login">로그인</Link>
        </LoginLink>
      </SignupBox>
    </Container>
  );
}

export default Signup;
