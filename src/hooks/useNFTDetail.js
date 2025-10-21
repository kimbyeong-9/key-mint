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

      // 1. Supabase에서 NFT 이미지 메타데이터 조회
      const { data: imageData, error: imageError } = await supabase
        .from('nft_images')
        .select(`
          id,
          file_name,
          file_path,
          file_size,
          mime_type,
          width,
          height,
          exif_data,
          thumbnail_path,
          original_size,
          optimized_size,
          compression_ratio,
          created_at,
          user_id
        `)
        .eq('id', nftId)
        .single();

      if (imageError) {
        console.error('❌ NFT 이미지 조회 실패:', imageError);
        throw new Error(`이미지 데이터 조회 실패: ${imageError.message}`);
      }

      if (!imageData) {
        throw new Error('해당 NFT를 찾을 수 없습니다.');
      }

      console.log('✅ NFT 이미지 데이터 조회 성공:', imageData);

      // 2. 로컬 스토리지에서 NFT 메타데이터 조회
      const localNFTs = JSON.parse(localStorage.getItem('draftNFTs') || '[]');
      const localNFT = localNFTs.find(nft => nft.imagePath === imageData.file_path);

      // 3. 완전한 NFT 객체 생성
      const completeNFT = {
        id: imageData.id,
        listingId: imageData.id,
        tokenId: imageData.id,
        name: localNFT?.name || imageData.file_name || 'Untitled NFT',
        description: localNFT?.description || 'No description available',
        price: localNFT?.price || '0',
        image: imageData.file_path ? 
          `https://lrlqolmmuxmvuatvbjip.supabase.co/storage/v1/object/public/nft-images/${imageData.file_path}` : 
          null,
        thumbnailUrl: imageData.thumbnail_path ? 
          `https://lrlqolmmuxmvuatvbjip.supabase.co/storage/v1/object/public/nft-images/${imageData.thumbnail_path}` : 
          null,
        creator: localNFT?.creator || 'Unknown',
        creatorId: localNFT?.creatorId || imageData.user_id,
        createdAt: localNFT?.createdAt || imageData.created_at,
        status: localNFT?.status || 'draft',
        optimization: localNFT?.optimization || null,
        // Supabase 이미지 메타데이터
        imageMetadata: {
          fileName: imageData.file_name,
          fileSize: imageData.file_size,
          mimeType: imageData.mime_type,
          width: imageData.width,
          height: imageData.height,
          exifData: imageData.exif_data,
          originalSize: imageData.original_size,
          optimizedSize: imageData.optimized_size,
          compressionRatio: imageData.compression_ratio,
          createdAt: imageData.created_at
        }
      };

      console.log('🎨 완성된 NFT 상세 정보:', completeNFT);
      setNft(completeNFT);

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
