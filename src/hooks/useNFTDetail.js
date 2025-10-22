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

      console.log('🔍 Supabase에서 NFT 상세 정보 조회 시작:', nftId);

      // 1. NFT 메타데이터 조회
      const { data: metadataData, error: metadataError } = await supabase
        .from('nft_metadata')
        .select('*')
        .eq('nft_id', nftId)
        .single();

      if (metadataError) {
        console.error('❌ NFT 메타데이터 조회 실패:', metadataError);
        throw new Error(`NFT 메타데이터 조회 실패: ${metadataError.message}`);
      }

      console.log('📊 NFT 메타데이터 조회 성공:', metadataData);

      // 2. NFT 리스팅 조회
      const { data: listingData, error: listingError } = await supabase
        .from('nft_listings')
        .select('*')
        .eq('nft_id', nftId)
        .eq('is_active', true)
        .single();

      if (listingError) {
        console.warn('⚠️ NFT 리스팅 조회 실패 (선택사항):', listingError);
      }

      console.log('📊 NFT 리스팅 조회 성공:', listingData);

      // 3. 데이터 변환 (Supabase 형식을 앱 형식으로)
      const transformedNFT = {
        id: metadataData.nft_id,
        name: metadataData.name,
        description: metadataData.description,
        image: metadataData.image_url,
        price: listingData?.price_eth?.toString() || '0.1',
        priceKrw: listingData?.price_krw || 300000,
        attributes: metadataData.attributes || [],
        creator: metadataData.creator_address,
        createdAt: metadataData.created_at,
        isActive: listingData?.is_active || false,
        // 추가 필드들
        tokenId: metadataData.token_id,
        transactionHash: metadataData.transaction_hash,
        blockNumber: metadataData.block_number,
        metadataUri: metadataData.metadata_uri
      };

      console.log('✅ NFT 상세 정보 조회 성공:', transformedNFT);
      setNft(transformedNFT);

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
