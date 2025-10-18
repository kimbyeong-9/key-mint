// Vercel Serverless Function - Google OAuth
// https://vercel.com/docs/functions/serverless-functions

/**
 * Google OAuth 인증 처리
 *
 * 사용 방법:
 * 1. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
 * 2. 승인된 리디렉션 URI에 https://your-domain.vercel.app/api/auth/google/callback 추가
 * 3. .env.local에 환경 변수 설정:
 *    - GOOGLE_CLIENT_ID
 *    - GOOGLE_CLIENT_SECRET
 *    - GOOGLE_REDIRECT_URI
 */

export default async function handler(req, res) {
  const { method } = req;

  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;

    // OAuth 시작 (code가 없는 경우)
    if (!code) {
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID);
      googleAuthUrl.searchParams.append('redirect_uri', process.env.GOOGLE_REDIRECT_URI);
      googleAuthUrl.searchParams.append('response_type', 'code');
      googleAuthUrl.searchParams.append('scope', 'openid email profile');
      googleAuthUrl.searchParams.append('access_type', 'offline');
      googleAuthUrl.searchParams.append('prompt', 'consent');

      return res.redirect(googleAuthUrl.toString());
    }

    // OAuth 콜백 처리 (code가 있는 경우)
    // 액세스 토큰 요청
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokens = await tokenResponse.json();

    // 사용자 정보 가져오기
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await userInfoResponse.json();

    // TODO: 세션 생성 또는 JWT 토큰 발급
    // 여기서는 간단하게 사용자 정보를 클라이언트로 전달
    // 실제로는 세션 쿠키 또는 JWT를 설정해야 합니다

    // 프론트엔드로 리다이렉트 (사용자 정보를 쿼리 파라미터로 전달 - 보안상 권장하지 않음)
    // 실제로는 세션 쿠키를 설정하고 리다이렉트해야 합니다
    const redirectUrl = new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    redirectUrl.searchParams.append('status', 'success');

    // 쿠키에 사용자 정보 저장 (실제로는 JWT 사용 권장)
    res.setHeader('Set-Cookie', [
      `user_email=${userInfo.email}; Path=/; HttpOnly; Secure; SameSite=Strict`,
      `user_name=${encodeURIComponent(userInfo.name)}; Path=/; HttpOnly; Secure; SameSite=Strict`,
    ]);

    return res.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('Google OAuth error:', error);
    return res.status(500).json({ error: 'Authentication failed', message: error.message });
  }
}
