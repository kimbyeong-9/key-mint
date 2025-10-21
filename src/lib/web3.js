import Web3 from 'web3';
import contractABI from '../contracts/UserRegistry.json';

// Web3 인스턴스
let web3 = null;
let contract = null;

// 컨트랙트 주소 (배포 후 업데이트 필요)
const CONTRACT_ADDRESS = '0x16C3ccdB6618f8e30b526C9bbC372703476e0c19'; // 배포 후 실제 주소로 변경

/**
 * Web3 초기화
 */
export async function initWeb3() {
  try {
    // MetaMask가 설치되어 있는지 확인
    if (typeof window.ethereum !== 'undefined') {
      web3 = new Web3(window.ethereum);
      
      // 계정 변경 감지
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('계정 변경됨:', accounts[0]);
        // 페이지 새로고침 또는 상태 업데이트
        window.location.reload();
      });
      
      // 네트워크 변경 감지
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('네트워크 변경됨:', chainId);
        window.location.reload();
      });
      
      console.log('✅ Web3 초기화 완료');
      return true;
    } else {
      console.error('❌ MetaMask가 설치되지 않았습니다.');
      return false;
    }
  } catch (error) {
    console.error('❌ Web3 초기화 실패:', error);
    return false;
  }
}

/**
 * 지갑 연결
 */
export async function connectWallet() {
  try {
    if (!web3) {
      const initialized = await initWeb3();
      if (!initialized) {
        throw new Error('Web3 초기화 실패');
      }
    }

    // 계정 요청
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length === 0) {
      throw new Error('계정을 선택해주세요.');
    }

    const account = accounts[0];
    console.log('✅ 지갑 연결 완료:', account);
    
    return account;
  } catch (error) {
    console.error('❌ 지갑 연결 실패:', error);
    throw error;
  }
}

/**
 * 현재 연결된 계정 가져오기
 */
export async function getCurrentAccount() {
  try {
    if (!web3) {
      await initWeb3();
    }

    const accounts = await web3.eth.getAccounts();
    return accounts[0] || null;
  } catch (error) {
    console.error('❌ 계정 조회 실패:', error);
    return null;
  }
}

/**
 * 네트워크 확인 (Sepolia 테스트넷)
 */
export async function checkNetwork() {
  try {
    if (!web3) {
      await initWeb3();
    }

    const chainId = await web3.eth.getChainId();
    const sepoliaChainId = 11155111; // Sepolia 테스트넷

    if (chainId !== sepoliaChainId) {
      // Sepolia 테스트넷으로 전환 요청
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
      });
    }

    console.log('✅ Sepolia 테스트넷 연결 확인');
    return true;
  } catch (error) {
    console.error('❌ 네트워크 확인 실패:', error);
    throw error;
  }
}

/**
 * 컨트랙트 인스턴스 가져오기
 */
export function getContract() {
  if (!web3) {
    throw new Error('Web3가 초기화되지 않았습니다.');
  }

  if (!contract) {
    contract = new web3.eth.Contract(contractABI.abi, CONTRACT_ADDRESS);
  }

  return contract;
}

/**
 * 사용자 등록 (블록체인에 안전하게 저장 - 이메일 해싱)
 */
export async function registerUserOnBlockchain(username, email) {
  try {
    // 지갑 연결 확인
    const account = await getCurrentAccount();
    if (!account) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }

    // 네트워크 확인
    await checkNetwork();

    // 컨트랙트 인스턴스 가져오기
    const contractInstance = getContract();

    // 🔒 보안: 이메일을 해싱하여 개인정보 보호
    const emailHash = web3.utils.keccak256(email.toLowerCase());

    console.log('🔍 블록체인에 사용자 등록 중...', {
      username,
      emailHash: emailHash.substring(0, 10) + '...',
      account
    });

    // 가스 한도 최적화 설정
    const gasEstimate = await contractInstance.methods
      .registerUser(username, emailHash)
      .estimateGas({ from: account });

    console.log('⛽ 예상 가스 사용량:', gasEstimate);

    // 가스 한도를 안전하게 설정 (예상 가스의 120%, 최대 15M으로 제한)
    const gasLimit = Math.min(Math.floor(gasEstimate * 1.2), 15000000);

    console.log('⛽ 설정된 가스 한도:', gasLimit);

    // 트랜잭션 전송 (최적화된 가스 설정)
    const result = await contractInstance.methods
      .registerUser(username, emailHash)
      .send({
        from: account,
        gas: gasLimit,
        gasPrice: '20000000000' // 20 Gwei (낮은 가스비)
      });

    console.log('✅ 블록체인에 사용자 등록 완료:', result);
    return result;
  } catch (error) {
    console.error('❌ 블록체인 사용자 등록 실패:', error);
    throw error;
  }
}

/**
 * 사용자 정보 조회
 */
export async function getUserFromBlockchain(walletAddress) {
  try {
    if (!web3) {
      await initWeb3();
    }

    const contractInstance = getContract();
    
    const user = await contractInstance.methods.getUser(walletAddress).call();
    
    console.log('✅ 블록체인에서 사용자 정보 조회:', user);
    return user;
  } catch (error) {
    console.error('❌ 사용자 정보 조회 실패:', error);
    throw error;
  }
}

/**
 * 사용자 등록 여부 확인
 */
export async function isUserRegistered(walletAddress) {
  try {
    if (!web3) {
      await initWeb3();
    }

    const contractInstance = getContract();
    
    const isRegistered = await contractInstance.methods.isUserRegistered(walletAddress).call();
    
    return isRegistered;
  } catch (error) {
    console.error('❌ 사용자 등록 여부 확인 실패:', error);
    return false;
  }
}

/**
 * 등록된 사용자 수 조회
 */
export async function getUserCount() {
  try {
    if (!web3) {
      await initWeb3();
    }

    const contractInstance = getContract();
    
    const count = await contractInstance.methods.getUserCount().call();
    
    return parseInt(count);
  } catch (error) {
    console.error('❌ 사용자 수 조회 실패:', error);
    return 0;
  }
}

/**
 * 컨트랙트 주소 업데이트 (배포 후 사용)
 */
export function updateContractAddress(newAddress) {
  CONTRACT_ADDRESS = newAddress;
  contract = null; // 컨트랙트 인스턴스 재생성
  console.log('✅ 컨트랙트 주소 업데이트:', newAddress);
}

export { web3, contract };
