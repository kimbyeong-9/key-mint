import styled from 'styled-components';
import { addCommas, removeCommas, convertKRWtoETH } from '../lib/priceUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(1.5)};
  padding-right: 40px;
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

const CurrencyUnit = styled.span`
  position: absolute;
  right: ${({ theme }) => theme.spacing(1.5)};
  color: ${({ theme }) => theme.colors.textSub};
  font-size: ${({ theme }) => theme.font.size.md};
  pointer-events: none;
  user-select: none;
`;

const PriceInfo = styled.div`
  color: ${({ theme }) => theme.colors.textSub};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

function PriceInput({
  id = 'krwPrice',
  name = 'krwPrice',
  value,
  onChange,
  error,
  placeholder = '300,000',
  required = false,
  showETHConversion = true
}) {
  const handleChange = (e) => {
    const inputValue = e.target.value;

    // 콤마 제거 후 숫자만 추출
    const numericValue = removeCommas(inputValue);

    // 숫자가 아닌 경우 빈 문자열로 처리
    if (numericValue === '' || /^\d+$/.test(numericValue)) {
      const krwAmount = parseInt(numericValue) || 0;
      const ethAmount = convertKRWtoETH(krwAmount);

      // 콤마가 포함된 값으로 표시
      const formattedValue = numericValue === '' ? '' : addCommas(numericValue);

      // 부모 컴포넌트에 값 전달
      onChange({
        krwPrice: formattedValue,
        ethPrice: ethAmount.toString(),
        krwPriceRaw: krwAmount // 숫자 그대로
      });
    }
  };

  // ETH 변환 값 계산
  const ethValue = value ? convertKRWtoETH(parseInt(removeCommas(value)) || 0) : 0;

  return (
    <Container>
      <Label htmlFor={id}>가격 (원화)</Label>
      <InputContainer>
        <Input
          type="text"
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          required={required}
        />
        <CurrencyUnit>원</CurrencyUnit>
      </InputContainer>
      {showETHConversion && ethValue > 0 && (
        <PriceInfo>ETH: {ethValue.toFixed(6)}</PriceInfo>
      )}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Container>
  );
}

export default PriceInput;
