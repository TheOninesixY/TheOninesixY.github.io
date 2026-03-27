import React, { useEffect, useState } from 'react';
import { getAllPosts, getPostBySlug, Post, PostMetadata, FolderItem, buildFolderTree } from './utils/markdown';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ChevronLeft, ChevronRight, Settings, Trash2, Folder, FileText, Menu, X, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './utils/cn';
import CustomCursor from './components/CustomCursor.tsx';

export default function BlogApp() {
  const [posts, setPosts] = useState<PostMetadata[]>([]);
  const [folderTree, setFolderTree] = useState<FolderItem[]>([]);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'post' | 'settings'>('list');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showCustomCursor, setShowCustomCursor] = useState(() => {
    const saved = localStorage.getItem('blog-custom-cursor');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const mainContentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadPosts() {
      const allPosts = await getAllPosts();
      setPosts(allPosts);
      setFolderTree(await buildFolderTree(allPosts));
      setLoading(false);
    }
    loadPosts();
  }, []);

  // Sync custom cursor with HTML classes and localStorage
  useEffect(() => {
    localStorage.setItem('blog-custom-cursor', JSON.stringify(showCustomCursor));
    if (showCustomCursor) {
      document.documentElement.classList.add('custom-cursor-active');
    } else {
      document.documentElement.classList.remove('custom-cursor-active');
    }
  }, [showCustomCursor]);

  const handleClearData = () => {
    localStorage.clear();
    setShowCustomCursor(true);
    alert('所有本地数据已清除');
  };

  const handlePostClick = async (slug: string) => {
    setLoading(true);
    const post = await getPostBySlug(slug);
    setCurrentPost(post);
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

  const getBreadcrumbs = (): { name: string; path: string | null; isFolder: boolean }[] => {
    const breadcrumbs = [{ name: '首页', path: null, isFolder: false }];
    
    if (!currentFolder) return breadcrumbs;
    
    const pathParts = currentFolder.path.split('/');
    let currentPath = '';
    
    for (const part of pathParts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      const findFolder = (items: FolderItem[]): FolderItem | null => {
        for (const item of items) {
          if (item.type === 'folder' && item.path === currentPath) {
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
      if (folder) {
        breadcrumbs.push({
          name: folder.title || folder.name,
          path: folder.path,
          isFolder: true
        });
      }
    }
    
    return breadcrumbs;
  };



  const handleFolderClick = (folder: FolderItem) => {
    setCurrentFolder(folder);
    setView('list');
    setCurrentPost(null);
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  };

  const renderFolderTree = (items: FolderItem[], level: number = 0) => {
    return items.map((item) => {
      if (item.type === 'folder') {
        const displayName = item.title || item.name;
        return (
          <div key={item.path} className="mt-1">
            <button
              onClick={() => handleFolderClick(item)}
              className={cn(
                "w-full text-left px-4 py-2 text-lg transition-all duration-200 rounded-lg flex items-center gap-2",
                currentFolder?.path === item.path 
                  ? "text-blue-600 font-medium bg-white/50" 
                  : "text-stone-800 hover:bg-white/30"
              )}
              style={{ paddingLeft: `${16}px` }}
            >
              <Folder className="w-4 h-4 shrink-0" />
              <span className="truncate">{displayName}</span>
            </button>
            {item.children && (
              <div className="overflow-hidden">
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
              "w-full text-left px-4 py-2 text-lg transition-all duration-200 rounded-lg flex items-center gap-2",
              currentPost?.slug === item.post!.slug 
                ? "text-blue-600 font-medium bg-white/50" 
                : "text-stone-800 hover:bg-white/30"
            )}
            style={{ paddingLeft: `${16}px` }}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">{displayName}</span>
          </button>
        );
      }
    });
  };

  if (loading && posts.length === 0) {
    return (
      <div className="h-screen bg-[#fdfcfb] flex items-center justify-center">
        <div className="animate-pulse text-stone-400 italic">正在加载故事...</div>
      </div>
    );
  }

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
    window.innerWidth < 768
  );

  return (
    <div className="h-screen bg-[#F5F5F5] text-stone-900 font-sans selection:bg-blue-100 transition-colors duration-300 flex flex-col overflow-hidden">
      {showCustomCursor && !isMobile && <CustomCursor />}
      
      {/* Header */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-20 h-16 flex items-center px-6 shrink-0">
        <div className="flex items-center w-full">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden p-2 hover:bg-stone-100 rounded-full transition-colors shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>
          <button 
            onClick={() => window.location.reload()}
            className={cn(
              "text-xl font-medium tracking-tight hover:text-blue-600 transition-colors shrink-0 w-[232px] text-left",
              isMobile && (view === 'post' || view === 'settings') && "hidden"
            )}
          >
            OninesixY的小站
          </button>
          
          <AnimatePresence mode="wait">
            {(view === 'post' || view === 'settings') && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={cn(
                  "flex items-center gap-4",
                  isMobile ? "ml-4" : "ml-8"
                )}
              >
                <button 
                  onClick={handleBack}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className={cn(
                  "text-xl font-medium truncate",
                  isMobile ? "max-w-[40vw]" : "max-w-[50vw]"
                )}>
                  {view === 'settings' ? '设置' : currentPost?.title}
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        animate={{ 
          width: isSidebarCollapsed ? 64 : 256
        }}
        className={cn(
          "bg-[#EAEAEA] border-r border-stone-200 flex flex-col shrink-0 overflow-hidden z-40",
          "fixed top-0 left-0 md:relative h-full transition-transform duration-300",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
          <div className="md:hidden flex items-center justify-between mb-4">
            <span className="font-medium text-stone-700">导航</span>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {!isSidebarCollapsed && (
            <nav className="space-y-1">
              {renderFolderTree(folderTree)}
            </nav>
          )}
        </div>
        
        {/* Sidebar Bottom Icons */}
        <div className={cn(
          "p-4 border-t border-stone-300 flex items-center justify-between bg-[#EAEAEA] shrink-0",
          isSidebarCollapsed && "flex-col gap-4"
        )}>
          <button 
            onClick={() => {
              setView('settings');
              setIsMobileSidebarOpen(false);
            }}
            className={cn(
              "p-2 rounded-lg hover:bg-white/50 transition-colors",
              view === 'settings' && "text-blue-600 bg-white/50"
            )}
            title="设置"
          >
            <Settings className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:block p-2 rounded-lg hover:bg-white/50 transition-colors"
            title={isSidebarCollapsed ? "展开" : "收起"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-6 h-6" />
            ) : (
              <ChevronLeft className="w-6 h-6" />
            )}
          </button>
        </div>
      </motion.aside>

        {/* Main Content */}
        <main 
          ref={mainContentRef}
          className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth"
        >
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {view === 'list' ? (
                <motion.div
                  key={currentFolder ? `folder-${currentFolder.path}` : 'list'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {currentFolder && (
                    <div className="mb-8 flex items-center gap-2 text-sm">
                      {getBreadcrumbs().map((crumb, index) => (
                        <React.Fragment key={index}>
                          <button
                            onClick={() => crumb.path ? handleFolderClick({ path: crumb.path, name: crumb.name, type: 'folder', children: [] }) : setCurrentFolder(null)}
                            className="text-blue-600 hover:underline"
                          >
                            {crumb.name}
                          </button>
                          {index < getBreadcrumbs().length - 1 && (
                            <span className="text-stone-400">/</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                  
                  {/* Search Box */}
                  <div className="mb-8">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="搜索文档..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-3 pl-10 bg-white border border-stone-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {currentFolder ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {getFolderContents().filter(item => {
                        if (!searchTerm) return true;
                        const searchLower = searchTerm.toLowerCase();
                        const title = (item.title || item.post?.title || item.name || '').toLowerCase();
                        const excerpt = item.type === 'file' ? (item.post?.excerpt || '').toLowerCase() : '';
                        return title.includes(searchLower) || excerpt.includes(searchLower);
                      }).map((item) => (
                        <motion.article 
                          key={item.path} 
                          whileHover={{ 
                            scale: 1.01,
                            boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)"
                          }}
                          className="bg-white border border-blue-100 rounded-xl p-8 cursor-pointer transition-all duration-300 group relative overflow-hidden shadow-sm hover:border-blue-100"
                          onClick={() => item.type === 'folder' ? handleFolderClick(item) : handlePostClick(item.post!.slug)}
                        >
                          <div className="flex items-baseline gap-3 mb-4">
                            <div className="flex items-center gap-2">
                              {item.type === 'folder' ? (
                                <Folder className="w-5 h-5 text-stone-600" />
                              ) : (
                                <FileText className="w-5 h-5 text-blue-600" />
                              )}
                              <h3 className="text-2xl font-bold text-stone-900 group-hover:text-blue-600 transition-colors">
                                {item.title || item.post?.title || item.name}
                              </h3>
                            </div>
                            {item.type === 'file' && item.post?.date && (
                              <span className="text-xs font-medium text-stone-400 shrink-0">{item.post.date}</span>
                            )}
                          </div>
                          {item.type === 'file' && item.post?.excerpt && (
                            <p className="text-stone-600 leading-relaxed line-clamp-4 text-sm">
                              {item.post.excerpt}
                            </p>
                          )}
                        </motion.article>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {posts.filter(post => {
                        if (!searchTerm) return true;
                        const searchLower = searchTerm.toLowerCase();
                        return post.title.toLowerCase().includes(searchLower) || 
                               post.excerpt.toLowerCase().includes(searchLower);
                      }).map((post) => (
                        <motion.article 
                          key={post.slug} 
                          whileHover={{ 
                            scale: 1.01,
                            boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)"
                          }}
                          className="bg-white border border-blue-100 rounded-xl p-8 cursor-pointer transition-all duration-300 group relative overflow-hidden shadow-sm hover:border-blue-100"
                          onClick={() => handlePostClick(post.slug)}
                        >
                          <div className="flex items-baseline gap-3 mb-4">
                            <h3 className="text-2xl font-bold text-stone-900 group-hover:text-blue-600 transition-colors">
                              {post.title}
                            </h3>
                            <span className="text-xs font-medium text-stone-400 shrink-0">{post.date}</span>
                          </div>
                          <p className="text-stone-600 leading-relaxed line-clamp-4 text-sm">
                            {post.excerpt}
                          </p>
                        </motion.article>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : view === 'post' ? (
                <motion.div
                  key="post"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="min-h-full"
                >
                  {currentPost && (
                    <article className="prose prose-stone prose-blue max-w-none">
                      <header className="mb-12">
                        <div className="flex items-baseline gap-4 mb-6">
                          <h1 className="text-4xl md:text-5xl font-bold leading-tight m-0">
                            {currentPost.title}
                          </h1>
                          <span className="text-sm font-medium text-stone-400">{currentPost.date}</span>
                        </div>
                      </header>

                      <div className="markdown-body">
                        <Markdown remarkPlugins={[remarkGfm]}>
                          {currentPost.content}
                        </Markdown>
                      </div>
                    </article>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-sm border border-stone-200"
                >
                  <h2 className="text-3xl font-bold mb-8">设置</h2>
                  
                  <div className="space-y-6">
                    {!isMobile && (
                      <div className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <MousePointer2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">圆点指针</p>
                            <p className="text-xs text-stone-400">开启自定义反色鼠标效果</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setShowCustomCursor(!showCustomCursor)}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            showCustomCursor ? "bg-blue-600" : "bg-stone-200"
                          )}
                        >
                          <motion.div 
                            animate={{ x: showCustomCursor ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </button>
                      </div>
                    )}

                    <div className="pt-8 border-t border-stone-100">
                      <button 
                        onClick={handleClearData}
                        className="w-full flex items-center justify-center gap-2 p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-medium border border-transparent hover:border-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                        清除所有本地数据
                      </button>
                      <p className="text-center text-[10px] text-stone-400 mt-2">
                        这将重置您的偏好设置并清除本地存储
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}