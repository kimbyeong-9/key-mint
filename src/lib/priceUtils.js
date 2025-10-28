/**
 * 가격 관련 유틸리티 함수
 */

// ETH to KRW 환율 (현재 고정값, 추후 API로 가져올 수 있음)
export const ETH_TO_KRW_RATE = 3000000;

/**
 * 숫자에 천 단위 구분자(콤마) 추가
 * @param {number|string} num - 숫자
 * @returns {string} - 콤마가 포함된 문자열
 */
export function addCommas(num) {
  if (!num) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 콤마가 포함된 문자열에서 숫자만 추출
 * @param {string} str - 콤마가 포함된 문자열
 * @returns {string} - 숫자만 포함된 문자열
 */
export function removeCommas(str) {
  if (!str) return '';
  return str.replace(/,/g, '');
}

/**
 * 원화를 ETH로 변환
 * @param {number} krwAmount - 원화 금액
 * @param {number} rate - 환율 (기본값: ETH_TO_KRW_RATE)
 * @returns {number} - ETH 금액
 */
export function convertKRWtoETH(krwAmount, rate = ETH_TO_KRW_RATE) {
  if (!krwAmount || krwAmount <= 0) return 0;
  return parseFloat((krwAmount / rate).toFixed(6));
}

/**
 * ETH를 원화로 변환
 * @param {number} ethAmount - ETH 금액
 * @param {number} rate - 환율 (기본값: ETH_TO_KRW_RATE)
 * @returns {number} - 원화 금액
 */
export function convertETHtoKRW(ethAmount, rate = ETH_TO_KRW_RATE) {
  if (!ethAmount || ethAmount <= 0) return 0;
  return Math.round(ethAmount * rate);
}

/**
 * 원화 가격 포맷팅 (콤마 + "원")
 * @param {number} krwAmount - 원화 금액
 * @returns {string} - 포맷팅된 가격 문자열
 */
export function formatKRWPrice(krwAmount) {
  if (!krwAmount || krwAmount <= 0) return '0원';
  return `${addCommas(krwAmount)}원`;
}

/**
 * ETH 가격 포맷팅
 * @param {number} ethAmount - ETH 금액
 * @param {number} decimals - 소수점 자리수 (기본값: 6)
 * @returns {string} - 포맷팅된 ETH 가격 문자열
 */
export function formatETHPrice(ethAmount, decimals = 6) {
  if (!ethAmount || ethAmount <= 0) return '0 ETH';
  return `${parseFloat(ethAmount).toFixed(decimals)} ETH`;
}
