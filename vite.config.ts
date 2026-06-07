import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { publicFilesPlugin } from './vite-plugin-public-files'

export default defineConfig({
  plugins: [react(), tailwindcss(), publicFilesPlugin()],
  base: '/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})