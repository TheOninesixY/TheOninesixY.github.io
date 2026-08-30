import fs from 'fs';
import path from 'path';
import type { Connect, Plugin } from 'vite';

export function publicFilesPlugin(): Plugin {
  const publicDir = path.resolve(__dirname, 'public');

  const serveDirectoryIndex: Connect.NextHandleFunction = (req, _res, next) => {
    if (!req.url || !['GET', 'HEAD'].includes(req.method || '') || !req.url.split('?', 1)[0].endsWith('/')) {
      next();
      return;
    }

    try {
      const url = new URL(req.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      const indexPath = path.resolve(publicDir, `.${pathname}`, 'index.html');
      const publicPrefix = `${publicDir}${path.sep}`;

      if (pathname !== '/' && indexPath.startsWith(publicPrefix) && fs.statSync(indexPath).isFile()) {
        req.url = `${url.pathname}index.html${url.search}`;
      }
    } catch {
      // Let Vite handle missing files and malformed URLs normally.
    }

    next();
  };
  
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
      server.middlewares.use(serveDirectoryIndex);
      server.middlewares.use('/api/public-files', (req, res) => {
        const files = getPublicFiles();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ files }));
      });
    },

    configurePreviewServer(server) {
      server.middlewares.use(serveDirectoryIndex);
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
