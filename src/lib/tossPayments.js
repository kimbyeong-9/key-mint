import { loadTossPayments } from '@tosspayments/payment-sdk';
import { supabase } from './supabase';

/**
 * 토스페이먼츠 클라이언트 초기화
 */
export const initializeTossPayments = async () => {
  try {
    const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
    console.log('🔑 토스페이먼츠 클라이언트 키:', clientKey);
    
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
      const ETH_TO_KRW_RATE = 3000000;
      return parseFloat((krwAmount / ETH_TO_KRW_RATE).toFixed(6));
    }
    
    return parseFloat(data.toFixed(6));
  } catch (error) {
    console.error('환율 변환 실패:', error);
    // 폴백: 고정 환율 사용
    const ETH_TO_KRW_RATE = 3000000;
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
      const ETH_TO_KRW_RATE = 3000000;
      return Math.round(ethAmount * ETH_TO_KRW_RATE);
    }
    
    return data;
  } catch (error) {
    console.error('환율 변환 실패:', error);
    // 폴백: 고정 환율 사용
    const ETH_TO_KRW_RATE = 3000000;
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
      amount_eth_param: ethAmount
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
 * 결제 요청 처리
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

    const tossPayments = await initializeTossPayments();
    const paymentData = await createPaymentRequest(nft, userId);
    
    // 결제 데이터 검증
    if (!paymentData.orderName || paymentData.orderName.trim() === '') {
      paymentData.orderName = nft.name || 'NFT 구매';
    }
    
    if (!paymentData.amount || paymentData.amount <= 0) {
      throw new Error('결제 금액이 올바르지 않습니다.');
    }
    
    if (!paymentData.customerName || paymentData.customerName.trim() === '') {
      paymentData.customerName = 'Guest';
    }
    
    if (!paymentData.orderId || paymentData.orderId.trim() === '') {
      throw new Error('주문 ID가 올바르지 않습니다.');
    }
    
    if (!paymentData.successUrl || !paymentData.failUrl) {
      throw new Error('성공/실패 URL이 올바르지 않습니다.');
    }
    
    console.log('💳 결제 요청 데이터:', paymentData);
    
    // 토스페이먼츠 결제 요청 데이터 검증
    const requestData = {
      amount: paymentData.amount,
      orderId: paymentData.orderId,
      orderName: paymentData.orderName,
      customerName: paymentData.customerName,
      successUrl: paymentData.successUrl,
      failUrl: paymentData.failUrl
    };
    
    console.log('🔍 토스페이먼츠 요청 데이터 검증:', {
      amount: requestData.amount,
      orderId: requestData.orderId,
      orderName: requestData.orderName,
      customerName: requestData.customerName,
      successUrl: requestData.successUrl,
      failUrl: requestData.failUrl
    });
    
    // 최종 검증
    if (!requestData.orderName || requestData.orderName.trim() === '') {
      throw new Error('상품명이 비어있습니다.');
    }
    
    if (!requestData.amount || requestData.amount <= 0) {
      throw new Error('결제 금액이 올바르지 않습니다.');
    }
    
    if (!requestData.orderId || requestData.orderId.trim() === '') {
      throw new Error('주문 ID가 비어있습니다.');
    }
    
    // 토스페이먼츠 결제 요청 (카드 결제)
    const response = await tossPayments.requestPayment('카드', {
      amount: requestData.amount,
      orderId: requestData.orderId,
      orderName: requestData.orderName,
      customerName: requestData.customerName,
      successUrl: requestData.successUrl,
      failUrl: requestData.failUrl
    });
    
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
 * 결제 완료 처리 (Supabase 연동)
 */
export const handlePaymentSuccess = async (orderId, paymentKey, amount) => {
  try {
    console.log('💳 결제 완료 처리 시작:', { orderId, paymentKey, amount });
    
    // Supabase에 결제 완료 처리
    const { data, error } = await supabase.rpc('process_payment_success', {
      order_id_param: orderId,
      payment_key_param: paymentKey
    });
    
    if (error) {
      console.error('❌ 결제 완료 처리 실패:', error);
      throw new Error(`결제 완료 처리에 실패했습니다: ${error.message}`);
    }
    
    console.log('✅ 결제 완료 처리 성공:', data);
    
    // 로컬 스토리지에도 저장 (백업용)
    const paymentData = {
      orderId,
      paymentKey,
      amount,
      status: 'completed',
      completedAt: new Date().toISOString()
    };
    localStorage.setItem(`payment_${orderId}`, JSON.stringify(paymentData));
    
    return paymentData;
    
  } catch (error) {
    console.error('❌ 결제 완료 처리 실패:', error);
    throw new Error('결제 완료 처리에 실패했습니다.');
  }
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
