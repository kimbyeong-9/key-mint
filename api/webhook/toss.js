import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 웹훅 서명 검증 함수
function verifyWebhookSignature(payload, signature, secret) {
  if (!signature || !secret) {
    return false;
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// IP 화이트리스트 (Toss Payments IP 대역)
const ALLOWED_IPS = [
  '52.78.100.19',
  '52.78.48.223',
  '52.78.5.163',
  '52.78.5.164',
  '52.78.5.165',
  '52.78.5.166',
  '52.78.5.167',
  '52.78.5.168',
  '52.78.5.169',
  '52.78.5.170',
  '52.78.5.171',
  '52.78.5.172',
  '52.78.5.173',
  '52.78.5.174',
  '52.78.5.175',
  '52.78.5.176',
  '52.78.5.177',
  '52.78.5.178',
  '52.78.5.179',
  '52.78.5.180'
];

// IP 검증 함수
function isAllowedIP(ip) {
  // 개발 환경에서는 모든 IP 허용
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  return ALLOWED_IPS.includes(ip);
}

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-toss-signature');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // IP 검증
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!isAllowedIP(clientIP)) {
      console.warn('⚠️ 허용되지 않은 IP에서 웹훅 접근:', clientIP);
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 웹훅 서명 검증
    const signature = req.headers['x-toss-signature'];
    const webhookSecret = process.env.TOSS_WEBHOOK_SECRET;
    
    if (webhookSecret && !verifyWebhookSignature(JSON.stringify(req.body), signature, webhookSecret)) {
      console.warn('⚠️ 웹훅 서명 검증 실패');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.log('🔔 토스페이먼츠 웹훅 수신:', {
      ip: clientIP,
      signature: signature ? 'present' : 'missing',
      body: req.body
    });

    // 웹훅 데이터 검증
    const { webhookId, eventType, paymentKey, orderId, status, data } = req.body;

    if (!webhookId || !eventType) {
      return res.status(400).json({ 
        error: 'Missing required fields: webhookId, eventType' 
      });
    }

    // 웹훅 데이터 구성
    const webhookData = {
      webhookId,
      eventType,
      paymentKey: paymentKey || null,
      orderId: orderId || null,
      status: status || null,
      data: data || null,
      receivedAt: new Date().toISOString(),
      clientIP: clientIP
    };

    // Supabase에서 웹훅 처리
    const { data: result, error } = await supabase.rpc('process_toss_webhook', {
      webhook_data: webhookData
    });

    if (error) {
      console.error('❌ 웹훅 처리 실패:', error);
      return res.status(500).json({ 
        error: 'Webhook processing failed',
        details: error.message 
      });
    }

    console.log('✅ 웹훅 처리 완료:', result);

    // 토스페이먼츠에 성공 응답
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      webhookId: result.webhook_id
    });

  } catch (error) {
    console.error('❌ 웹훅 처리 중 오류:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

