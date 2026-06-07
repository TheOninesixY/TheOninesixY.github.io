import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

export function publicFilesPlugin(): Plugin {
  const publicDir = path.resolve(__dirname, 'public');
  
  function getPublicFiles() {
    const files: { name: string; type: string; size: number }[] = [];
    
    try {
      const items = fs.readdirSync(publicDir);
      for (const item of items) {
        const itemPath = path.join(publicDir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isFile()) {
          const ext = item.split('.').pop()?.toLowerCase() || '';
          let type = 'other';
          if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) {
            type = 'video';
          } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
            type = 'image';
          }
          files.push({ name: item, type, size: stat.size });
        }
      }
    } catch (error) {
      console.error('Error reading public directory:', error);
    }
    
    return files;
  }

  return {
    name: 'public-files-plugin',
    
    configureServer(server) {
      server.middlewares.use('/api/public-files', (req, res) => {
        const files = getPublicFiles();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ files }));
      });
    },
    
    generateBundle() {
      const files = getPublicFiles();
      this.emitFile({
        type: 'asset',
        fileName: 'public-files.json',
        source: JSON.stringify({ files }, null, 2),
      });
    },
  };
}