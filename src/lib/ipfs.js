// IPFS 업로드 유틸리티
// web3.storage 또는 Pinata 사용 가능

/**
 * IPFS에 파일 업로드
 * @param {File} file - 업로드할 파일
 * @param {Object} metadata - NFT 메타데이터 { name, description, price }
 * @returns {Promise<string>} - IPFS URI (ipfs://...)
 */
export async function uploadToIPFS(file, metadata) {
  try {
    // 방법 1: 백엔드 API를 통한 업로드 (권장)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('IPFS 업로드 실패');
    }

    const data = await response.json();
    return data.uri; // ipfs://...

    // 방법 2: 클라이언트에서 직접 업로드 (web3.storage 사용 시)
    // const Web3Storage = (await import('web3.storage')).Web3Storage;
    // const client = new Web3Storage({ token: import.meta.env.VITE_WEB3_STORAGE_TOKEN });
    //
    // // 이미지 업로드
    // const imageCid = await client.put([file], { wrapWithDirectory: false });
    //
    // // 메타데이터 생성
    // const metadataObj = {
    //   name: metadata.name,
    //   description: metadata.description,
    //   image: `ipfs://${imageCid}/${file.name}`,
    //   attributes: [
    //     {
    //       trait_type: "Price",
    //       value: metadata.price
    //     }
    //   ]
    // };
    //
    // // 메타데이터 업로드
    // const blob = new Blob([JSON.stringify(metadataObj)], { type: 'application/json' });
    // const metadataFile = new File([blob], 'metadata.json');
    // const metaCid = await client.put([metadataFile], { wrapWithDirectory: false });
    //
    // return `ipfs://${metaCid}/metadata.json`;

  } catch (error) {
    console.error('IPFS 업로드 에러:', error);
    throw error;
  }
}

/**
 * IPFS URI를 HTTP URL로 변환
 * @param {string} ipfsUri - IPFS URI (ipfs://...)
 * @returns {string} - HTTP URL
 */
export function ipfsToHttp(ipfsUri) {
  if (!ipfsUri) return '';

  if (ipfsUri.startsWith('ipfs://')) {
    const cid = ipfsUri.replace('ipfs://', '');
    // 다양한 IPFS 게이트웨이 사용 가능
    return `https://ipfs.io/ipfs/${cid}`;
    // 또는: return `https://gateway.pinata.cloud/ipfs/${cid}`;
    // 또는: return `https://w3s.link/ipfs/${cid}`;
  }

  return ipfsUri;
}

/**
 * NFT 메타데이터 가져오기
 * @param {string} tokenUri - 토큰 URI
 * @returns {Promise<Object>} - 메타데이터 객체
 */
export async function fetchMetadata(tokenUri) {
  try {
    const url = ipfsToHttp(tokenUri);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('메타데이터 가져오기 실패');
    }

    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('메타데이터 가져오기 에러:', error);
    return null;
  }
}
