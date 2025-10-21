// 🔥 완전히 새로 작성한 로그인 페이지 (초간단 버전)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { signInWithEmail } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';

export default function LoginSimple() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('📝 로그인 폼 제출:', formData.email);

      const result = await signInWithEmail(
        formData.email,
        formData.password
      );

      // UserContext 업데이트
      setUser({
        id: result.user.id,
        email: result.user.email,
        username: result.user.user_metadata?.username || 'User',
        display_name: result.user.user_metadata?.display_name || 'User',
      });

      console.log('✅ 로그인 완료, 홈으로 이동');
      navigate('/');

    } catch (err) {
      console.error('❌ 로그인 오류:', err);
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Box>
        <Title>로그인 (간단 버전)</Title>
        
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            name="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <Button type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </Form>

        <Link onClick={() => navigate('/signup')}>
          계정이 없으신가요? 회원가입
        </Link>
      </Box>
    </Container>
  );
}

// Styled Components (회원가입과 동일)
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Box = styled.div`
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 30px;
  text-align: center;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background: #5568d3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.div`
  padding: 10px;
  background: #fee;
  color: #c00;
  border-radius: 5px;
  font-size: 14px;
`;

const Link = styled.div`
  text-align: center;
  margin-top: 20px;
  color: #667eea;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`;
