// Vercel Serverless Function - User Management
// Supabase를 사용한 사용자 데이터 CRUD 처리

import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성 (서버사이드)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

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

  try {
    // 중복 확인
    const { data: existingUser } = await supabase
      .from('users')
      .select('address')
      .eq('address', address)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // 사용자 생성
    const { data, error } = await supabase
      .from('users')
      .insert([{ address, username, email }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to create user', message: error.message });
    }

    return res.status(201).json({
      success: true,
      user: {
        address: data.address,
        username: data.username,
        email: data.email,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: 'Failed to create user', message: error.message });
  }
}

// 사용자 조회
async function getUser(req, res) {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Missing address parameter' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('address', address)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return res.status(404).json({ error: 'User not found' });
      }
      console.error('Supabase select error:', error);
      return res.status(500).json({ error: 'Failed to get user', message: error.message });
    }

    return res.status(200).json({
      user: {
        address: data.address,
        username: data.username,
        email: data.email,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to get user', message: error.message });
  }
}

// 사용자 정보 업데이트
async function updateUser(req, res) {
  const { address, username, email } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Missing address' });
  }

  if (!username && !email) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  try {
    // 업데이트할 필드 준비
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('address', address)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      console.error('Supabase update error:', error);
      return res.status(500).json({ error: 'Failed to update user', message: error.message });
    }

    return res.status(200).json({
      success: true,
      user: {
        address: data.address,
        username: data.username,
        email: data.email,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Failed to update user', message: error.message });
  }
}

// 사용자 삭제
async function deleteUser(req, res) {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Missing address' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('address', address)
      .select();

    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({ error: 'Failed to delete user', message: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Failed to delete user', message: error.message });
  }
}
