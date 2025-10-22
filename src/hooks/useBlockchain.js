import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { uploadMetadataToIPFS, createNFTMetadata } from '../lib/ipfs';
import { supabase } from '../lib/supabase';

/**
 * 로컬 메타데이터 URI 생성 (한글 문자 처리)
 */
function createLocalMetadataURI(metadata) {
  try {
    // 한글 문자를 안전하게 처리하기 위해 base64 인코딩 사용
    const jsonString = JSON.stringify(metadata, null, 2);
    
    // 한글 문자를 UTF-8로 인코딩한 후 base64로 변환 (스택 오버플로우 방지)
    const utf8Bytes = new TextEncoder().encode(jsonString);
    
    // 큰 배열을 안전하게 처리하기 위해 청크 단위로 변환
    let base64String;
    if (utf8Bytes.length > 10000) {
      // 큰 데이터의 경우 encodeURIComponent 사용
      base64String = btoa(encodeURIComponent(jsonString));
    } else {
      // 작은 데이터의 경우 기존 방식 사용
      const charCodes = Array.from(utf8Bytes);
      base64String = btoa(String.fromCharCode(...charCodes));
    }
    
    return `data:application/json;base64,${base64String}`;
  } catch (encodingError) {
    console.warn('⚠️ 인코딩 실패, 간단한 URI 사용:', encodingError.message);
    // 최후의 수단으로 간단한 JSON 사용
    const simpleMetadata = {
      name: metadata.name || "Untitled NFT",
      description: metadata.description || "No description",
      image: metadata.image || "",
      attributes: metadata.attributes || []
    };
    const simpleJson = JSON.stringify(simpleMetadata);
    const simpleBase64 = btoa(encodeURIComponent(simpleJson));
    return `data:application/json;base64,${simpleBase64}`;
  }
}

// VaultNFT 컨트랙트 ABI (간단한 버전)
const VAULT_NFT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "string", "name": "tokenURI", "type": "string"}
    ],
    "name": "mint",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// 컨트랙트 주소 (Sepolia 테스트넷에 배포됨)
const VAULT_NFT_ADDRESS = import.meta.env.VITE_VAULT_NFT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

/**
 * 블록체인 NFT 민팅 훅
 */
export function useBlockchainMint() {
  const { address, isConnected } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState(null);
  const [mintSuccess, setMintSuccess] = useState(false);

  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * 민터 권한 확인 및 추가
   */
  const checkAndAddMinter = async () => {
    try {
      // 현재 사용자가 민터인지 확인
      const { data: isMinter } = await supabase.rpc('call_contract', {
        contract_address: VAULT_NFT_ADDRESS,
        function_name: 'isMinter',
        args: [address]
      });

      if (!isMinter) {
        console.log('🔑 민터 권한이 없습니다. 민터 추가를 시도합니다...');
        
        // 민터 추가 요청
        const { data: addResult } = await supabase.rpc('add_minter', {
          minter_address: address
        });

        if (addResult) {
          console.log('✅ 민터 권한 추가 요청 완료');
          // 실제 블록체인에서는 트랜잭션이 필요하지만, 
          // 현재는 시뮬레이션된 환경이므로 true 반환
          return true;
        } else {
          console.warn('⚠️ 민터 권한 추가 실패');
          return false;
        }
      }
      return true;
    } catch (error) {
      console.warn('⚠️ 민터 권한 확인 실패:', error);
      // 에러가 발생해도 계속 진행 (시뮬레이션 환경)
      return true;
    }
  };

  /**
   * NFT 민팅 실행
   * @param {Object} nftData - NFT 데이터
   * @returns {Promise<Object>} 민팅 결과
   */
  const mintNFT = async (nftData) => {
    if (!isConnected || !address) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }

    if (!VAULT_NFT_ADDRESS || VAULT_NFT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('스마트 컨트랙트가 배포되지 않았습니다.');
    }

    // 민터 권한 확인
    const hasMinterRole = await checkAndAddMinter();
    if (!hasMinterRole) {
      console.warn('⚠️ 민터 권한이 없어 블록체인 민팅을 건너뜁니다.');
      return {
        metadataURI: createLocalMetadataURI(createNFTMetadata(nftData)),
        transactionHash: null,
        isPending: false,
        skipped: true,
        reason: '민터 권한 없음'
      };
    }

    try {
      setIsMinting(true);
      setMintError(null);
      setMintSuccess(false);

      console.log('🚀 NFT 민팅 시작:', nftData.name);

      // 1. 메타데이터 생성
      const metadata = createNFTMetadata(nftData);
      console.log('📝 메타데이터 생성 완료:', metadata);

      // 2. IPFS에 메타데이터 업로드 (Web3.Storage 유지보수로 인해 임시 비활성화)
      let metadataURI;
      
      // Web3.Storage 상태 확인 (임시 비활성화)
      const useIPFS = false; // IPFS 임시 비활성화 (토큰 없이도 작동하도록)
      
      if (useIPFS) {
        try {
          metadataURI = await uploadMetadataToIPFS(metadata);
          console.log('📤 IPFS 업로드 완료:', metadataURI);
        } catch (ipfsError) {
          console.warn('⚠️ IPFS 업로드 실패, 로컬 URI 사용:', ipfsError.message);
          metadataURI = createLocalMetadataURI(metadata);
        }
      } else {
        console.log('📝 IPFS 비활성화 - 로컬 URI 사용');
        metadataURI = createLocalMetadataURI(metadata);
      }

      // 3. 스마트 컨트랙트에 민팅 요청
      console.log('⛓️ 블록체인 민팅 요청...');
      
      // 컨트랙트 주소 확인
      if (!VAULT_NFT_ADDRESS || VAULT_NFT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        console.warn('⚠️ 컨트랙트 주소가 설정되지 않음 - 민팅 건너뛰기');
        return {
          metadataURI,
          transactionHash: null,
          isPending: false,
          skipped: true
        };
      }
      
      writeContract({
        address: VAULT_NFT_ADDRESS,
        abi: VAULT_NFT_ABI,
        functionName: 'mint',
        args: [address, metadataURI],
      });

      return {
        metadataURI,
        transactionHash: hash,
        isPending: true,
        contractAddress: VAULT_NFT_ADDRESS
      };

    } catch (error) {
      console.error('❌ NFT 민팅 실패:', error);
      setMintError(error.message);
      throw error;
    } finally {
      setIsMinting(false);
    }
  };

  // 트랜잭션 확인 완료 시 성공 처리
  if (isConfirmed && !mintSuccess) {
    setMintSuccess(true);
    console.log('✅ NFT 민팅 완료!');
  }

  return {
    mintNFT,
    isMinting: isMinting || isConfirming,
    mintError: mintError || writeError?.message,
    mintSuccess,
    transactionHash: hash,
    isConfirmed
  };
}

/**
 * 블록체인 NFT 조회 훅
 */
export function useBlockchainNFTs() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 사용자의 NFT 목록 조회
   */
  const fetchUserNFTs = async () => {
    if (!isConnected || !address) {
      setNfts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: 실제 컨트랙트에서 사용자 NFT 조회
      // 현재는 임시로 빈 배열 반환
      console.log('🔍 사용자 NFT 조회:', address);
      setNfts([]);

    } catch (error) {
      console.error('❌ NFT 조회 실패:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    nfts,
    loading,
    error,
    fetchUserNFTs
  };
}
