import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';

/**
 * NFT 리스팅을 관리하는 커스텀 훅
 */
export function useNFTListing() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // NFT 리스팅 생성
  const createListing = useCallback(async (nftData, priceKRW) => {
    if (!user?.id) {
      throw new Error('로그인이 필요합니다.');
    }

    setIsLoading(true);
    setError(null);

    try {
      // KRW를 ETH로 변환
      const { data: ethAmount, error: convertError } = await supabase.rpc('convert_krw_to_eth', {
        krw_amount: priceKRW
      });

      if (convertError) {
        throw new Error(`환율 변환 실패: ${convertError.message}`);
      }

      // NFT 리스팅 생성
      const { data: listingId, error: listingError } = await supabase.rpc('create_nft_listing', {
        nft_id_param: nftData.id,
        nft_contract_address_param: nftData.contractAddress || import.meta.env.VITE_VAULT_NFT_ADDRESS,
        token_id_param: nftData.tokenId || nftData.id,
        seller_address_param: user.wallet_address || user.id,
        price_eth_param: ethAmount,
        price_krw_param: priceKRW
      });

      if (listingError) {
        throw new Error(`리스팅 생성 실패: ${listingError.message}`);
      }

      console.log('✅ NFT 리스팅 생성 완료:', listingId);
      return listingId;

    } catch (err) {
      console.error('❌ NFT 리스팅 생성 실패:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 활성 리스팅 조회
  const getActiveListings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('nft_listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`리스팅 조회 실패: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      console.error('❌ 리스팅 조회 실패:', err);
      setError(err.message);
      return [];
    }
  }, []);

  // 사용자의 리스팅 조회
  const getUserListings = useCallback(async () => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('nft_listings')
        .select('*')
        .eq('seller_address', user.wallet_address || user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`사용자 리스팅 조회 실패: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      console.error('❌ 사용자 리스팅 조회 실패:', err);
      setError(err.message);
      return [];
    }
  }, [user]);

  // 리스팅 비활성화
  const deactivateListing = useCallback(async (listingId) => {
    if (!user?.id) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      const { error } = await supabase
        .from('nft_listings')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', listingId)
        .eq('seller_address', user.wallet_address || user.id);

      if (error) {
        throw new Error(`리스팅 비활성화 실패: ${error.message}`);
      }

      console.log('✅ 리스팅 비활성화 완료');
      return true;
    } catch (err) {
      console.error('❌ 리스팅 비활성화 실패:', err);
      setError(err.message);
      throw err;
    }
  }, [user]);

  return {
    createListing,
    getActiveListings,
    getUserListings,
    deactivateListing,
    isLoading,
    error
  };
}
