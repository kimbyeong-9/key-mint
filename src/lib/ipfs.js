import { Web3Storage } from 'web3.storage';

// Web3.Storage 클라이언트 초기화
const getAccessToken = () => {
  // 환경변수에서 API 토큰 가져오기
  const token = import.meta.env.VITE_WEB3_STORAGE_TOKEN;
  if (!token) {
    throw new Error('VITE_WEB3_STORAGE_TOKEN이 설정되지 않았습니다.');
  }
  return token;
};

const makeStorageClient = () => {
  return new Web3Storage({ 
    token: getAccessToken(),
    // 재시도 설정을 더 빠르게
    retries: 1,
    timeout: 5000 // 5초 타임아웃
  });
};

/**
 * 파일을 IPFS에 업로드
 * @param {File} file - 업로드할 파일
 * @returns {Promise<string>} IPFS CID
 */
export async function uploadToIPFS(file) {
  try {
    console.log('📤 IPFS 업로드 시작:', file.name);
    
    const client = makeStorageClient();
    const cid = await client.put([file], {
      name: file.name,
      maxRetries: 3
    });
    
    console.log('✅ IPFS 업로드 성공:', cid);
    return cid;
  } catch (error) {
    console.error('❌ IPFS 업로드 실패:', error);
    throw new Error(`IPFS 업로드 실패: ${error.message}`);
  }
}

/**
 * 메타데이터를 IPFS에 업로드
 * @param {Object} metadata - NFT 메타데이터
 * @returns {Promise<string>} IPFS URI
 */
export async function uploadMetadataToIPFS(metadata) {
  try {
    console.log('📤 메타데이터 IPFS 업로드 시작:', metadata.name);
    
    const client = makeStorageClient();
    
    // 메타데이터를 JSON 파일로 변환
    const metadataFile = new File(
      [JSON.stringify(metadata, null, 2)],
      'metadata.json',
      { type: 'application/json' }
    );
    
    const cid = await client.put([metadataFile], {
      name: `${metadata.name}-metadata`,
      maxRetries: 3
    });
    
    const ipfsURI = `ipfs://${cid}/metadata.json`;
    console.log('✅ 메타데이터 IPFS 업로드 성공:', ipfsURI);
    
    return ipfsURI;
  } catch (error) {
    console.error('❌ 메타데이터 IPFS 업로드 실패:', error);
    throw new Error(`메타데이터 IPFS 업로드 실패: ${error.message}`);
  }
}

/**
 * IPFS URI를 HTTP URL로 변환
 * @param {string} ipfsURI - IPFS URI (ipfs://...)
 * @returns {string} HTTP URL
 */
export function ipfsToHttp(ipfsURI) {
  if (!ipfsURI) return null;
  
  if (ipfsURI.startsWith('ipfs://')) {
    const cid = ipfsURI.replace('ipfs://', '');
    return `https://w3s.link/ipfs/${cid}`;
  }
  
  return ipfsURI;
}

/**
 * IPFS에서 메타데이터 가져오기
 * @param {string} ipfsURI - IPFS URI
 * @returns {Promise<Object>} 메타데이터 객체
 */
export async function fetchMetadata(ipfsURI) {
  try {
    const httpURL = ipfsToHttp(ipfsURI);
    console.log('🔍 메타데이터 조회:', httpURL);
    
    const response = await fetch(httpURL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const metadata = await response.json();
    console.log('✅ 메타데이터 조회 성공:', metadata);
    
    return metadata;
  } catch (error) {
    console.error('❌ 메타데이터 조회 실패:', error);
    throw new Error(`메타데이터 조회 실패: ${error.message}`);
  }
}

/**
 * NFT 메타데이터 생성
 * @param {Object} nftData - NFT 데이터
 * @returns {Object} 표준 NFT 메타데이터
 */
export function createNFTMetadata(nftData) {
  const metadata = {
    name: nftData.name,
    description: nftData.description,
    image: nftData.image,
    external_url: nftData.external_url || '',
    attributes: []
  };

  // 이미지 메타데이터를 attributes에 추가
  if (nftData.imageMetadata) {
    const { width, height, fileSize, mimeType, compressionRatio } = nftData.imageMetadata;
    
    if (width && height) {
      metadata.attributes.push({
        trait_type: "Dimensions",
        value: `${width} × ${height}`
      });
    }
    
    if (fileSize) {
      metadata.attributes.push({
        trait_type: "File Size",
        value: `${(fileSize / 1024 / 1024).toFixed(2)} MB`
      });
    }
    
    if (mimeType) {
      metadata.attributes.push({
        trait_type: "File Type",
        value: mimeType
      });
    }
    
    if (compressionRatio) {
      metadata.attributes.push({
        trait_type: "Compression Ratio",
        value: `${compressionRatio}%`
      });
    }
  }

  // EXIF 데이터를 attributes에 추가
  if (nftData.imageMetadata?.exifData) {
    const exif = nftData.imageMetadata.exifData;
    
    if (exif.Make) {
      metadata.attributes.push({
        trait_type: "Camera Make",
        value: exif.Make
      });
    }
    
    if (exif.Model) {
      metadata.attributes.push({
        trait_type: "Camera Model",
        value: exif.Model
      });
    }
    
    if (exif.DateTime) {
      metadata.attributes.push({
        trait_type: "Capture Date",
        value: exif.DateTime
      });
    }
  }

  // 크리에이터 정보 추가
  if (nftData.creator) {
    metadata.attributes.push({
      trait_type: "Creator",
      value: nftData.creator
    });
  }

  return metadata;
}