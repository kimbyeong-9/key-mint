// Vercel Serverless Function - User Management
// 사용자 데이터 CRUD 처리

/**
 * 사용자 관리 API
 *
 * DB 연결 옵션:
 * 1. Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
 * 2. PlanetScale (MySQL): https://planetscale.com/
 * 3. Neon (PostgreSQL): https://neon.tech/
 * 4. Supabase: https://supabase.com/
 *
 * 여기서는 간단한 예시를 제공하며, 실제로는 DB 연결이 필요합니다.
 */

// 임시 메모리 저장소 (실제로는 DB 사용)
const users = new Map();

export default async function handler(req, res) {
  const { method } = req;

  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (method) {
      case 'POST':
        return await createUser(req, res);

      case 'GET':
        return await getUser(req, res);

      case 'PUT':
        return await updateUser(req, res);

      case 'DELETE':
        return await deleteUser(req, res);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

// 사용자 생성
async function createUser(req, res) {
  const { address, username, email } = req.body;

  if (!address || !username || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 중복 확인
  if (users.has(address)) {
    return res.status(409).json({ error: 'User already exists' });
  }

  // 사용자 생성
  const user = {
    address,
    username,
    email,
    createdAt: new Date().toISOString(),
  };

  users.set(address, user);

  // TODO: 실제 DB에 저장
  // const result = await db.users.create({ data: user });

  return res.status(201).json({
    success: true,
    user,
  });
}

// 사용자 조회
async function getUser(req, res) {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Missing address parameter' });
  }

  const user = users.get(address);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // TODO: 실제 DB에서 조회
  // const user = await db.users.findUnique({ where: { address } });

  return res.status(200).json({ user });
}

// 사용자 정보 업데이트
async function updateUser(req, res) {
  const { address, username, email } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Missing address' });
  }

  const user = users.get(address);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // 업데이트
  if (username) user.username = username;
  if (email) user.email = email;
  user.updatedAt = new Date().toISOString();

  users.set(address, user);

  // TODO: 실제 DB에 업데이트
  // const result = await db.users.update({ where: { address }, data: { username, email } });

  return res.status(200).json({
    success: true,
    user,
  });
}

// 사용자 삭제
async function deleteUser(req, res) {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Missing address' });
  }

  if (!users.has(address)) {
    return res.status(404).json({ error: 'User not found' });
  }

  users.delete(address);

  // TODO: 실제 DB에서 삭제
  // await db.users.delete({ where: { address } });

  return res.status(200).json({ success: true });
}
