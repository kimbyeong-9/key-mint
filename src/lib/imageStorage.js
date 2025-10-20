// 이미지 저장 및 관리 유틸리티
import { storeFiles } from 'web3.storage';

/**
 * 이미지 파일 유효성 검사
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Object} { isValid: boolean, error?: string }
 */
export function validateImageFile(file) {
  // 파일 타입 검사
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: '지원되지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 허용)'
    };
  }

  // 파일 크기 검사 (10MB 제한)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: '파일 크기가 너무 큽니다. (최대 10MB)'
    };
  }

  return { isValid: true };
}

/**
 * 이미지 미리보기 URL 생성
 * @param {File} file - 이미지 파일
 * @returns {string} 미리보기 URL
 */
export function createImagePreview(file) {
  return URL.createObjectURL(file);
}

/**
 * 이미지 미리보기 URL 해제 (메모리 누수 방지)
 * @param {string} url - 미리보기 URL
 */
export function revokeImagePreview(url) {
  URL.revokeObjectURL(url);
}

/**
 * 이미지 리사이즈 (썸네일 생성)
 * @param {File} file - 원본 이미지 파일
 * @param {number} maxWidth - 최대 너비
 * @param {number} maxHeight - 최대 높이
 * @param {number} quality - 품질 (0-1)
 * @returns {Promise<File>} 리사이즈된 이미지 파일
 */
export function resizeImage(file, maxWidth = 300, maxHeight = 300, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 비율 계산
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // 캔버스 크기 설정
      canvas.width = width;
      canvas.height = height;

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);

      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('이미지 리사이즈 실패'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('이미지 로드 실패'));
    img.src = createImagePreview(file);
  });
}

/**
 * IPFS에 이미지 업로드
 * @param {File} file - 업로드할 이미지 파일
 * @param {string} token - Web3.Storage 토큰
 * @returns {Promise<string>} IPFS 해시
 */
export async function uploadToIPFS(file, token) {
  try {
    if (!token) {
      throw new Error('Web3.Storage 토큰이 설정되지 않았습니다.');
    }

    const client = new Web3Storage({ token });
    const cid = await client.put([file], {
      name: file.name,
      wrapWithDirectory: false
    });

    return cid;
  } catch (error) {
    console.error('IPFS 업로드 오류:', error);
    throw new Error(`IPFS 업로드 실패: ${error.message}`);
  }
}

/**
 * 이미지 메타데이터 생성
 * @param {File} file - 이미지 파일
 * @param {string} ipfsHash - IPFS 해시
 * @param {Object} additionalData - 추가 메타데이터
 * @returns {Object} 이미지 메타데이터
 */
export function createImageMetadata(file, ipfsHash, additionalData = {}) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    ipfsHash,
    ipfsUrl: `https://${ipfsHash}.ipfs.w3s.link`,
    uploadedAt: new Date().toISOString(),
    ...additionalData
  };
}

/**
 * 로컬 스토리지에 이미지 메타데이터 저장
 * @param {string} key - 저장 키
 * @param {Object} metadata - 이미지 메타데이터
 */
export function saveImageMetadata(key, metadata) {
  try {
    const existingData = JSON.parse(localStorage.getItem('imageMetadata') || '{}');
    existingData[key] = metadata;
    localStorage.setItem('imageMetadata', JSON.stringify(existingData));
  } catch (error) {
    console.error('메타데이터 저장 오류:', error);
  }
}

/**
 * 로컬 스토리지에서 이미지 메타데이터 조회
 * @param {string} key - 조회 키
 * @returns {Object|null} 이미지 메타데이터
 */
export function getImageMetadata(key) {
  try {
    const data = JSON.parse(localStorage.getItem('imageMetadata') || '{}');
    return data[key] || null;
  } catch (error) {
    console.error('메타데이터 조회 오류:', error);
    return null;
  }
}

/**
 * 모든 이미지 메타데이터 조회
 * @returns {Object} 모든 이미지 메타데이터
 */
export function getAllImageMetadata() {
  try {
    return JSON.parse(localStorage.getItem('imageMetadata') || '{}');
  } catch (error) {
    console.error('메타데이터 조회 오류:', error);
    return {};
  }
}

/**
 * 이미지 메타데이터 삭제
 * @param {string} key - 삭제할 키
 */
export function deleteImageMetadata(key) {
  try {
    const existingData = JSON.parse(localStorage.getItem('imageMetadata') || '{}');
    delete existingData[key];
    localStorage.setItem('imageMetadata', JSON.stringify(existingData));
  } catch (error) {
    console.error('메타데이터 삭제 오류:', error);
  }
}

/**
 * 이미지 파일을 Base64로 변환
 * @param {File} file - 이미지 파일
 * @returns {Promise<string>} Base64 문자열
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Base64 문자열을 File 객체로 변환
 * @param {string} base64 - Base64 문자열
 * @param {string} filename - 파일명
 * @param {string} mimeType - MIME 타입
 * @returns {File} File 객체
 */
export function base64ToFile(base64, filename, mimeType) {
  const arr = base64.split(',');
  const mime = mimeType || arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}
