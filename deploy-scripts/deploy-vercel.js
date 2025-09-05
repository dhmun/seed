#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🚀 Vercel 배포 스크립트 시작...');

try {
  // vercel cli 설치 확인
  try {
    execSync('vercel --version', { stdio: 'ignore' });
  } catch {
    console.log('📥 Vercel CLI 설치 중...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }
  
  // 로그인 확인
  console.log('🔐 Vercel 로그인 확인...');
  try {
    execSync('vercel whoami', { stdio: 'ignore' });
  } catch {
    console.log('Please login to Vercel:');
    execSync('vercel login', { stdio: 'inherit' });
  }
  
  // 배포 실행
  console.log('🚀 Vercel에 배포 중...');
  execSync('vercel --prod', { stdio: 'inherit' });
  
  console.log('✅ 배포 완료!');
  
} catch (error) {
  console.error('❌ 배포 실패:', error.message);
  process.exit(1);
}
