import matter from 'gray-matter';

const articleFileUrls = {
  ...import.meta.glob(['/docs/**/*', '!/docs/**/*.md', '!/docs/**/.folder.json'], {
    eager: true,
    query: '?url',
    import: 'default',
  }),
  ...import.meta.glob(['/Docs/**/*', '!/Docs/**/*.md', '!/Docs/**/.folder.json'], {
    eager: true,
    query: '?url',
    import: 'default',
  }),
} as Record<string, string>;

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
    const modules = {
      ...import.meta.glob('/docs/**/.folder.json', { as: 'raw', eager: true }),
      ...import.meta.glob('/Docs/**/.folder.json', { as: 'raw', eager: true }),
    };
    const content = modules[`/docs/${folderPath}/.folder.json`] || modules[`/Docs/${folderPath}/.folder.json`];
    
    if (!content) return null;
    
    const config = JSON.parse(content as string);
    return {
      title: config.title,
      hidden: config.hidden ?? false,
    };
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

function extractFileNameWithoutPath(path: string): string {
  const pathParts = path.replace(/^\/[Dd]ocs\//, '').replace(/\.md$/, '').split('/');
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
    return `/${url.slice(2).replace(/^\/+/, '')}`;
  }

  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|\/|#)/i.test(url)) {
    return url;
  }

  const [, filePath, suffix = ''] = url.match(/^([^?#]*)(.*)$/) || [];
  const postDirectory = postPath.slice(0, postPath.lastIndexOf('/') + 1);
  const sourcePath = normalizePath(`${postDirectory}${filePath}`);
  let decodedSourcePath = sourcePath;

  try {
    decodedSourcePath = decodeURIComponent(sourcePath);
  } catch {
    // Keep the original URL when it contains an invalid escape sequence.
  }

  const assetUrl = articleFileUrls[sourcePath] || articleFileUrls[decodedSourcePath];
  return assetUrl ? `${assetUrl}${suffix}` : url;
}

// In a real app, we might fetch this from an API.
// Here we use Vite's import.meta.glob to find all markdown files in /docs or /Docs recursively.
export async function getAllPosts(): Promise<PostMetadata[]> {
  const modules = {
    ...import.meta.glob('/docs/**/*.md', { as: 'raw', eager: true }),
    ...import.meta.glob('/Docs/**/*.md', { as: 'raw', eager: true }),
  };
  
  const posts = Object.entries(modules).map(([path, content]) => {
    let slug = path.replace(/^\/[Dd]ocs\//, '').replace(/\.md$/, '');
    
    if (slug.endsWith('/index')) {
      slug = slug.slice(0, -6);
    }
    
    const { data, content: markdownContent } = matter(content as string);
    
    let title = data.title;
    if (!title) {
      title = extractTitleFromContent(markdownContent);
    }
    if (!title) {
      title = extractFileNameWithoutPath(path);
    }
    
    return {
      slug,
      path,
      title,
      date: data.date || '',
      excerpt: data.excerpt || '',
    };
  });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const modules = {
    ...import.meta.glob('/docs/**/*.md', { as: 'raw', eager: true }),
    ...import.meta.glob('/Docs/**/*.md', { as: 'raw', eager: true }),
  };
  
  let cleanSlug = slug;
  try {
    cleanSlug = decodeURIComponent(slug);
  } catch (e) {
    cleanSlug = slug;
  }
  cleanSlug = cleanSlug.replace(/^\/+/, '').replace(/^[Dd]ocs\//, '').replace(/\/+$/, '');

  const possiblePaths = [
    `/docs/${cleanSlug}.md`,
    `/docs/${cleanSlug}/index.md`,
    `/Docs/${cleanSlug}.md`,
    `/Docs/${cleanSlug}/index.md`,
  ];
  
  let content = null;
  let matchedPath = '';
  
  for (const path of possiblePaths) {
    if (modules[path]) {
      content = modules[path];
      matchedPath = path;
      break;
    }
  }

  // Fallback: match by cleaned slug
  if (!content) {
    const lowerClean = cleanSlug.toLowerCase();
    for (const [path, modContent] of Object.entries(modules)) {
      let pSlug = path.replace(/^\/[Dd]ocs\//, '').replace(/\.md$/, '');
      if (pSlug.endsWith('/index')) {
        pSlug = pSlug.slice(0, -6);
      }
      if (pSlug.toLowerCase() === lowerClean) {
        content = modContent;
        matchedPath = path;
        cleanSlug = pSlug;
        break;
      }
    }
  }

  if (!content) return null;

  const { data, content: markdownContent } = matter(content as string);

  let title = data.title;
  if (!title) {
    title = extractTitleFromContent(markdownContent);
  }
  if (!title) {
    title = extractFileNameWithoutPath(matchedPath);
  }

  return {
    slug: cleanSlug,
    path: matchedPath,
    title,
    date: data.date || '',
    excerpt: data.excerpt || '',
    content: markdownContent,
  };
}

export async function buildFolderTree(posts: PostMetadata[]): Promise<FolderItem[]> {
  const tree: FolderItem[] = [];
  const folderMap = new Map<string, FolderItem>();
  const folderConfigs = new Map<string, FolderConfig>();

  for (const post of posts) {
    const pathParts = post.path.replace(/^\/[Dd]ocs\//, '').replace(/\.md$/, '').split('/');
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
          if (!folderConfigs.has(currentPath)) {
            const config = await loadFolderConfig(currentPath);
            folderConfigs.set(currentPath, config || {});
          }
          
          const config = folderConfigs.get(currentPath)!;
          
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
