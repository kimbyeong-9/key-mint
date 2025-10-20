// 스마트 컨트랙트 주소 및 ABI export
// 배포 후 실제 컨트랙트 주소로 업데이트 필요

import { CHAIN_ID } from './wagmi';

// 컨트랙트 주소 (배포 후 업데이트)
export const CONTRACTS = {
  [CHAIN_ID]: {
    UserRegistry: '0x0000000000000000000000000000000000000000', // 배포 후 업데이트
    UserRegistryEnhanced: '0x0000000000000000000000000000000000000000', // 배포 후 업데이트
    VaultNFT: '0x0000000000000000000000000000000000000000',     // 배포 후 업데이트
    Marketplace: '0x0000000000000000000000000000000000000000',  // 배포 후 업데이트
  }
};

// 현재 체인의 컨트랙트 주소 가져오기
export const getContractAddress = (contractName) => {
  return CONTRACTS[CHAIN_ID]?.[contractName] || '0x0000000000000000000000000000000000000000';
};

// ABI import (컨트랙트 작성 후 생성 예정)
// export { default as REGISTRY_ABI } from '../abi/UserRegistry.json';
// export { default as NFT_ABI } from '../abi/VaultNFT.json';
// export { default as MARKET_ABI } from '../abi/Marketplace.json';

// 임시 ABI (실제 컨트랙트 배포 후 교체)
export const REGISTRY_ABI = [];
export const REGISTRY_ENHANCED_ABI = [];
export const NFT_ABI = [];
export const MARKET_ABI = [];
