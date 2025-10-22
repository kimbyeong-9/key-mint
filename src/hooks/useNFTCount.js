import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useNFTCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNFTCount = async () => {
    try {
      setLoading(true);
      setError(null);

      // Supabase 클라이언트를 사용하여 nft_metadata 테이블의 개수 조회
      const { count: nftCount, error: supabaseError } = await supabase
        .from('nft_metadata')
        .select('*', { count: 'exact', head: true });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setCount(nftCount || 0);
    } catch (err) {
      console.error('NFT 개수 조회 실패:', err);
      setError(err.message);
      // 에러 발생 시 기본값 0으로 설정
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNFTCount();
  }, []);

  // refetch 함수를 반환하여 외부에서 호출할 수 있도록 함
  return { count, loading, error, refetch: fetchNFTCount };
}
