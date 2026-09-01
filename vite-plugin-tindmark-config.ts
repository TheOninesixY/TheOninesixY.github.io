import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import type { Plugin } from 'vite';

export interface SiteConfig {
  Title: string;
  Subtitle: string;
  Description: string;
  ColorPack: string;
  DefaultColor: string;
  DefaultTheme?: string;
  DocsFolder: string;
  PublicFolder: string;
  ThemeFolder?: string;
}

const DEFAULT_CONFIG: SiteConfig = {
  Title: 'TindMark',
  Subtitle: '',
  Description: '',
  ColorPack: '',
  DefaultColor: '',
  DefaultTheme: '',
  DocsFolder: 'Docs',
  PublicFolder: 'public',
  ThemeFolder: 'Themes',
};

export function readSiteConfig(rootDir: string = process.cwd()): SiteConfig {
  const configPath = path.resolve(rootDir, '.tindmark/config.yml');
  let config: Partial<SiteConfig> = {};
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      const parsed = yaml.load(content);
      if (parsed && typeof parsed === 'object') {
        config = parsed as Partial<SiteConfig>;
      }
    } catch (e) {
      console.error('Failed to read .tindmark/config.yml:', e);
    }
  }
  return {
    ...DEFAULT_CONFIG,
    ...config,
  };
}

export function readColorPack(colorPackFileName?: string, rootDir: string = process.cwd()): Record<string, string> {
  const trimmed = colorPackFileName?.trim();
  if (!trimmed) {
    return {};
  }
  const colorPackPath = path.resolve(rootDir, '.tindmark', trimmed);
  if (fs.existsSync(colorPackPath)) {
    try {
      const content = fs.readFileSync(colorPackPath, 'utf-8');
      const parsed = yaml.load(content);
      if (parsed && typeof parsed === 'object') {
        const result: Record<string, string> = {};
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === 'string' && value.trim()) {
            result[key] = value.trim();
          }
        }
        return result;
      }
    } catch (e) {
      console.error(`Failed to read color pack (${colorPackFileName}):`, e);
    }
  }
  return {};
}

export function readThemes(themeFolderName?: string, rootDir: string = process.cwd()): Record<string, string> {
  const folderName = themeFolderName?.trim() || 'Themes';
  // Check in .tindmark/<ThemeFolder> first, then <rootDir>/<ThemeFolder>
  let themeDir = path.resolve(rootDir, '.tindmark', folderName);
  if (!fs.existsSync(themeDir)) {
    themeDir = path.resolve(rootDir, folderName);
  }

  const themes: Record<string, string> = {};
  if (fs.existsSync(themeDir)) {
    try {
      const entries = fs.readdirSync(themeDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.css')) {
          const themeName = path.basename(entry.name, '.css');
          const fullPath = path.join(themeDir, entry.name);
          const cssContent = fs.readFileSync(fullPath, 'utf-8');
          themes[themeName] = cssContent;
        }
      }
    } catch (e) {
      console.error(`Failed to read themes (${folderName}):`, e);
    }
  }
  return themes;
}

function scanDocsDirectory(rootDir: string, docsFolderName: string) {
  const docsDir = path.resolve(rootDir, docsFolderName || 'Docs');
  const markdownFiles: Record<string, string> = {};
  const folderConfigs: Record<string, any> = {};

  if (!fs.existsSync(docsDir)) {
    return { markdownFiles, folderConfigs };
  }

  function walk(currentDir: string, relativePrefix: string = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const entryRelative = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath, entryRelative);
      } else if (entry.isFile()) {
        if (entry.name === '.folder.json') {
          try {
            const raw = fs.readFileSync(fullPath, 'utf-8');
            folderConfigs[entryRelative] = JSON.parse(raw);
          } catch (e) {
            console.error(`Failed to parse ${fullPath}:`, e);
          }
        } else if (entry.name.endsWith('.md')) {
          try {
            markdownFiles[entryRelative] = fs.readFileSync(fullPath, 'utf-8');
          } catch (e) {
            console.error(`Failed to read markdown ${fullPath}:`, e);
          }
        }
      }
    }
  }

  walk(docsDir);
  return { markdownFiles, folderConfigs };
}

export function tindmarkConfigPlugin(): Plugin {
  const virtualConfigModuleId = 'virtual:tindmark-config';
  const resolvedVirtualConfigId = '\0' + virtualConfigModuleId;

  const virtualDocsModuleId = 'virtual:tindmark-docs';
  const resolvedVirtualDocsId = '\0' + virtualDocsModuleId;

  return {
    name: 'vite-plugin-tindmark-config',
    resolveId(id) {
      if (id === virtualConfigModuleId) {
        return resolvedVirtualConfigId;
      }
      if (id === virtualDocsModuleId) {
        return resolvedVirtualDocsId;
      }
    },
    load(id) {
      if (id === resolvedVirtualConfigId) {
        const config = readSiteConfig();
        const colors = readColorPack(config.ColorPack);
        const themes = readThemes(config.ThemeFolder);
        return `
export const siteConfig = ${JSON.stringify(config, null, 2)};
export const themeColors = ${JSON.stringify(colors, null, 2)};
export const customThemes = ${JSON.stringify(themes, null, 2)};
export default siteConfig;
`;
      }
      if (id === resolvedVirtualDocsId) {
        const config = readSiteConfig();
        const { markdownFiles, folderConfigs } = scanDocsDirectory(process.cwd(), config.DocsFolder);
        return `
export const markdownFiles = ${JSON.stringify(markdownFiles, null, 2)};
export const folderConfigs = ${JSON.stringify(folderConfigs, null, 2)};
export const docsFolderName = ${JSON.stringify(config.DocsFolder || 'Docs')};
`;
      }
    },
    handleHotUpdate({ file, server }) {
      const config = readSiteConfig();
      const docsDir = path.resolve(process.cwd(), config.DocsFolder || 'Docs');

      if (
        (file.includes('.tindmark') && (file.endsWith('.yml') || file.endsWith('.yaml') || file.endsWith('.css'))) ||
        (config.ThemeFolder && file.includes(config.ThemeFolder) && file.endsWith('.css'))
      ) {
        const mod1 = server.moduleGraph.getModuleById(resolvedVirtualConfigId);
        if (mod1) server.moduleGraph.invalidateModule(mod1);
        const mod2 = server.moduleGraph.getModuleById(resolvedVirtualDocsId);
        if (mod2) server.moduleGraph.invalidateModule(mod2);
        server.ws.send({ type: 'full-reload' });
        return;
      }

      if (file.startsWith(docsDir)) {
        const mod = server.moduleGraph.getModuleById(resolvedVirtualDocsId);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      }
    },
    transformIndexHtml(html) {
      const config = readSiteConfig();
      const colors = readColorPack(config.ColorPack);
      const defaultColorKey = config.DefaultColor?.trim() || '';
      const defaultHex = defaultColorKey ? (colors[defaultColorKey] || '') : '';
      
      let transformed = html.replace(/<title>.*?<\/title>/i, `<title>${config.Title || 'TindMark'}</title>`);
      const injection = `<script>window.__TINDMARK_DEFAULT_ACCENT__ = ${JSON.stringify(defaultHex)};</script>`;
      transformed = transformed.replace('<head>', `<head>\n    ${injection}`);
      return transformed;
    },
  };
}
