import matter from 'gray-matter';
import { markdownFiles, folderConfigs, docsFolderName } from 'virtual:tindmark-docs';

// 动态匹配所有静态资源（图片、脚本等）
const articleFileUrls = {
  ...import.meta.glob(['/**/*'], {
    eager: true,
    query: '?url',
    import: 'default',
  }),
} as Record<string, string>;

// 过滤掉 markdown、.folder.json 以及 .tindmark 内部文件
const nonMarkdownArticleUrls: Record<string, string> = {};
for (const [filePath, url] of Object.entries(articleFileUrls)) {
  if (
    !filePath.startsWith('/.tindmark/') &&
    !filePath.startsWith('/node_modules/') &&
    !filePath.endsWith('.md') &&
    !filePath.endsWith('.folder.json') &&
    !filePath.endsWith('.yml') &&
    !filePath.endsWith('.yaml')
  ) {
    nonMarkdownArticleUrls[filePath] = url;
  }
}

export interface PostMetadata {
  title: string;
  date: string;
  excerpt: string;
  slug: string;
  path: string;
}

export interface Post extends PostMetadata {
  content: string;
}

export interface FolderItem {
  name: string;
  path: string;
  type: 'folder' | 'file';
  children?: FolderItem[];
  post?: PostMetadata;
  title?: string;
  hidden?: boolean;
}

interface FolderConfig {
  title?: string;
  hidden?: boolean;
}

async function loadFolderConfig(folderPath: string): Promise<FolderConfig | null> {
  try {
    const configPath = `${folderPath}/.folder.json`;
    const config = folderConfigs[configPath];
    if (config) {
      return {
        title: config.title,
        hidden: config.hidden ?? false,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

function extractTitleFromContent(content: string): string | null {
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();
  
  const h2Match = content.match(/^##\s+(.+)$/m);
  if (h2Match) return h2Match[1].trim();
  
  return null;
}

function extractFileNameWithoutPath(relativePath: string): string {
  const pathParts = relativePath.replace(/\.md$/, '').split('/');
  let fileName = pathParts[pathParts.length - 1];
  
  if (fileName === 'index' && pathParts.length > 1) {
    fileName = pathParts[pathParts.length - 2];
  }
  
  return fileName.replace(/[-_]/g, ' ');
}

function normalizePath(path: string): string {
  const parts: string[] = [];

  for (const part of path.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      parts.pop();
    } else {
      parts.push(part);
    }
  }

  return `/${parts.join('/')}`;
}

export function resolvePostUrl(url: string, postPath: string): string {
  if (url.startsWith('p:')) {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
    return `${basePath}/${url.slice(2).replace(/^\/+/, '')}`;
  }

  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|\/|#)/i.test(url)) {
    return url;
  }

  const [, filePath, suffix = ''] = url.match(/^([^?#]*)(.*)$/) || [];
  const fullPostPath = `/${docsFolderName}/${postPath}`;
  const postDirectory = fullPostPath.slice(0, fullPostPath.lastIndexOf('/') + 1);
  const sourcePath = normalizePath(`${postDirectory}${filePath}`);
  let decodedSourcePath = sourcePath;

  try {
    decodedSourcePath = decodeURIComponent(sourcePath);
  } catch {
    // Keep the original URL when it contains an invalid escape sequence.
  }

  const assetUrl = nonMarkdownArticleUrls[sourcePath] || nonMarkdownArticleUrls[decodedSourcePath];
  return assetUrl ? `${assetUrl}${suffix}` : url;
}

export async function getAllPosts(): Promise<PostMetadata[]> {
  const posts: PostMetadata[] = [];

  for (const [relPath, content] of Object.entries(markdownFiles)) {
    const { data, content: markdownContent } = matter(content as string);
    if (data.hide === true) {
      continue;
    }

    let slug = relPath.replace(/\.md$/, '');
    
    if (slug.endsWith('/index')) {
      slug = slug.slice(0, -6);
    }
    
    let title = data.title;
    if (!title) {
      title = extractTitleFromContent(markdownContent);
    }
    if (!title) {
      title = extractFileNameWithoutPath(relPath);
    }
    
    posts.push({
      slug,
      path: relPath,
      title,
      date: data.date || '',
      excerpt: data.excerpt || '',
    });
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  let cleanSlug = slug;
  try {
    cleanSlug = decodeURIComponent(slug);
  } catch (e) {
    cleanSlug = slug;
  }
  cleanSlug = cleanSlug.replace(/^\/+/, '').replace(/\/+$/, '');

  let content: string | null = null;
  let matchedRelPath = '';
  
  const lowerClean = cleanSlug.toLowerCase();
  for (const [relPath, modContent] of Object.entries(markdownFiles)) {
    let pSlug = relPath.replace(/\.md$/, '');
    if (pSlug.endsWith('/index')) {
      pSlug = pSlug.slice(0, -6);
    }
    if (pSlug.toLowerCase() === lowerClean) {
      content = modContent;
      matchedRelPath = relPath;
      cleanSlug = pSlug;
      break;
    }
  }

  if (!content) return null;

  const { data, content: markdownContent } = matter(content as string);
  if (data.hide === true) {
    return null;
  }

  let title = data.title;
  if (!title) {
    title = extractTitleFromContent(markdownContent);
  }
  if (!title) {
    title = extractFileNameWithoutPath(matchedRelPath);
  }

  return {
    slug: cleanSlug,
    path: matchedRelPath,
    title,
    date: data.date || '',
    excerpt: data.excerpt || '',
    content: markdownContent,
  };
}

export async function buildFolderTree(posts: PostMetadata[]): Promise<FolderItem[]> {
  const tree: FolderItem[] = [];
  const folderConfigsMap = new Map<string, FolderConfig>();

  for (const post of posts) {
    const pathParts = post.path.replace(/\.md$/, '').split('/');
    let currentLevel = tree;
    let currentPath = '';

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const isLast = i === pathParts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (isLast) {
        currentLevel.push({
          name: part,
          path: currentPath,
          type: 'file',
          post,
        });
      } else {
        let folder = currentLevel.find(item => item.type === 'folder' && item.name === part);
        
        if (!folder) {
          if (!folderConfigsMap.has(currentPath)) {
            const config = await loadFolderConfig(currentPath);
            folderConfigsMap.set(currentPath, config || {});
          }
          
          const config = folderConfigsMap.get(currentPath)!;
          
          folder = {
            name: part,
            path: currentPath,
            type: 'folder',
            children: [],
            title: config.title,
            hidden: config.hidden,
          };
          currentLevel.push(folder);
        }
        
        currentLevel = folder.children!;
      }
    }
  }

  const processedTree = convertSingleIndexFolders(tree);
  return processedTree.filter(item => !item.hidden);
}

function convertSingleIndexFolders(tree: FolderItem[]): FolderItem[] {
  return tree.map(item => {
    if (item.type === 'folder' && item.children) {
      const children = convertSingleIndexFolders(item.children);
      
      const indexFile = children.find(child => 
        child.type === 'file' && child.name === 'index'
      );
      
      const otherFiles = children.filter(child => 
        child.type === 'file' && child.name !== 'index'
      );
      
      const folders = children.filter(child => child.type === 'folder');
      
      if (indexFile && otherFiles.length === 0 && folders.length === 0) {
        return {
          name: item.name,
          path: item.path,
          type: 'file',
          post: indexFile.post,
          title: item.title,
        };
      }
      
      return {
        ...item,
        children,
      };
    }
    return item;
  });
}
