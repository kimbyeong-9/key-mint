import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * 개별 NFT 상세 정보를 가져오는 커스텀 훅
 */
export function useNFTDetail(nftId) {
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!nftId) {
      setLoading(false);
      return;
    }

    fetchNFTDetail();
  }, [nftId]);

  const fetchNFTDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 NFT 상세 정보 조회 시작:', nftId);

      // 로컬 스토리지에서 NFT 데이터 조회
      const localNFTs = JSON.parse(localStorage.getItem('draftNFTs') || '[]');
      
      console.log('📦 로컬 스토리지 전체 NFT 목록:');
      localNFTs.forEach((nft, index) => {
        console.log(`${index + 1}. ID: ${nft.id}, Name: ${nft.name}`);
      });
      
      console.log('🔍 찾는 NFT ID:', nftId);
      console.log('🔍 ID 타입:', typeof nftId);
      
      const foundNFT = localNFTs.find(nft => {
        // ID 타입 변환하여 비교 (문자열 ↔ 숫자)
        const nftIdStr = String(nft.id);
        const searchIdStr = String(nftId);
        console.log(`비교: ${nftIdStr} === ${searchIdStr} (${nftIdStr === searchIdStr})`);
        return nftIdStr === searchIdStr;
      });

      if (!foundNFT) {
        console.log('❌ NFT를 찾을 수 없음. 사용 가능한 ID들:', localNFTs.map(nft => nft.id));
        throw new Error('해당 NFT를 찾을 수 없습니다.');
      }

      console.log('✅ NFT 데이터 조회 성공:', foundNFT);
      setNft(foundNFT);

    } catch (error) {
      console.error('❌ NFT 상세 정보 조회 실패:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchNFTDetail();
  };

  return {
    nft,
    loading,
    error,
    refetch
  };
}
