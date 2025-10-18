import { formatUnits, parseUnits } from 'viem';

/**
 * Wei를 ETH로 변환
 * @param {bigint|string} wei - Wei 값
 * @returns {string} - ETH 값
 */
export function formatEther(wei) {
  if (!wei) return '0';
  return formatUnits(BigInt(wei), 18);
}

/**
 * ETH를 Wei로 변환
 * @param {string} ether - ETH 값
 * @returns {bigint} - Wei 값
 */
export function parseEther(ether) {
  if (!ether) return BigInt(0);
  return parseUnits(ether.toString(), 18);
}

/**
 * 주소 줄이기 (0x1234...5678)
 * @param {string} address - 지갑 주소
 * @param {number} start - 시작 문자 수
 * @param {number} end - 끝 문자 수
 * @returns {string} - 줄인 주소
 */
export function shortenAddress(address, start = 6, end = 4) {
  if (!address) return '';
  if (address.length < start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * 숫자를 원화 형식으로 포맷
 * @param {number|string} value - 숫자 값
 * @returns {string} - 포맷된 문자열
 */
export function formatKRW(value) {
  if (!value) return '0원';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(num);
}

/**
 * 날짜 포맷
 * @param {number|Date} timestamp - 타임스탬프 또는 Date 객체
 * @returns {string} - 포맷된 날짜
 */
export function formatDate(timestamp) {
  if (!timestamp) return '';

  const date = typeof timestamp === 'number'
    ? new Date(timestamp * 1000)
    : new Date(timestamp);

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * 상대 시간 포맷 (1시간 전, 2일 전 등)
 * @param {number|Date} timestamp - 타임스탬프 또는 Date 객체
 * @returns {string} - 상대 시간
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return '';

  const date = typeof timestamp === 'number'
    ? new Date(timestamp * 1000)
    : new Date(timestamp);

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;

  return formatDate(timestamp);
}

/**
 * 파일 크기 포맷
 * @param {number} bytes - 바이트 크기
 * @returns {string} - 포맷된 크기
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 트랜잭션 해시 줄이기
 * @param {string} hash - 트랜잭션 해시
 * @returns {string} - 줄인 해시
 */
export function shortenTxHash(hash) {
  return shortenAddress(hash, 10, 8);
}
