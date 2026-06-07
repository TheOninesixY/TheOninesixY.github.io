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
<<<<<<< HEAD
  },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})
=======
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
>>>>>>> parent of 993b143 (github)
