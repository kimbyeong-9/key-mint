// Vercel Serverless Function - IPFS Upload
// 이미지와 메타데이터를 IPFS에 업로드

/**
 * IPFS 업로드 API
 *
 * 사용 방법:
 * 1. web3.storage 또는 Pinata API 키 발급
 * 2. .env.local에 환경 변수 설정:
 *    - WEB3_STORAGE_TOKEN (web3.storage 사용 시)
 *    - PINATA_API_KEY (Pinata 사용 시)
 *    - PINATA_SECRET_KEY
 */

import { File } from '@web-std/file';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  const { method } = req;

  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // FormData 파싱이 필요합니다
    // Vercel에서는 multipart/form-data 파싱을 위해 multer 또는 formidable 사용 권장

    // 여기서는 간단한 예시만 제공
    const { file, metadata } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // 방법 1: web3.storage 사용
    if (process.env.WEB3_STORAGE_TOKEN) {
      const uri = await uploadWithWeb3Storage(file, metadata);
      return res.status(200).json({ uri });
    }

    // 방법 2: Pinata 사용
    if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY) {
      const uri = await uploadWithPinata(file, metadata);
      return res.status(200).json({ uri });
    }

    return res.status(500).json({ error: 'No IPFS provider configured' });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed', message: error.message });
  }
}

// web3.storage를 사용한 업로드
async function uploadWithWeb3Storage(file, metadata) {
  try {
    const { Web3Storage } = await import('web3.storage');
    const client = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN });

    // 이미지 업로드
    const imageFile = new File([file.data], file.name, { type: file.mimetype });
    const imageCid = await client.put([imageFile], { wrapWithDirectory: false });

    // 메타데이터 생성
    const metadataObj = {
      name: metadata.name,
      description: metadata.description,
      image: `ipfs://${imageCid}/${file.name}`,
      attributes: [
        {
          trait_type: 'Price',
          value: metadata.price,
        },
      ],
    };

    // 메타데이터 업로드
    const metadataBlob = new Blob([JSON.stringify(metadataObj)], { type: 'application/json' });
    const metadataFile = new File([metadataBlob], 'metadata.json');
    const metaCid = await client.put([metadataFile], { wrapWithDirectory: false });

    return `ipfs://${metaCid}/metadata.json`;
  } catch (error) {
    console.error('web3.storage upload error:', error);
    throw error;
  }
}

// Pinata를 사용한 업로드
async function uploadWithPinata(file, metadata) {
  try {
    const FormData = await import('form-data');
    const formData = new FormData();

    // 이미지 업로드
    formData.append('file', file.data, file.name);

    const imageResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': process.env.PINATA_API_KEY,
        'pinata_secret_api_key': process.env.PINATA_SECRET_KEY,
      },
      body: formData,
    });

    if (!imageResponse.ok) {
      throw new Error('Image upload failed');
    }

    const imageData = await imageResponse.json();

    // 메타데이터 생성 및 업로드
    const metadataObj = {
      name: metadata.name,
      description: metadata.description,
      image: `ipfs://${imageData.IpfsHash}`,
      attributes: [
        {
          trait_type: 'Price',
          value: metadata.price,
        },
      ],
    };

    const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': process.env.PINATA_API_KEY,
        'pinata_secret_api_key': process.env.PINATA_SECRET_KEY,
      },
      body: JSON.stringify(metadataObj),
    });

    if (!metadataResponse.ok) {
      throw new Error('Metadata upload failed');
    }

    const metadataData = await metadataResponse.json();

    return `ipfs://${metadataData.IpfsHash}`;
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw error;
  }
}
