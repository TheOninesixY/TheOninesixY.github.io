import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { publicFilesPlugin } from './vite-plugin-public-files';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  // loadEnv 只从 .env 文件读取变量，不会读取进程环境变量。
  // 在 GitHub Actions 中 VITE_BASE_PATH 是通过 env: 设置的进程环境变量，
  // 因此需要同时检查 process.env，否则 base 会回退到 '/'，
  // 导致构建出的 BASE_URL 缺少仓库前缀（如 /TindMark/），
  // 前端请求 /public-files.json 时在 GitHub Pages 上会 404。
  const basePath = env.VITE_BASE_PATH || process.env.VITE_BASE_PATH || '/';
  return {
    base: basePath,
    plugins: [react(), tailwindcss(), publicFilesPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
