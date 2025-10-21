import { loadTossPayments } from '@tosspayments/payment-sdk';

/**
 * 토스페이먼츠 클라이언트 초기화
 */
export const initializeTossPayments = async () => {
  try {
    const tossPayments = await loadTossPayments(import.meta.env.VITE_TOSS_CLIENT_KEY);
    console.log('✅ 토스페이먼츠 클라이언트 초기화 완료');
    return tossPayments;
  } catch (error) {
    console.error('❌ 토스페이먼츠 클라이언트 초기화 실패:', error);
    throw new Error('토스페이먼츠 초기화에 실패했습니다.');
  }
};

/**
 * KRW를 ETH로 변환 (고정 환율 사용)
 * 실제 운영에서는 환율 API를 사용해야 함
 */
export const convertKRWToETH = (krwAmount) => {
  // 고정 환율: 1 ETH = 3,000,000 KRW (예시)
  const ETH_TO_KRW_RATE = 3000000;
  const ethAmount = krwAmount / ETH_TO_KRW_RATE;
  return parseFloat(ethAmount.toFixed(6)); // 소수점 6자리까지
};

/**
 * ETH를 KRW로 변환
 */
export const convertETHToKRW = (ethAmount) => {
  const ETH_TO_KRW_RATE = 3000000;
  return Math.round(ethAmount * ETH_TO_KRW_RATE);
};

/**
 * 결제 요청 데이터 생성
 */
export const createPaymentRequest = (nft, userId) => {
  const orderId = `NFT_${Date.now()}_${userId}`;
  const amount = convertETHToKRW(parseFloat(nft.price) || 0);
  
  return {
    orderId,
    amount,
    currency: 'KRW',
    successUrl: `${window.location.origin}/payment/success`,
    failUrl: `${window.location.origin}/payment/fail`,
    metadata: {
      nftId: nft.id,
      nftName: nft.name,
      userId: userId
    }
  };
};

/**
 * 결제 요청 처리
 */
export const requestPayment = async (nft, userId) => {
  try {
    const tossPayments = await initializeTossPayments();
    const paymentData = createPaymentRequest(nft, userId);
    
    console.log('💳 결제 요청 데이터:', paymentData);
    
    // 토스페이먼츠 결제 요청
    const response = await tossPayments.requestPayment('카드', paymentData);
    
    console.log('✅ 결제 요청 성공:', response);
    return response;
    
  } catch (error) {
    console.error('❌ 결제 요청 실패:', error);
    throw new Error(`결제 요청에 실패했습니다: ${error.message}`);
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
 * 결제 완료 처리
 */
export const handlePaymentSuccess = (orderId, paymentKey, amount) => {
  try {
    const paymentData = {
      orderId,
      paymentKey,
      amount,
      status: 'completed',
      completedAt: new Date().toISOString()
    };
    
    // 로컬 스토리지에 저장 (실제로는 백엔드에 전송)
    localStorage.setItem(`payment_${orderId}`, JSON.stringify(paymentData));
    
    console.log('✅ 결제 완료 처리:', paymentData);
    return paymentData;
    
  } catch (error) {
    console.error('❌ 결제 완료 처리 실패:', error);
    throw new Error('결제 완료 처리에 실패했습니다.');
  }
};

/**
 * 결제 실패 처리
 */
export const handlePaymentFailure = (orderId, errorCode, errorMessage) => {
  try {
    const paymentData = {
      orderId,
      errorCode,
      errorMessage,
      status: 'failed',
      failedAt: new Date().toISOString()
    };
    
    // 로컬 스토리지에 저장
    localStorage.setItem(`payment_${orderId}`, JSON.stringify(paymentData));
    
    console.log('❌ 결제 실패 처리:', paymentData);
    return paymentData;
    
  } catch (error) {
    console.error('❌ 결제 실패 처리 중 오류:', error);
    throw new Error('결제 실패 처리에 실패했습니다.');
  }
};
