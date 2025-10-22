import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 모의 결제 처리 함수
async function processMockPayment(paymentData) {
  try {
    console.log('🎭 모의 결제 처리 시작:', paymentData);
    
    // 1. 결제 요청 생성
    const { data: paymentResult, error: paymentError } = await supabase.rpc('create_payment_request', {
      user_uuid: paymentData.userId,
      order_id_param: paymentData.orderId,
      amount_krw_param: paymentData.amountKrw,
      amount_eth_param: paymentData.amountEth,
      nft_id_param: paymentData.nftId,
      nft_name_param: paymentData.nftName
    });
    
    if (paymentError) {
      throw new Error(`결제 요청 생성 실패: ${paymentError.message}`);
    }
    
    // 2. 모의 결제 성공 처리 (3초 후)
    setTimeout(async () => {
      try {
        const mockPaymentKey = `mock_pk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 결제 완료 처리
        const { data: successResult, error: successError } = await supabase.rpc('process_payment_success', {
          order_id_param: paymentData.orderId,
          payment_key_param: mockPaymentKey
        });
        
        if (successError) {
          console.error('❌ 모의 결제 완료 처리 실패:', successError);
        } else {
          console.log('✅ 모의 결제 완료 처리 성공:', successResult);
        }
      } catch (error) {
        console.error('❌ 모의 결제 완료 처리 중 오류:', error);
      }
    }, 3000);
    
    // 3. 모의 결제 응답 생성
    const mockResponse = {
      success: true,
      paymentKey: `mock_pk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId: paymentData.orderId,
      amount: paymentData.amountKrw,
      status: 'DONE',
      approvedAt: new Date().toISOString(),
      method: '카드',
      card: {
        number: '1234-****-****-1234',
        type: '신용카드',
        company: '삼성카드'
      },
      virtualAccount: null,
      mobilePhone: null,
      giftCertificate: null,
      transfer: null,
      receipt: {
        url: `https://mock-receipt.tosspayments.com/receipt/${paymentData.orderId}`
      },
      checkout: {
        url: `https://mock-checkout.tosspayments.com/checkout/${paymentData.orderId}`
      },
      currency: 'KRW',
      totalAmount: paymentData.amountKrw,
      balanceAmount: 0,
      suppliedAmount: Math.round(paymentData.amountKrw * 0.9),
      vat: Math.round(paymentData.amountKrw * 0.1),
      taxFreeAmount: 0,
      taxExemptionAmount: 0,
      discount: null,
      cancels: null,
      secret: `mock_secret_${Date.now()}`,
      type: 'NORMAL',
      easyPay: null,
      country: 'KR',
      failure: null,
      isPartialCancelable: true,
      cardCompany: 'SAMSUNG',
      discountAmount: 0,
      cashReceipt: null,
      cashReceipts: null,
      cultureExpense: null,
      cultureExpenseReceipt: null,
      transactionKey: `mock_tx_${Date.now()}`,
      receiptKey: `mock_receipt_${Date.now()}`,
      conversationUuid: `mock_conv_${Date.now()}`,
      pci: null,
      giftCertificateType: null,
      giftCertificateKey: null,
      giftCertificateId: null,
      giftCertificateName: null,
      giftCertificateTypeName: null,
      settlementStatus: 'INCOMPLETED',
      isLive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      failedAt: null,
      cancelledAt: null,
      useEscrow: false,
      useDiscount: false,
      useCashReceipt: false,
      useCultureExpense: false,
      useAppCard: false,
      useCardPoint: false,
      useEasyPay: false,
      useGiftCertificate: false,
      useMobilePhone: false,
      useTransfer: false,
      useVirtualAccount: false,
      useAccount: false,
      useCashReceipts: false,
      useCultureExpenses: false,
      useGiftCertificates: false,
      useMobilePhones: false,
      useTransfers: false,
      useVirtualAccounts: false,
      useAccounts: false,
      useCashReceiptTypes: false,
      useCultureExpenseTypes: false,
      useGiftCertificateTypes: false,
      useMobilePhoneTypes: false,
      useTransferTypes: false,
      useVirtualAccountTypes: false,
      useAccountTypes: false,
      useCashReceiptTypeNames: false,
      useCultureExpenseTypeNames: false,
      useGiftCertificateTypeNames: false,
      useMobilePhoneTypeNames: false,
      useTransferTypeNames: false,
      useVirtualAccountTypeNames: false,
      useAccountTypeNames: false,
      useCashReceiptTypeName: false,
      useCultureExpenseTypeName: false,
      useGiftCertificateTypeName: false,
      useMobilePhoneTypeName: false,
      useTransferTypeName: false,
      useVirtualAccountTypeName: false,
      useAccountTypeName: false,
      useCashReceiptType: false,
      useCultureExpenseType: false,
      useGiftCertificateType: false,
      useMobilePhoneType: false,
      useTransferType: false,
      useVirtualAccountType: false,
      useAccountType: false,
      useCashReceiptTypes: false,
      useCultureExpenseTypes: false,
      useGiftCertificateTypes: false,
      useMobilePhoneTypes: false,
      useTransferTypes: false,
      useVirtualAccountTypes: false,
      useAccountTypes: false,
      useCashReceiptTypeNames: false,
      useCultureExpenseTypeNames: false,
      useGiftCertificateTypeNames: false,
      useMobilePhoneTypeNames: false,
      useTransferTypeNames: false,
      useVirtualAccountTypeNames: false,
      useAccountTypeNames: false,
      useCashReceiptTypeName: false,
      useCultureExpenseTypeName: false,
      useGiftCertificateTypeName: false,
      useMobilePhoneTypeName: false,
      useTransferTypeName: false,
      useVirtualAccountTypeName: false,
      useAccountTypeName: false,
      useCashReceiptType: false,
      useCultureExpenseType: false,
      useGiftCertificateType: false,
      useMobilePhoneType: false,
      useTransferType: false,
      useVirtualAccountType: false,
      useAccountType: false
    };
    
    return {
      success: true,
      data: mockResponse
    };
    
  } catch (error) {
    console.error('❌ 모의 결제 처리 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, orderId, amountKrw, amountEth, nftId, nftName } = req.body;

    // 필수 파라미터 검증
    if (!userId || !orderId || !amountKrw || !amountEth || !nftId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: userId, orderId, amountKrw, amountEth, nftId'
      });
    }

    console.log('🎭 모의 결제 요청:', { userId, orderId, amountKrw, amountEth, nftId, nftName });

    // 모의 결제 처리
    const result = await processMockPayment({
      userId,
      orderId,
      amountKrw,
      amountEth,
      nftId,
      nftName: nftName || 'NFT 구매'
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    console.log('✅ 모의 결제 성공:', result.data);

    return res.status(200).json({
      success: true,
      message: 'Mock payment processed successfully',
      data: result.data
    });

  } catch (error) {
    console.error('❌ 모의 결제 처리 중 오류:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
