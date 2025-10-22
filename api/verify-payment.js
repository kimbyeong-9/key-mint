import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Toss Payments API로 결제 검증
async function verifyPaymentWithToss(paymentKey, orderId, amount) {
  try {
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount
      })
    });

    if (!response.ok) {
      throw new Error(`Toss API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('❌ Toss Payments API 검증 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 중복 결제 방지 검사
async function checkDuplicatePayment(orderId, paymentKey) {
  try {
    const { data, error } = await supabase
      .from('payment_history')
      .select('id, status, payment_key')
      .eq('order_id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data) {
      // 이미 처리된 결제인지 확인
      if (data.status === 'completed') {
        return {
          isDuplicate: true,
          message: '이미 완료된 결제입니다.'
        };
      }
      
      // 같은 결제 키로 이미 처리된 경우
      if (data.payment_key === paymentKey) {
        return {
          isDuplicate: true,
          message: '이미 처리된 결제 키입니다.'
        };
      }
    }

    return {
      isDuplicate: false,
      message: '새로운 결제입니다.'
    };
  } catch (error) {
    console.error('❌ 중복 결제 검사 실패:', error);
    return {
      isDuplicate: false,
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
    const { paymentKey, orderId, amount } = req.body;

    // 필수 파라미터 검증
    if (!paymentKey || !orderId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: paymentKey, orderId, amount'
      });
    }

    console.log('🔍 결제 검증 시작:', { paymentKey, orderId, amount });

    // 1. 중복 결제 방지 검사
    const duplicateCheck = await checkDuplicatePayment(orderId, paymentKey);
    if (duplicateCheck.isDuplicate) {
      return res.status(409).json({
        success: false,
        error: duplicateCheck.message,
        isDuplicate: true
      });
    }

    // 2. Toss Payments API로 결제 검증
    const verificationResult = await verifyPaymentWithToss(paymentKey, orderId, amount);
    
    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed',
        details: verificationResult.error
      });
    }

    const paymentData = verificationResult.data;

    // 3. 결제 상태 확인
    if (paymentData.status !== 'DONE') {
      return res.status(400).json({
        success: false,
        error: 'Payment is not completed',
        status: paymentData.status
      });
    }

    // 4. 결제 금액 검증
    if (parseInt(paymentData.totalAmount) !== parseInt(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Payment amount mismatch',
        expected: amount,
        actual: paymentData.totalAmount
      });
    }

    // 5. 결제 완료 처리
    const { data: result, error: processError } = await supabase.rpc('process_payment_success', {
      order_id_param: orderId,
      payment_key_param: paymentKey
    });

    if (processError) {
      console.error('❌ 결제 완료 처리 실패:', processError);
      return res.status(500).json({
        success: false,
        error: 'Payment processing failed',
        details: processError.message
      });
    }

    console.log('✅ 결제 검증 및 처리 완료:', result);

    return res.status(200).json({
      success: true,
      message: 'Payment verified and processed successfully',
      data: {
        orderId,
        paymentKey,
        amount: paymentData.totalAmount,
        status: paymentData.status,
        approvedAt: paymentData.approvedAt
      }
    });

  } catch (error) {
    console.error('❌ 결제 검증 중 오류:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
