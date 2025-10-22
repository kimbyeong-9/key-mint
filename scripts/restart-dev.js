#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔄 개발 서버 재시작 중...');

// 기존 프로세스 종료
const killProcess = async (port) => {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    if (stdout) {
      const pids = stdout.trim().split('\n');
      for (const pid of pids) {
        try {
          await execAsync(`kill -9 ${pid}`);
        } catch (error) {
          // 프로세스가 이미 종료된 경우 무시
        }
      }
    }
  } catch (error) {
    // 포트를 사용하는 프로세스가 없는 경우 무시
  }
  await new Promise(resolve => setTimeout(resolve, 1000));
};

// 포트 정리 및 서버 시작
const restartServer = async () => {
  try {
    // 포트 3001 정리
    await killProcess(3001);
    
    // 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 개발 서버 시작 (HMR 비활성화)
    const devServer = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        VITE_HMR: 'false' // HMR 비활성화
      }
    });
    
    devServer.on('error', (error) => {
      console.error('❌ 개발 서버 시작 실패:', error);
    });
    
    devServer.on('close', (code) => {
      console.log(`🔄 개발 서버 종료 (코드: ${code})`);
    });
    
    // 프로세스 종료 처리
    process.on('SIGINT', () => {
      console.log('\n🛑 개발 서버 종료 중...');
      devServer.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 개발 서버 종료 중...');
      devServer.kill('SIGTERM');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ 서버 재시작 실패:', error);
    process.exit(1);
  }
};

restartServer();
