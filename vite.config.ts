import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { publicFilesPlugin } from './vite-plugin-public-files';
import { tindmarkConfigPlugin, readSiteConfig } from './vite-plugin-tindmark-config';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const siteConfig = readSiteConfig();
  let publicDirName = siteConfig.PublicFolder || 'public';
  if (!fs.existsSync(path.resolve(__dirname, publicDirName))) {
    try {
      const items = fs.readdirSync(__dirname);
      const matched = items.find(item => item.toLowerCase() === publicDirName.toLowerCase());
      if (matched) {
        publicDirName = matched;
      }
    } catch {}
  }

  const basePath = env.VITE_BASE_PATH || process.env.VITE_BASE_PATH || '/';
  return {
    base: basePath,
    publicDir: publicDirName,
    build: {
      outDir: '.tindmark/dist',
      copyPublicDir: true,
    },
    plugins: [react(), tailwindcss(), publicFilesPlugin(), tindmarkConfigPlugin()],
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
