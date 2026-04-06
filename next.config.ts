import type { NextConfig } from 'next';
import path from 'path';
import { config as dotenvConfig } from 'dotenv';

// 루트 .env.local 로드 — frontend/.env.local 대신 단일 파일로 관리
dotenvConfig({ path: path.resolve(__dirname, '../.env.local') });

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
