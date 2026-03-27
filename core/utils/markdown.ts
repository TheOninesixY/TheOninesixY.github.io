import matter from 'gray-matter';

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
    const configPath = `/docs/${folderPath}/.folder.json`;
    const modules = import.meta.glob('/docs/**/.folder.json', { as: 'raw', eager: true });
    const content = modules[configPath];
    
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

// In a real app, we might fetch this from an API.
// Here we use Vite's import.meta.glob to find all markdown files in /docs recursively.
export async function getAllPosts(): Promise<PostMetadata[]> {
  const modules = import.meta.glob('/docs/**/*.md', { as: 'raw', eager: true });
  
  const posts = Object.entries(modules).map(([path, content]) => {
    let slug = path.replace('/docs/', '').replace('.md', '');
    
    if (slug.endsWith('/index')) {
      slug = slug.slice(0, -6);
    }
    
    const { data } = matter(content as string);
    
    return {
      slug,
      path,
      title: data.title || slug,
      date: data.date || '',
      excerpt: data.excerpt || '',
    };
  });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const modules = import.meta.glob('/docs/**/*.md', { as: 'raw', eager: true });
  
  const possiblePaths = [
    `/docs/${slug}.md`,
    `/docs/${slug}/index.md`,
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

  if (!content) return null;

  const { data, content: markdownContent } = matter(content as string);

  return {
    slug,
    path: matchedPath,
    title: data.title || slug,
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
    const pathParts = post.path.replace('/docs/', '').replace('.md', '').split('/');
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
