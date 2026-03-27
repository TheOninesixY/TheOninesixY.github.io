import matter from 'gray-matter';

export interface PostMetadata {
  title: string;
  date: string;
  excerpt: string;
  author: string;
  slug: string;
}

export interface Post extends PostMetadata {
  content: string;
}

// In a real app, we might fetch this from an API.
// Here we use Vite's import.meta.glob to find all markdown files in /docs.
export async function getAllPosts(): Promise<PostMetadata[]> {
  const modules = import.meta.glob('/docs/*.md', { as: 'raw', eager: true });
  
  const posts = Object.entries(modules).map(([path, content]) => {
    const slug = path.replace('/docs/', '').replace('.md', '');
    const { data } = matter(content as string);
    
    return {
      slug,
      title: data.title || slug,
      date: data.date || '',
      excerpt: data.excerpt || '',
      author: data.author || 'Anonymous',
    };
  });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const modules = import.meta.glob('/docs/*.md', { as: 'raw', eager: true });
  const path = `/docs/${slug}.md`;
  const content = modules[path];

  if (!content) return null;

  const { data, content: markdownContent } = matter(content as string);

  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    excerpt: data.excerpt || '',
    author: data.author || 'Anonymous',
    content: markdownContent,
  };
}
