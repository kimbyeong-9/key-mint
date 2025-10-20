/**
 * 블록체인 사용자 데이터 암호화/복호화 유틸리티
 * Web Crypto API를 사용한 클라이언트 사이드 암호화
 */

import { keccak256, toBytes, toHex } from 'viem';

/**
 * 지갑 서명을 사용하여 암호화 키 생성
 * @param {string} walletAddress - 사용자 지갑 주소
 * @param {Function} signMessage - wagmi의 signMessage 함수
 * @returns {Promise<CryptoKey>} 암호화 키
 */
export async function generateEncryptionKey(walletAddress, signMessage) {
  try {
    // 1. 고유한 메시지 생성
    const message = `Generate encryption key for ${walletAddress}`;

    // 2. 지갑으로 메시지 서명
    const signature = await signMessage({ message });

    // 3. 서명을 키 재료로 사용
    const keyMaterial = toBytes(signature);

    // 4. Web Crypto API로 암호화 키 생성
    const key = await crypto.subtle.importKey(
      'raw',
      keyMaterial.slice(0, 32), // 32 bytes for AES-256
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );

    return key;
  } catch (error) {
    console.error('암호화 키 생성 실패:', error);
    throw new Error('Failed to generate encryption key');
  }
}

/**
 * 데이터 암호화
 * @param {string} plaintext - 암호화할 평문 데이터
 * @param {CryptoKey} key - 암호화 키
 * @returns {Promise<Object>} { iv, ciphertext } - 초기화 벡터와 암호문
 */
export async function encryptData(plaintext, key) {
  try {
    // 1. 초기화 벡터(IV) 생성 (12 bytes for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // 2. 평문을 바이트로 변환
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // 3. 암호화
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    // 4. IV와 암호문을 16진수 문자열로 변환
    return {
      iv: toHex(new Uint8Array(iv)),
      ciphertext: toHex(new Uint8Array(ciphertext)),
    };
  } catch (error) {
    console.error('데이터 암호화 실패:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * 데이터 복호화
 * @param {string} ivHex - 초기화 벡터 (16진수)
 * @param {string} ciphertextHex - 암호문 (16진수)
 * @param {CryptoKey} key - 복호화 키
 * @returns {Promise<string>} 복호화된 평문
 */
export async function decryptData(ivHex, ciphertextHex, key) {
  try {
    // 1. 16진수를 바이트 배열로 변환
    const iv = toBytes(ivHex);
    const ciphertext = toBytes(ciphertextHex);

    // 2. 복호화
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    // 3. 바이트를 문자열로 변환
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('데이터 복호화 실패:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * 사용자 데이터를 암호화하여 블록체인 저장 형태로 변환
 * @param {Object} userData - 사용자 데이터 { username, email, additionalData }
 * @param {CryptoKey} key - 암호화 키
 * @returns {Promise<Object>} 블록체인 저장용 암호화된 데이터
 */
export async function encryptUserData(userData, key) {
  try {
    const { username, email, additionalData } = userData;

    // 1. 사용자명 해시 생성 (검증용)
    const usernameHash = keccak256(toBytes(username));

    // 2. 이메일 암호화
    const encryptedEmail = await encryptData(email, key);

    // 3. 추가 데이터 암호화 (JSON 형태)
    const dataToEncrypt = JSON.stringify(additionalData || {});
    const encryptedData = await encryptData(dataToEncrypt, key);

    // 4. 블록체인 저장 형태로 변환
    return {
      usernameHash,
      encryptedEmail: combineIvAndCiphertext(encryptedEmail),
      encryptedData: combineIvAndCiphertext(encryptedData),
    };
  } catch (error) {
    console.error('사용자 데이터 암호화 실패:', error);
    throw new Error('Failed to encrypt user data');
  }
}

/**
 * 블록체인에서 가져온 암호화된 데이터를 복호화
 * @param {Object} encryptedUserData - 블록체인에서 가져온 암호화된 데이터
 * @param {CryptoKey} key - 복호화 키
 * @returns {Promise<Object>} 복호화된 사용자 데이터
 */
export async function decryptUserData(encryptedUserData, key) {
  try {
    const { encryptedEmail, encryptedData } = encryptedUserData;

    // 1. IV와 암호문 분리
    const emailParts = separateIvAndCiphertext(encryptedEmail);
    const dataParts = separateIvAndCiphertext(encryptedData);

    // 2. 이메일 복호화
    const email = await decryptData(emailParts.iv, emailParts.ciphertext, key);

    // 3. 추가 데이터 복호화
    const dataJson = await decryptData(dataParts.iv, dataParts.ciphertext, key);
    const additionalData = JSON.parse(dataJson);

    return {
      email,
      additionalData,
    };
  } catch (error) {
    console.error('사용자 데이터 복호화 실패:', error);
    throw new Error('Failed to decrypt user data');
  }
}

/**
 * IV와 암호문을 하나의 바이트 배열로 결합
 * @param {Object} encrypted - { iv, ciphertext }
 * @returns {string} 결합된 16진수 문자열
 */
function combineIvAndCiphertext({ iv, ciphertext }) {
  return iv + ciphertext.slice(2); // '0x' 제거하고 결합
}

/**
 * 결합된 바이트 배열에서 IV와 암호문 분리
 * @param {string} combined - 결합된 16진수 문자열
 * @returns {Object} { iv, ciphertext }
 */
function separateIvAndCiphertext(combined) {
  // IV는 12 bytes = 24 hex characters (+2 for '0x')
  const ivLength = 26; // '0x' + 24 hex chars
  const iv = combined.slice(0, ivLength);
  const ciphertext = '0x' + combined.slice(ivLength);

  return { iv, ciphertext };
}

/**
 * 데이터 해시 생성 (검증용)
 * @param {string} data - 해시할 데이터
 * @returns {string} Keccak256 해시
 */
export function hashData(data) {
  return keccak256(toBytes(data));
}

/**
 * 암호화된 데이터 검증
 * @param {string} originalData - 원본 데이터
 * @param {string} hash - 저장된 해시
 * @returns {boolean} 검증 결과
 */
export function verifyDataHash(originalData, hash) {
  const computedHash = hashData(originalData);
  return computedHash === hash;
}
