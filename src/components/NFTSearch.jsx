import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  padding-right: 50px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
  transition: ${({ theme }) => theme.transition.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSub};
  }
`;


const FilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(3)};
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;

const FilterButton = styled.button`
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.card};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primaryHover : theme.colors.border};
    transform: translateY(-1px);
  }
`;

const PriceFilterButton = styled(FilterButton)`
  background: ${({ theme }) => theme.colors.bgLight};
  border-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary}10;
  }
`;

const SortFilterButton = styled(FilterButton)`
  background: ${({ theme }) => theme.colors.bgLight};
  border-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary}10;
  }
`;

const SortSelect = styled.select`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.sm};
  cursor: pointer;
`;

const ClearButton = styled.button`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.bgLight};
  color: ${({ theme }) => theme.colors.textSub};
  font-size: ${({ theme }) => theme.font.size.sm};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ResultsCount = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
`;

// 모달 애니메이션
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(4)};
  max-width: 400px;
  width: 90%;
  box-shadow: ${({ theme }) => theme.shadow.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  text-align: center;
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const OptionButton = styled.button`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.bgLight};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  text-align: left;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primaryHover : theme.colors.border};
    transform: translateX(4px);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $primary, theme }) => $primary ? theme.colors.primary : theme.colors.bgLight};
  color: ${({ $primary, theme }) => $primary ? 'white' : theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.sm};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ $primary, theme }) => $primary ? theme.colors.primaryHover : theme.colors.border};
  }
`;

// 가격 범위 옵션
const priceRanges = [
  { label: '전체', value: 'all' },
  { label: '0.01 ETH 이하', value: '0.01' },
  { label: '0.01 - 0.1 ETH', value: '0.01-0.1' },
  { label: '0.1 - 1 ETH', value: '0.1-1' },
  { label: '1 ETH 이상', value: '1+' }
];

// 정렬 옵션
const sortOptions = [
  { label: '최신순', value: 'newest' },
  { label: '오래된순', value: 'oldest' },
  { label: '가격 낮은순', value: 'price-low' },
  { label: '가격 높은순', value: 'price-high' },
  { label: '이름순', value: 'name' }
];

function NFTSearch({ 
  onSearch, 
  onClear, 
  searchTerm, 
  resultsCount = 0 
}) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');

  useEffect(() => {
    setLocalSearchTerm(searchTerm || '');
  }, [searchTerm]);


  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    onSearch(value);
  };

  const handleClear = () => {
    setLocalSearchTerm('');
    onClear();
  };

  return (
    <SearchContainer>
      <SearchInput
        type="text"
        placeholder="NFT 이름, 설명, 또는 ID로 검색..."
        value={localSearchTerm}
        onChange={handleSearchChange}
      />

      {localSearchTerm && (
        <FilterContainer>
          <ClearButton onClick={handleClear}>
            초기화
          </ClearButton>
        </FilterContainer>
      )}

      {resultsCount > 0 && (
        <ResultsCount>
          {resultsCount}개의 결과를 찾았습니다
        </ResultsCount>
      )}

    </SearchContainer>
  );
}

export default NFTSearch;