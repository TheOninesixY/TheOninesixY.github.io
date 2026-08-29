import React, { useEffect, useState } from 'react';
import { getAllPosts, getPostBySlug, Post, PostMetadata, FolderItem, buildFolderTree } from './utils/markdown';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowLeft, Search, Folder, FileText, Copy, Check, Monitor, Moon, Sun, Menu, X, FolderOpen } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './utils/cn';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function BlogApp() {
  const [posts, setPosts] = useState<PostMetadata[]>([]);
  const [folderTree, setFolderTree] = useState<FolderItem[]>([]);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'post'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [toc, setToc] = useState<TocItem[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [theme, setTheme] = useState<'system' | 'dark' | 'light'>('system');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mainContentRef = React.useRef<HTMLDivElement>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}年${mm}月${dd}日`;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('blog-theme') as 'system' | 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('system');
    }
  }, []);

  const applyTheme = (currentTheme: 'system' | 'dark' | 'light') => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (currentTheme === 'system') {
      root.classList.toggle('dark', prefersDark);
    } else if (currentTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const themes: ('system' | 'dark' | 'light')[] = ['system', 'dark', 'light'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const newTheme = themes[nextIndex];
    setTheme(newTheme);
    localStorage.setItem('blog-theme', newTheme);
    applyTheme(newTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon className="w-5 h-5" />;
      case 'light':
        return <Sun className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const getThemeTitle = () => {
    switch (theme) {
      case 'dark':
        return '深色模式';
      case 'light':
        return '浅色模式';
      default:
        return '系统';
    }
  };

  useEffect(() => {
    async function loadPosts() {
      const allPosts = await getAllPosts();
      setPosts(allPosts);
      setFolderTree(await buildFolderTree(allPosts));
      setLoading(false);
    }
    loadPosts();
  }, []);

  const extractToc = (content: string): TocItem[] => {
    const regex = /^(#{2,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
      items.push({ id, text, level });
    }
    
    return items;
  };

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePostClick = async (slug: string) => {
    setLoading(true);
    const post = await getPostBySlug(slug);
    setCurrentPost(post);
    if (post) {
      setToc(extractToc(post.content));
    }
    setCurrentFolder(null);
    setView('post');
    setLoading(false);
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setView('list');
    setCurrentPost(null);
    setCurrentFolder(null);
    setToc([]);
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  };

  const handleFolderClick = (folder: FolderItem) => {
    setCurrentFolder(folder);
    setView('list');
    setCurrentPost(null);
    setToc([]);
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  };

  const getFolderContents = (): FolderItem[] => {
    if (!currentFolder) return [];
    
    const findFolder = (items: FolderItem[]): FolderItem | null => {
      for (const item of items) {
        if (item.type === 'folder' && item.path === currentFolder.path) {
          return item;
        }
        if (item.type === 'folder' && item.children) {
          const found = findFolder(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const folder = findFolder(folderTree);
    return folder?.children || [];
  };

  const renderFolderTree = (items: FolderItem[], level: number = 0) => {
    return items.map((item) => {
      if (item.type === 'folder') {
        const displayName = item.title || item.name;
        return (
          <div key={item.path} className="mt-0.5">
            <button
              onClick={() => handleFolderClick(item)}
              className={cn(
                "w-full text-left px-3 py-1.5 text-sm transition-all duration-200 rounded flex items-center gap-2",
                currentFolder?.path === item.path 
                  ? "text-stone-900 font-medium" 
                  : "text-stone-600 hover:bg-stone-100"
              )}
              style={{ paddingLeft: `${16 + level * 12}px` }}
            >
              <Folder className={cn(
                "w-4 h-4 shrink-0",
                currentFolder?.path === item.path ? "text-stone-600" : "text-stone-400"
              )} />
              <span className="truncate">{displayName}</span>
            </button>
            {item.children && (
              <div key={`children-${item.path}`} className="overflow-hidden">
                {renderFolderTree(item.children, level + 1)}
              </div>
            )}
          </div>
        );
      } else {
        const displayName = item.title || item.post?.title || item.name;
        return (
          <button
            key={item.path}
            onClick={() => handlePostClick(item.post!.slug)}
            className={cn(
              "w-full text-left px-3 py-1.5 text-sm transition-all duration-200 rounded flex items-center gap-2",
              currentPost?.slug === item.post!.slug 
                ? "text-stone-900 font-medium" 
                : "text-stone-600 hover:bg-stone-100"
            )}
            style={{ paddingLeft: `${16 + level * 12}px` }}
          >
            <FileText className={cn(
              "w-4 h-4 shrink-0",
              currentPost?.slug === item.post!.slug ? "text-stone-600" : "text-stone-400"
            )} />
            <span className="truncate">{displayName}</span>
          </button>
        );
      }
    });
  };

  if (loading && posts.length === 0) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-stone-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex overflow-hidden app-container">
      {/* Mobile Header */}
      <header className={cn(
        "mobile-header md:hidden",
        searchOpen && "search-mode",
        view === 'post' && "with-back"
      )}>
        {searchOpen ? (
          <>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="点击此处搜索"
              className="mobile-search-input"
              autoFocus
            />
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
              className="mobile-search-close"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </>
        ) : view === 'post' ? (
          <>
            <div className="mobile-header-left">
              <button
                onClick={handleBack}
                className="mobile-back-btn"
              >
                <ArrowLeft />
              </button>
              <span className="mobile-header-title">返回</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="mobile-menu-btn"
            >
              <Menu />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={toggleSidebar}
              className="mobile-menu-btn"
            >
              <Menu />
            </button>
            <span className="mobile-header-title">TindMark</span>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="mobile-search-btn"
            >
              <Search />
            </button>
          </>
        )}
      </header>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-stone-50 border-r border-stone-200 flex flex-col shrink-0 md:block",
        sidebarOpen && "open",
        view === 'post' ? "right" : "left"
      )}>
        {/* Sidebar Header */}
        <header className="h-14 flex items-center px-4 border-b border-stone-200">
          {view === 'post' ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-stone-700 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">返回</span>
            </button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <h1 className="font-medium text-lg text-stone-900">TindMark</h1>
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-1.5 hover:bg-stone-200 rounded transition-colors"
              >
                <Search className="w-4 h-4 text-stone-500" />
              </button>
            </div>
          )}
        </header>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-b border-stone-200"
            >
              <div className="p-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索文档..."
                  className="w-full px-3 py-2 text-sm bg-stone-100 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-900 placeholder-stone-400"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {view === 'list' ? (
            <div className="space-y-0.5">
              <div className="px-3 py-1 text-xs text-stone-400 font-medium uppercase tracking-wider">
                分类
              </div>
              {renderFolderTree(folderTree)}
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="px-3 py-1 text-xs text-stone-400 font-medium uppercase tracking-wider">
                目录
              </div>
              {toc.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToHeading(item.id)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded transition-colors",
                    item.level === 3 && "pl-8"
                  )}
                >
                  {item.text}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Bottom */}
        <div className="p-3 border-t border-stone-200 flex gap-2">
          <button
            onClick={() => window.location.href = '/public'}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg",
              "text-stone-600 hover:bg-stone-200 transition-all duration-200",
              "hover:scale-105 active:scale-95"
            )}
            title="资源区"
          >
            <FolderOpen className="w-5 h-5" />
            <span>资源区</span>
          </button>
          <button
            onClick={toggleTheme}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg",
              "text-stone-600 hover:bg-stone-200 transition-all duration-200",
              "hover:scale-105 active:scale-95"
            )}
            title={getThemeTitle()}
          >
            {getThemeIcon()}
            <span>{getThemeTitle()}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        ref={mainContentRef}
        className="flex-1 overflow-y-auto p-8"
      >
        <AnimatePresence mode="wait">
          {searchOpen ? (
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {posts.filter(post => 
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
              ).map((post) => (
                <motion.article
                  key={post.slug}
                  whileHover={{ scale: 1.002 }}
                  className="bg-stone-100 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:bg-stone-150"
                  onClick={() => {
                    handlePostClick(post.slug);
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <h2 className="text-xl font-bold text-stone-900 mb-1">
                    {post.title}
                  </h2>
                  {post.date && (
                    <p className="text-stone-400 text-xs mb-2">
                      {formatDate(post.date)}
                    </p>
                  )}
                  {post.excerpt && (
                    <p className="text-stone-600 text-sm line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </motion.article>
              ))}
              {searchQuery && posts.filter(post => 
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
              ).length === 0 && (
                <div className="col-span-full text-center py-12 text-stone-400">
                  未找到相关文档
                </div>
              )}
              {!searchQuery && (
                <div className="col-span-full text-center py-12 text-stone-400">
                  输入关键词搜索文档
                </div>
              )}
            </motion.div>
          ) : view === 'list' ? (
            <motion.div
              key={currentFolder ? `folder-${currentFolder.path}` : 'list'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
                {(currentFolder ? getFolderContents() : posts).filter(item => {
                  if (!searchTerm) return true;
                  const searchLower = searchTerm.toLowerCase();
                  const title = ((item as FolderItem).title || (item as PostMetadata).title || (item as FolderItem).name || '').toLowerCase();
                  return title.includes(searchLower);
                }).map((item) => {
                  const isFolder = (item as FolderItem).type === 'folder';
                  const displayName = (item as FolderItem).title || (item as FolderItem).post?.title || (item as PostMetadata).title || (item as FolderItem).name;
                  const excerpt = isFolder ? '' : ((item as FolderItem).post?.excerpt || (item as PostMetadata).excerpt || '');
                  
                  return (
                    <motion.article
                      key={isFolder ? (item as FolderItem).path : (item as PostMetadata).slug}
                      whileHover={{ scale: 1.002 }}
                      className="bg-stone-100 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:bg-stone-150"
                      onClick={() => isFolder ? handleFolderClick(item as FolderItem) : handlePostClick((item as FolderItem).post?.slug || (item as PostMetadata).slug)}
                    >
                      <h2 className="text-xl font-bold text-stone-900 mb-1">
                        {displayName}
                      </h2>
                      {!isFolder && ((item as FolderItem).post?.date || (item as PostMetadata).date) && (
                        <p className="text-stone-400 text-xs mb-2">
                          {formatDate((item as FolderItem).post?.date || (item as PostMetadata).date)}
                        </p>
                      )}
                      {(excerpt || isFolder) && (
                        <p className="text-stone-600 text-sm line-clamp-2">
                          {excerpt || '点击查看内容'}
                        </p>
                      )}
                    </motion.article>
                  );
                })}
              </motion.div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <motion.div
                  key="post"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {currentPost && (
                    <article>
                      <div className="markdown-body">
                      <Markdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          h2: ({ children, ...props }) => {
                            const id = React.Children.toArray(children).join('').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
                            return <h2 id={id} {...props}>{children}</h2>;
                          },
                          h3: ({ children, ...props }) => {
                            const id = React.Children.toArray(children).join('').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
                            return <h3 id={id} {...props}>{children}</h3>;
                          },
                          code: ({ className, children }) => {
                            const isBlock = className?.includes('language-');
                            if (isBlock) {
                              const codeText = React.Children.toArray(children).join('');
                              const codeKey = `code-${codeText.length}-${Date.now()}`;
                              const lang = className?.replace('language-', '') || 'text';
                              const language = lang as 'javascript' | 'typescript' | 'python' | 'bash' | 'json' | 'html' | 'css' | 'text';
                              const lines = codeText.split('\n');
                              const lineCount = lines.length;
                              
                              return (
                                <div key={codeKey} className="my-6 relative">
                                  {/* Header */}
                                  <div className="flex items-center justify-between bg-stone-800 px-4 py-2.5 border border-stone-700 rounded-t-lg">
                                    <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">{lang}</span>
                                    <button
                                      onClick={() => copyToClipboard(codeText, codeKey)}
                                      className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors"
                                    >
                                      {copiedKey === codeKey ? (
                                        <>
                                          <Check className="w-4 h-4" />
                                          <span>已复制</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-4 h-4" />
                                          <span>复制</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  {/* Code with line numbers */}
                                  <div className="bg-stone-900 rounded-b-lg border border-t-0 border-stone-700 overflow-hidden">
                                    <div className="flex">
                                      {/* Line numbers */}
                                      <div className="select-none bg-stone-800 px-4 py-4 text-stone-500 text-sm font-mono text-right border-r border-stone-700 shrink-0">
                                        {Array.from({ length: lineCount }, (_, i) => (
                                          <div key={i} className="leading-6">{i + 1}</div>
                                        ))}
                                      </div>
                                      {/* Code */}
                                      <div className="overflow-x-auto">
                                        <SyntaxHighlighter
                                          language={language}
                                          style={oneDark}
                                          showLineNumbers={false}
                                          wrapLines={true}
                                          customStyle={{
                                            margin: 0,
                                            backgroundColor: 'transparent',
                                            padding: '16px',
                                            fontSize: '14px',
                                            lineHeight: '1.6',
                                          }}
                                        >
                                          {codeText}
                                        </SyntaxHighlighter>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return <code className="bg-stone-100 px-1.5 py-0.5 rounded text-sm font-mono text-stone-700">{children}</code>;
                          },
                        }}
                      >
                        {currentPost.content}
                      </Markdown>
                    </div>
                  </article>
                )}
              </motion.div>
              </div>
            )}
          </AnimatePresence>
      </main>
    </div>
  );
}