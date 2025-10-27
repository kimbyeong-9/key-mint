import { useState, useEffect, useCallback } from 'react';
import { supabase, isOnline, isJWTExpired, isNetworkError } from '../lib/supabase';

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

      // 로컬 캐시에 저장 (오프라인 모드용) - 용량 최적화
      try {
        // 먼저 localStorage 정리 (저장 전에 공간 확보)
        try {
          console.log('🗑️ localStorage 정리 시작...');

          // Supabase 인증 토큰을 제외한 모든 항목 삭제
          const keysToKeep = ['sb-', 'supabase']; // Supabase 관련 키만 보존
          const allKeys = Object.keys(localStorage);
          let removedCount = 0;

          allKeys.forEach(key => {
            // Supabase 관련 키가 아니면 삭제
            if (!keysToKeep.some(keepKey => key.includes(keepKey))) {
              try {
                localStorage.removeItem(key);
                removedCount++;
              } catch (e) {
                // 개별 삭제 실패는 무시
              }
            }
          });

          console.log(`✅ localStorage 정리 완료: ${removedCount}개 항목 삭제`);
        } catch (cleanError) {
          console.warn('⚠️ localStorage 정리 중 오류:', cleanError);
        }

        // 이미지 데이터가 너무 크면 URL만 저장
        const cacheData = transformedNFTs.map(nft => ({
          id: nft.id,
          name: nft.name,
          description: nft.description?.substring(0, 100), // 설명 더 축약
          image: nft.image, // URL만 (base64 제외)
          price: nft.price,
          creator: nft.creator
        }));

        // 최대 30개만 캐시 (용량 더 절약)
        const limitedCache = cacheData.slice(0, 30);
        const cacheString = JSON.stringify(limitedCache);

        // 저장 시도
        localStorage.setItem('cached_nfts', cacheString);
        localStorage.setItem('cached_nfts_time', Date.now().toString());
        console.log(`💾 NFT 캐시 저장 완료: ${limitedCache.length}개 (${(cacheString.length / 1024).toFixed(2)}KB)`);

      } catch (cacheError) {
        // 저장 실패 시 조용히 무시 (오프라인 모드가 작동하지 않을 뿐, 앱은 정상 작동)
        console.log('ℹ️ 캐시 저장 생략 (localStorage 용량 부족)');
      }

    } catch (error) {
      console.error('❌ NFT 목록 조회 실패:', error);

      // JWT 만료 처리
      if (isJWTExpired(error)) {
        console.warn('⚠️ JWT 만료 - 로컬 캐시 사용');
        setError('세션이 만료되었습니다. 새로고침 후 다시 로그인해주세요.');
        // 로컬 캐시 사용
        const localNFTs = JSON.parse(localStorage.getItem('cached_nfts') || '[]');
        setNfts(localNFTs);
      }
      // 네트워크 오류 처리
      else if (isNetworkError(error) || !isOnline()) {
        console.warn('⚠️ 네트워크 오류 - 로컬 캐시 사용');
        setError('인터넷 연결을 확인해주세요. 캐시된 데이터를 표시합니다.');
        // 로컬 캐시 사용
        const localNFTs = JSON.parse(localStorage.getItem('cached_nfts') || '[]');
        setNfts(localNFTs);
      }
      // 기타 오류
      else {
        setError(error.message);
        setNfts([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  return { nfts, loading, error, refetch: fetchNFTs };
}