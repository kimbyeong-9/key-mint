import { useState, useEffect, useCallback } from 'react';

/**
 * NFT 목록을 가져오는 커스텀 훅
 */
export function useNFTs() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNFTs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 NFT 목록 조회 시작...');

      // 로컬 스토리지에서 NFT 데이터 조회
      const localNFTs = JSON.parse(localStorage.getItem('draftNFTs') || '[]');

      // 생성일 기준으로 정렬
      const sortedNFTs = localNFTs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log('✅ NFT 목록 조회 성공:', sortedNFTs.length, '개');
      setNfts(sortedNFTs);

    } catch (error) {
      console.error('❌ NFT 목록 조회 실패:', error);
      setError(error.message);
      setNfts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  return { nfts, loading, error, refetch: fetchNFTs };
}