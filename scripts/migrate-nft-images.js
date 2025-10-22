import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * NFT 이미지를 메타데이터로 변환하는 함수
 */
async function migrateNFTImages() {
  try {
    console.log('🔄 NFT 이미지 마이그레이션 시작...');

    // 1. 모든 NFT 이미지 조회
    const { data: images, error: imagesError } = await supabase
      .from('nft_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (imagesError) {
      throw new Error(`이미지 조회 실패: ${imagesError.message}`);
    }

    console.log(`📸 총 ${images.length}개의 NFT 이미지 발견`);

    // 2. 각 이미지를 메타데이터로 변환
    for (const image of images) {
      try {
        console.log(`🔄 이미지 처리 중: ${image.file_name}`);

        // 이미지 URL 생성
        const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/nft-images/${image.file_name}`;

        // 메타데이터 생성
        const metadata = {
          name: image.file_name.replace(/\.[^/.]+$/, ''), // 확장자 제거
          description: `NFT created from ${image.file_name}`,
          image: imageUrl,
          attributes: [
            {
              trait_type: 'Creator',
              value: 'User Generated'
            },
            {
              trait_type: 'File Type',
              value: image.file_name.split('.').pop().toUpperCase()
            }
          ]
        };

        // NFT 메타데이터 저장
        const { data: metadataResult, error: metadataError } = await supabase
          .from('nft_metadata')
          .insert({
            id: image.id, // 이미지 ID를 NFT ID로 사용
            name: metadata.name,
            description: metadata.description,
            image_url: imageUrl,
            metadata: metadata,
            creator_id: image.user_id,
            created_at: image.created_at
          });

        if (metadataError) {
          console.error(`❌ 메타데이터 저장 실패 (${image.file_name}):`, metadataError);
          continue;
        }

        // NFT 리스팅 생성 (기본 가격 0.1 ETH)
        const { error: listingError } = await supabase
          .from('nft_listings')
          .insert({
            nft_id: image.id,
            seller_id: image.user_id,
            price_eth: 0.1,
            status: 'active',
            created_at: image.created_at
          });

        if (listingError) {
          console.error(`❌ 리스팅 생성 실패 (${image.file_name}):`, listingError);
        } else {
          console.log(`✅ 성공: ${image.file_name} → NFT 메타데이터 및 리스팅 생성`);
        }

      } catch (error) {
        console.error(`❌ 이미지 처리 실패 (${image.file_name}):`, error);
      }
    }

    console.log('🎉 NFT 이미지 마이그레이션 완료!');

  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
  }
}

// 스크립트 실행
migrateNFTImages();
