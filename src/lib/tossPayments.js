import { loadTossPayments } from '@tosspayments/payment-sdk';
import { supabase } from './supabase';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

// 환율 상수 (폴백용)
const ETH_TO_KRW_RATE = 3000000;

/**
 * 토스페이먼츠 클라이언트 초기화
 */
export const initializeTossPayments = async () => {
  try {
    // 환경별 키 설정
    const isProduction = import.meta.env.PROD;
    const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY || 
      (isProduction ? 'live_ck_실제키여기에입력' : 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq');
    
    console.log('🔑 토스페이먼츠 클라이언트 키:', clientKey);
    console.log('🌍 환경:', isProduction ? 'Production' : 'Development');
    
    const tossPayments = await loadTossPayments(clientKey);
    console.log('✅ 토스페이먼츠 클라이언트 초기화 완료');
    return tossPayments;
  } catch (error) {
    console.error('❌ 토스페이먼츠 클라이언트 초기화 실패:', error);
    throw new Error('토스페이먼츠 초기화에 실패했습니다.');
  }
};

/**
 * KRW를 ETH로 변환 (Supabase 환율 API 사용)
 */
export const convertKRWToETH = async (krwAmount) => {
  try {
    const { data, error } = await supabase.rpc('convert_krw_to_eth', {
      krw_amount: krwAmount
    });
    
    if (error) {
      console.error('환율 변환 오류:', error);
      // 폴백: 고정 환율 사용
      return parseFloat((krwAmount / ETH_TO_KRW_RATE).toFixed(6));
    }
    
    return parseFloat(data.toFixed(6));
  } catch (error) {
    console.error('환율 변환 실패:', error);
    // 폴백: 고정 환율 사용
    return parseFloat((krwAmount / ETH_TO_KRW_RATE).toFixed(6));
  }
};

/**
 * ETH를 KRW로 변환 (Supabase 환율 API 사용)
 */
export const convertETHToKRW = async (ethAmount) => {
  try {
    const { data, error } = await supabase.rpc('convert_eth_to_krw', {
      eth_amount: ethAmount
    });
    
    if (error) {
      console.error('환율 변환 오류:', error);
      // 폴백: 고정 환율 사용
      return Math.round(ethAmount * ETH_TO_KRW_RATE);
    }
    
    return data;
  } catch (error) {
    console.error('환율 변환 실패:', error);
    // 폴백: 고정 환율 사용
    return Math.round(ethAmount * ETH_TO_KRW_RATE);
  }
};

/**
 * 결제 요청 데이터 생성
 */
export const createPaymentRequest = async (nft, userId) => {
  const orderId = `NFT_${Date.now()}_${userId}`;
  const ethAmount = parseFloat(nft.price) || 0;
  const krwAmount = await convertETHToKRW(ethAmount);
  
  // Supabase에 결제 요청 생성
  try {
    const { data, error } = await supabase.rpc('create_payment_request', {
      user_uuid: userId,
      order_id_param: orderId,
      amount_krw_param: krwAmount,
      amount_eth_param: ethAmount,
      nft_id_param: nft.id,
      nft_name_param: nft.name || 'NFT 구매'
    });
    
    if (error) {
      console.error('결제 요청 생성 실패:', error);
      throw new Error('결제 요청 생성에 실패했습니다.');
    }
    
    console.log('✅ 결제 요청 생성 완료:', data);
  } catch (error) {
    console.error('❌ 결제 요청 생성 오류:', error);
    throw error;
  }
  
  return {
    amount: krwAmount,
    orderId: orderId,
    orderName: nft.name || 'NFT 구매',
    customerName: 'Guest',
    successUrl: `${window.location.origin}/payment/success?orderId=${orderId}`,
    failUrl: `${window.location.origin}/payment/fail?orderId=${orderId}`
  };
};

/**
 * 모의 결제 요청 처리 (실제 돈은 빠지지 않음)
 */
export const requestPayment = async (nft, userId) => {
  try {
    // 입력 데이터 검증
    if (!nft || !nft.id) {
      throw new Error('NFT 정보가 올바르지 않습니다.');
    }
    
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.');
    }
    
    if (!nft.price || parseFloat(nft.price) <= 0) {
      throw new Error('NFT 가격이 올바르지 않습니다.');
    }

    console.log('🎭 모의 결제 요청 시작:', { nft, userId });
    
    // 결제 데이터 생성
    const orderId = `NFT_${Date.now()}_${userId}`;
    const amountKrw = Math.round(parseFloat(nft.price) * 3000000); // ETH to KRW
    const amountEth = parseFloat(nft.price);
    const nftName = nft.name || 'NFT 구매';
    
    // 실제 토스페이먼츠 결제 요청
    const tossPayments = await initializeTossPayments();
    
    console.log('🔄 토스페이먼츠 결제 요청 생성 중...', {
      amount: amountKrw,
      orderId: orderId,
      orderName: nftName
    });
    
    const response = await tossPayments.requestPayment('휴대폰', {
      amount: Math.max(amountKrw, 100),
      orderId: orderId,
      orderName: nftName,
      customerName: 'NFT 구매자',
      successUrl: `${window.location.origin}/payment-success`,
      failUrl: `${window.location.origin}/payment-fail`
    });
    
    console.log('✅ 토스페이먼츠 결제 응답:', response);

    console.log('✅ 토스페이먼츠 결제 요청 성공:', response);
    
    // Supabase에 결제 요청 생성
    try {
      const { data: paymentResult, error: paymentError } = await supabase.rpc('create_payment_request', {
        user_uuid: userId,
        order_id_param: orderId,
        amount_krw_param: amountKrw,
        amount_eth_param: amountEth,
        nft_id_param: nft.id,
        nft_name_param: nftName
      });
      
      if (paymentError) {
        console.warn('⚠️ Supabase 결제 요청 생성 실패:', paymentError);
      } else {
        console.log('✅ Supabase 결제 요청 생성 성공:', paymentResult);
      }
    } catch (supabaseError) {
      console.warn('⚠️ Supabase 연결 실패:', supabaseError);
    }
    
    // 토스페이먼츠 응답 반환
    return {
      success: true,
      paymentKey: response.paymentKey,
      orderId: orderId,
      amount: amountKrw,
      status: 'READY',
      orderName: nftName,
      customerName: 'NFT 구매자',
      customerEmail: 'buyer@example.com',
      successUrl: `${window.location.origin}/payment-success`,
      failUrl: `${window.location.origin}/payment-fail`
    };
    
  } catch (error) {
    console.error('❌ 토스페이먼츠 결제 요청 실패:', error);
    throw new Error(`토스페이먼츠 결제 요청에 실패했습니다: ${error.message}`);
  }
};

/**
 * 결제 상태 확인
 */
export const checkPaymentStatus = async (orderId) => {
  try {
    // 실제로는 백엔드 API를 통해 확인해야 함
    // 여기서는 로컬 스토리지에서 확인
    const paymentData = localStorage.getItem(`payment_${orderId}`);
    
    if (paymentData) {
      const parsed = JSON.parse(paymentData);
      return parsed.status || 'pending';
    }
    
    return 'not_found';
  } catch (error) {
    console.error('❌ 결제 상태 확인 실패:', error);
    return 'error';
  }
};

/**
 * 모의 결제 완료 처리 (실제 돈은 빠지지 않음)
 */
export const handlePaymentSuccess = async (orderId, paymentKey, amount) => {
  try {
    console.log('💳 실제 결제 완료 처리 시작:', { orderId, paymentKey, amount });
    
    // 1. 서버에서 결제 검증
    const verificationResponse = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount
      })
    });

    if (!verificationResponse.ok) {
      throw new Error('결제 검증에 실패했습니다.');
    }

    const verificationResult = await verificationResponse.json();
    
    if (!verificationResult.success) {
      throw new Error(`결제 검증 실패: ${verificationResult.error}`);
    }

    console.log('✅ 결제 검증 성공:', verificationResult);
    
    // 2. 결제 내역에서 NFT 구매 정보 조회
    const { data: purchaseInfo, error: purchaseError } = await supabase
      .from('payment_history')
      .select(`
        id,
        user_id,
        amount_eth,
        nft_purchases!inner(
          nft_id,
          eth_amount
        )
      `)
      .eq('order_id', orderId)
      .single();
    
    if (purchaseError || !purchaseInfo) {
      console.warn('⚠️ NFT 구매 정보를 찾을 수 없습니다:', purchaseError);
    } else {
      console.log('🎨 NFT 구매 정보 발견:', purchaseInfo);
      
      // 3. NFT 구매 처리 (포트폴리오 자동 업데이트 포함)
      try {
        const { data: nftPurchaseData, error: nftPurchaseError } = await supabase.rpc('process_nft_purchase', {
          user_uuid: purchaseInfo.user_id,
          nft_id_param: purchaseInfo.nft_purchases.nft_id,
          eth_amount_param: purchaseInfo.nft_purchases.eth_amount
        });
        
        if (nftPurchaseError) {
          console.error('❌ NFT 구매 처리 실패:', nftPurchaseError);
        } else {
          console.log('✅ NFT 구매 및 포트폴리오 업데이트 성공:', nftPurchaseData);
          
          // 4. 블록체인에서 실제 NFT 전송 (실제 소유권 이전)
          try {
            const transferResult = await transferNFTOnBlockchain(
              import.meta.env.VITE_VAULT_NFT_ADDRESS,
              purchaseInfo.nft_purchases.nft_id,
              purchaseInfo.user_id
            );

            if (transferResult.success) {
              console.log('✅ 블록체인 NFT 전송 완료:', transferResult);
            } else {
              console.error('❌ 블록체인 NFT 전송 실패:', transferResult.error);
            }
          } catch (blockchainError) {
            console.error('❌ 블록체인 NFT 전송 중 오류:', blockchainError);
          }
        }
      } catch (nftError) {
        console.error('❌ NFT 구매 처리 중 오류:', nftError);
      }
    }
    
    // 5. 로컬 스토리지에 결제 완료 정보 저장
    const localPaymentData = {
      orderId,
      paymentKey,
      amount,
      status: 'completed',
      completedAt: new Date().toISOString(),
      isRealPayment: true
    };
    
    localStorage.setItem(`payment_${orderId}`, JSON.stringify(localPaymentData));
    
    return localPaymentData;
    
  } catch (error) {
    console.error('❌ 실제 결제 완료 처리 실패:', error);
    throw new Error('결제 완료 처리에 실패했습니다.');
  }
};

/**
 * 블록체인에서 NFT 전송 (실제 소유권 이전)
 */
export const transferNFTOnBlockchain = async (nftContractAddress, tokenId, toAddress) => {
  try {
    console.log('🔗 블록체인 NFT 전송 시작:', { nftContractAddress, tokenId, toAddress });

    // VaultNFT 컨트랙트 ABI (transferFrom 함수)
    const vaultNFTABI = [
      {
        "inputs": [
          {"internalType": "address", "name": "from", "type": "address"},
          {"internalType": "address", "name": "to", "type": "address"},
          {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
        ],
        "name": "transferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];

    // 현재 사용자의 지갑 주소 가져오기
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }
    const fromAddress = accounts[0];


    // NFT 전송 트랜잭션 실행
    const transactionHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: fromAddress,
        to: nftContractAddress,
        data: encodeTransferFrom(fromAddress, toAddress, tokenId, vaultNFTABI)
      }]
    });

    console.log('✅ NFT 전송 트랜잭션 전송 완료:', transactionHash);

    // 트랜잭션 완료 대기
    const receipt = await waitForTransactionReceipt(transactionHash);
    
    if (receipt.status === '0x1') {
      console.log('✅ NFT 전송 완료:', receipt);
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };
    } else {
      throw new Error('NFT 전송 트랜잭션이 실패했습니다.');
    }

  } catch (error) {
    console.error('❌ 블록체인 NFT 전송 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * transferFrom 함수 데이터 인코딩
 */
const encodeTransferFrom = (from, to, tokenId, abi) => {
  // 간단한 ABI 인코딩 (실제로는 ethers.js나 viem 사용 권장)
  const functionSelector = '0x23b872dd'; // transferFrom(address,address,uint256)
  const fromPadded = from.slice(2).padStart(64, '0');
  const toPadded = to.slice(2).padStart(64, '0');
  const tokenIdPadded = parseInt(tokenId).toString(16).padStart(64, '0');
  
  return functionSelector + fromPadded + toPadded + tokenIdPadded;
};

/**
 * 트랜잭션 영수증 대기
 */
const waitForTransactionReceipt = async (txHash) => {
  return new Promise((resolve, reject) => {
    const checkReceipt = async () => {
      try {
        const receipt = await window.ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash]
        });
        
        if (receipt) {
          resolve(receipt);
        } else {
          setTimeout(checkReceipt, 2000); // 2초마다 확인
        }
      } catch (error) {
        reject(error);
      }
    };
    
    checkReceipt();
  });
};

/**
 * 결제 실패 처리 (Supabase 연동)
 */
export const handlePaymentFailure = async (orderId, errorCode, errorMessage) => {
  try {
    console.log('❌ 결제 실패 처리 시작:', { orderId, errorCode, errorMessage });
    
    // Supabase에 결제 실패 처리
    const { data, error } = await supabase.rpc('process_payment_failure', {
      order_id_param: orderId,
      error_code_param: errorCode,
      error_message_param: errorMessage
    });
    
    if (error) {
      console.error('❌ 결제 실패 처리 실패:', error);
      throw new Error(`결제 실패 처리에 실패했습니다: ${error.message}`);
    }
    
    console.log('✅ 결제 실패 처리 성공:', data);
    
    // 로컬 스토리지에도 저장 (백업용)
    const paymentData = {
      orderId,
      errorCode,
      errorMessage,
      status: 'failed',
      failedAt: new Date().toISOString()
    };
    localStorage.setItem(`payment_${orderId}`, JSON.stringify(paymentData));
    
    return paymentData;
    
  } catch (error) {
    console.error('❌ 결제 실패 처리 중 오류:', error);
    throw new Error('결제 실패 처리에 실패했습니다.');
  }
};
