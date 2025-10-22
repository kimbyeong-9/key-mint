import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * NFT 목록을 가져오는 커스텀 훅 (Supabase 연동)
 */
export function useNFTs() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNFTs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Supabase에서 NFT 목록 조회 시작...');

      // 1. NFT 메타데이터 조회
      const { data: metadataData, error: metadataError } = await supabase
        .from('nft_metadata')
        .select('*')
        .order('created_at', { ascending: false });

      if (metadataError) {
        throw new Error(`NFT 메타데이터 조회 실패: ${metadataError.message}`);
      }

      console.log('📊 NFT 메타데이터 조회 성공:', metadataData.length, '개');

      // 2. NFT 리스팅 조회
      const { data: listingsData, error: listingsError } = await supabase
        .from('nft_listings')
        .select('*')
        .eq('is_active', true);

      if (listingsError) {
        throw new Error(`NFT 리스팅 조회 실패: ${listingsError.message}`);
      }

      console.log('📊 NFT 리스팅 조회 성공:', listingsData.length, '개');

      // 3. 크리에이터 정보 조회
      const uniqueCreatorIds = [...new Set(metadataData.map(nft => nft.creator_address))];
      console.log('👥 크리에이터 ID 목록:', uniqueCreatorIds);

      let creatorProfiles = {};
      if (uniqueCreatorIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, display_name, full_name')
          .in('id', uniqueCreatorIds);

        if (profilesError) {
          console.warn('⚠️ 사용자 프로필 조회 실패:', profilesError);
        } else {
          // 프로필 데이터를 ID로 매핑
          creatorProfiles = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
          console.log('👤 크리에이터 프로필 조회 성공:', Object.keys(creatorProfiles).length, '명');
        }
      }

      // 4. 데이터 병합 및 변환
      const transformedNFTs = metadataData.map(nft => {
        const listing = listingsData.find(l => l.nft_id === nft.nft_id);
        const creatorProfile = creatorProfiles[nft.creator_address];
        
        // 크리에이터 이름 결정 (우선순위: display_name > full_name > creator_address)
        const creatorName = creatorProfile?.display_name || 
                           creatorProfile?.full_name || 
                           nft.creator_address?.substring(0, 8) + '...' || 
                           'Unknown Creator';

        return {
          id: nft.nft_id,
          name: nft.name,
          description: nft.description,
          image: nft.image_url,
          price: listing?.price_eth?.toString() || '0.1',
          priceKrw: listing?.price_krw || 300000,
          attributes: nft.attributes || [],
          creator: creatorName,
          creatorId: nft.creator_address,
          createdAt: nft.created_at,
          isActive: listing?.is_active || false,
          // 추가 정보
          tokenId: nft.token_id,
          transactionHash: nft.transaction_hash,
          blockNumber: nft.block_number
        };
      }).filter(nft => nft.isActive); // 활성 리스팅만 필터링

      console.log('✅ Supabase NFT 목록 조회 성공:', transformedNFTs.length, '개');
      setNfts(transformedNFTs);

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