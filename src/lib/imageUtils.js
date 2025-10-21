import EXIF from 'exif-js';

/**
 * 이미지 리사이징 함수
 * @param {File} file - 원본 이미지 파일
 * @param {number} maxWidth - 최대 너비
 * @param {number} maxHeight - 최대 높이
 * @param {number} quality - 압축 품질 (0-1)
 * @returns {Promise<File>} - 리사이징된 이미지 파일
 */
export async function resizeImage(file, maxWidth = 2048, maxHeight = 2048, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // 원본 이미지 크기
        let { width, height } = img;

        // 비율을 유지하면서 리사이징
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

        // Canvas 크기 설정
        canvas.width = width;
        canvas.height = height;

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height);

        // Blob으로 변환
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // 원본 파일명 유지하면서 새 파일 생성
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(resizedFile);
            } else {
              reject(new Error('이미지 리사이징 실패'));
            }
          },
          file.type,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('이미지 로드 실패'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 썸네일 생성 함수
 * @param {File} file - 원본 이미지 파일
 * @param {number} size - 썸네일 크기 (정사각형)
 * @param {number} quality - 압축 품질 (0-1)
 * @returns {Promise<File>} - 썸네일 이미지 파일
 */
export async function createThumbnail(file, size = 300, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // 정사각형 썸네일을 위해 비율 계산
        const { width, height } = img;
        let cropX = 0;
        let cropY = 0;
        let cropSize = Math.min(width, height);

        // 중앙에서 정사각형으로 크롭
        if (width > height) {
          cropX = (width - height) / 2;
        } else {
          cropY = (height - width) / 2;
        }

        // Canvas 크기 설정
        canvas.width = size;
        canvas.height = size;

        // 이미지 그리기 (크롭된 부분을 썸네일 크기로)
        ctx.drawImage(
          img,
          cropX, cropY, cropSize, cropSize,
          0, 0, size, size
        );

        // Blob으로 변환
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], `thumb_${file.name}`, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(thumbnailFile);
            } else {
              reject(new Error('썸네일 생성 실패'));
            }
          },
          file.type,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('이미지 로드 실패'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * EXIF 데이터 추출 함수
 * @param {File} file - 이미지 파일
 * @returns {Promise<Object>} - EXIF 데이터 객체
 */
export async function extractEXIFData(file) {
  return new Promise((resolve) => {
    EXIF.getData(file, function() {
      try {
        const exifData = {
          // 기본 이미지 정보
          width: EXIF.getTag(this, 'PixelXDimension') || null,
          height: EXIF.getTag(this, 'PixelYDimension') || null,
          
          // 카메라 정보
          make: EXIF.getTag(this, 'Make') || null,
          model: EXIF.getTag(this, 'Model') || null,
          software: EXIF.getTag(this, 'Software') || null,
          
          // 촬영 정보
          dateTime: EXIF.getTag(this, 'DateTime') || null,
          dateTimeOriginal: EXIF.getTag(this, 'DateTimeOriginal') || null,
          dateTimeDigitized: EXIF.getTag(this, 'DateTimeDigitized') || null,
          
          // 촬영 설정
          fNumber: EXIF.getTag(this, 'FNumber') || null,
          exposureTime: EXIF.getTag(this, 'ExposureTime') || null,
          iso: EXIF.getTag(this, 'ISOSpeedRatings') || null,
          focalLength: EXIF.getTag(this, 'FocalLength') || null,
          flash: EXIF.getTag(this, 'Flash') || null,
          
          // GPS 정보
          gpsLatitude: EXIF.getTag(this, 'GPSLatitude') || null,
          gpsLongitude: EXIF.getTag(this, 'GPSLongitude') || null,
          gpsLatitudeRef: EXIF.getTag(this, 'GPSLatitudeRef') || null,
          gpsLongitudeRef: EXIF.getTag(this, 'GPSLongitudeRef') || null,
          
          // 방향 정보
          orientation: EXIF.getTag(this, 'Orientation') || null,
          
          // 기타
          whiteBalance: EXIF.getTag(this, 'WhiteBalance') || null,
          colorSpace: EXIF.getTag(this, 'ColorSpace') || null,
        };

        // null 값 제거
        const cleanedData = Object.fromEntries(
          Object.entries(exifData).filter(([_, value]) => value !== null)
        );

        resolve(cleanedData);
      } catch (error) {
        console.warn('EXIF 데이터 추출 실패:', error);
        resolve({});
      }
    });
  });
}

/**
 * 이미지 최적화 통합 함수
 * @param {File} file - 원본 이미지 파일
 * @param {Object} options - 최적화 옵션
 * @returns {Promise<Object>} - 최적화된 이미지 정보
 */
export async function optimizeImage(file, options = {}) {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.8,
    thumbnailSize = 300,
    thumbnailQuality = 0.7,
    extractEXIF = true
  } = options;

  try {
    console.log('🖼️ 이미지 최적화 시작:', file.name);

    // 1. 원본 이미지 크기 확인
    const originalSize = file.size;
    console.log('📏 원본 크기:', formatFileSize(originalSize));

    // 2. 이미지 리사이징
    const resizedFile = await resizeImage(file, maxWidth, maxHeight, quality);
    const resizedSize = resizedFile.size;
    console.log('📐 리사이징 완료:', formatFileSize(resizedSize));

    // 3. 썸네일 생성
    const thumbnailFile = await createThumbnail(file, thumbnailSize, thumbnailQuality);
    const thumbnailSize_bytes = thumbnailFile.size;
    console.log('🖼️ 썸네일 생성 완료:', formatFileSize(thumbnailSize_bytes));

    // 4. EXIF 데이터 추출
    let exifData = {};
    if (extractEXIF) {
      exifData = await extractEXIFData(file);
      console.log('📊 EXIF 데이터 추출 완료:', Object.keys(exifData).length, '개 항목');
    }

    // 5. 결과 반환
    const result = {
      originalFile: file,
      optimizedFile: resizedFile,
      thumbnailFile: thumbnailFile,
      originalSize,
      optimizedSize: resizedSize,
      thumbnailSize: thumbnailSize_bytes,
      compressionRatio: ((originalSize - resizedSize) / originalSize * 100).toFixed(1),
      exifData,
      dimensions: {
        width: resizedFile.width || null,
        height: resizedFile.height || null
      }
    };

    console.log('✅ 이미지 최적화 완료:', {
      압축률: `${result.compressionRatio}%`,
      원본: formatFileSize(originalSize),
      최적화: formatFileSize(resizedSize),
      썸네일: formatFileSize(thumbnailSize_bytes)
    });

    return result;

  } catch (error) {
    console.error('❌ 이미지 최적화 실패:', error);
    throw error;
  }
}

/**
 * 파일 크기 포맷팅 함수
 * @param {number} bytes - 바이트 크기
 * @returns {string} - 포맷된 크기 문자열
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 이미지 파일 유효성 검사
 * @param {File} file - 검사할 파일
 * @returns {Object} - 검사 결과
 */
export function validateImageFile(file) {
  const errors = [];
  
  // 파일 존재 확인
  if (!file) {
    errors.push('파일이 선택되지 않았습니다.');
    return { isValid: false, errors };
  }

  // 파일 크기 확인 (10MB 제한)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push(`파일 크기가 너무 큽니다. (최대 ${formatFileSize(maxSize)})`);
  }

  // 파일 형식 확인
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('지원되지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 허용)');
  }

  // 파일명 확인
  if (!file.name || file.name.trim() === '') {
    errors.push('파일명이 올바르지 않습니다.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
