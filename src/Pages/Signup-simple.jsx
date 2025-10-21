// 🔥 완전히 새로 작성한 회원가입 페이지 (초간단 버전)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { signUpWithEmail } from '../lib/supabase-simple';

export default function SignupSimple() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');

    try {
      console.log('📝 회원가입 폼 제출:', formData);

      await signUpWithEmail(
        formData.email,
        formData.password,
        formData.username
      );

      setSuccess('✅ 회원가입 성공! 로그인 페이지로 이동합니다...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('❌ 회원가입 오류:', err);
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Box>
        <Title>회원가입 (간단 버전)</Title>
        
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="username"
            placeholder="사용자명"
            value={formData.username}
            onChange={handleChange}
            required
            minLength={2}
          />

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
            placeholder="비밀번호 (6자 이상)"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          {error && <ErrorMsg>{error}</ErrorMsg>}
          {success && <SuccessMsg>{success}</SuccessMsg>}

          <Button type="submit" disabled={loading}>
            {loading ? '처리 중...' : '회원가입'}
          </Button>
        </Form>

        <Link onClick={() => navigate('/login')}>
          이미 계정이 있으신가요? 로그인
        </Link>
      </Box>
    </Container>
  );
}

// Styled Components
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

const SuccessMsg = styled.div`
  padding: 10px;
  background: #efe;
  color: #0c0;
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
