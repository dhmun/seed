#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌊 Netlify 배포 스크립트 시작...');

try {
  // 빌드 실행
  console.log('📦 프로젝트 빌드 중...');
  execSync('GITHUB_PAGES=true npm run build', { stdio: 'inherit' });
  
  // netlify-cli 설치 확인
  try {
    execSync('netlify --version', { stdio: 'ignore' });
  } catch {
    console.log('📥 Netlify CLI 설치 중...');
    execSync('npm install -g netlify-cli', { stdio: 'inherit' });
  }
  
  // 배포 실행
  console.log('🚀 Netlify에 배포 중...');
  execSync('netlify deploy --prod --dir=out', { stdio: 'inherit' });
  
  console.log('✅ 배포 완료!');
  
} catch (error) {
  console.error('❌ 배포 실패:', error.message);
  process.exit(1);
}