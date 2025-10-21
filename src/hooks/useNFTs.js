import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * NFT 목록을 가져오는 커스텀 훅
 */
export function useNFTs() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 NFT 목록 조회 시작...');

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
          thumbnail_path,
          original_size,
          optimized_size,
          compression_ratio,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false });

      if (imageError) {
        console.error('❌ NFT 이미지 조회 실패:', imageError);
        throw new Error(`이미지 데이터 조회 실패: ${imageError.message}`);
      }

      console.log('✅ NFT 이미지 데이터 조회 성공:', imageData?.length || 0, '개');

      // 2. 로컬 스토리지에서 NFT 메타데이터 조회
      const localNFTs = JSON.parse(localStorage.getItem('draftNFTs') || '[]');
      console.log('📦 로컬 스토리지 NFT 데이터:', localNFTs?.length || 0, '개');

      // 3. 이미지 데이터와 로컬 NFT 데이터를 매칭하여 완전한 NFT 객체 생성
      const completeNFTs = imageData?.map(image => {
        // 로컬 스토리지에서 해당 이미지와 매칭되는 NFT 찾기
        const localNFT = localNFTs.find(nft => nft.imagePath === image.file_path);
        
        if (localNFT) {
          // 로컬 데이터가 있으면 그것을 사용
          return {
            id: image.id,
            listingId: image.id, // NFTCard에서 사용하는 ID
            tokenId: image.id,
            name: localNFT.name,
            description: localNFT.description,
            price: localNFT.price,
            image: image.file_path ? `https://lrlqolmmuxmvuatvbjip.supabase.co/storage/v1/object/public/nft-images/${image.file_path}` : null,
            thumbnailUrl: image.thumbnail_path ? `https://lrlqolmmuxmvuatvbjip.supabase.co/storage/v1/object/public/nft-images/${image.thumbnail_path}` : null,
            creator: localNFT.creator,
            creatorId: localNFT.creatorId,
            createdAt: localNFT.createdAt,
            status: localNFT.status,
            optimization: localNFT.optimization,
            // Supabase 이미지 메타데이터
            imageMetadata: {
              fileName: image.file_name,
              fileSize: image.file_size,
              mimeType: image.mime_type,
              width: image.width,
              height: image.height,
              originalSize: image.original_size,
              optimizedSize: image.optimized_size,
              compressionRatio: image.compression_ratio
            }
          };
        } else {
          // 로컬 데이터가 없으면 이미지 메타데이터만으로 기본 NFT 생성
          return {
            id: image.id,
            listingId: image.id,
            tokenId: image.id,
            name: image.file_name || 'Untitled NFT',
            description: 'No description available',
            price: '0',
            image: image.file_path ? `https://lrlqolmmuxmvuatvbjip.supabase.co/storage/v1/object/public/nft-images/${image.file_path}` : null,
            thumbnailUrl: image.thumbnail_path ? `https://lrlqolmmuxmvuatvbjip.supabase.co/storage/v1/object/public/nft-images/${image.thumbnail_path}` : null,
            creator: 'Unknown',
            creatorId: image.user_id,
            createdAt: image.created_at,
            status: 'draft',
            imageMetadata: {
              fileName: image.file_name,
              fileSize: image.file_size,
              mimeType: image.mime_type,
              width: image.width,
              height: image.height,
              originalSize: image.original_size,
              optimizedSize: image.optimized_size,
              compressionRatio: image.compression_ratio
            }
          };
        }
      }) || [];

      console.log('🎨 완성된 NFT 목록:', completeNFTs?.length || 0, '개');
      setNfts(completeNFTs);

    } catch (error) {
      console.error('❌ NFT 목록 조회 실패:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchNFTs();
  };

  return {
    nfts,
    loading,
    error,
    refetch
  };
}
