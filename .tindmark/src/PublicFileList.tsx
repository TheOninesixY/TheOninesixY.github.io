import React, { useState, useEffect, useMemo } from 'react';
import { File, Video, Image, Download, Folder, ExternalLink, Search, X } from 'lucide-react';
import { cn } from './utils/cn';
import { motion, AnimatePresence } from 'motion/react';

interface PublicFile {
  name: string;
  path: string;
  size: number;
  type: 'file' | 'folder';
  extension: string;
}

interface PublicFileListProps {
  onBack?: () => void;
}

export default function PublicFileList({ onBack }: PublicFileListProps = {}) {
  const [files, setFiles] = useState<PublicFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'system' | 'dark' | 'light'>('system');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const q = searchQuery.toLowerCase();
    return files.filter(f => f.name.toLowerCase().includes(q));
  }, [files, searchQuery]);

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

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: PublicFile) => {
    if (file.type === 'folder') {
      return <Folder className="w-5 h-5 text-black dark:text-white shrink-0" />;
    }
    
    const ext = file.extension.toLowerCase();
    if (ext.includes('video') || ext.includes('mp4') || ext.includes('webm') || ext.includes('mov')) {
      return <Video className="w-5 h-5 text-black dark:text-white shrink-0" />;
    }
    if (ext.includes('image') || ext.includes('jpg') || ext.includes('jpeg') || ext.includes('png') || ext.includes('svg') || ext.includes('gif')) {
      return <Image className="w-5 h-5 text-black dark:text-white shrink-0" />;
    }
    return <File className="w-5 h-5 text-black dark:text-white shrink-0" />;
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL.endsWith('/')
          ? import.meta.env.BASE_URL
          : `${import.meta.env.BASE_URL}/`;
        
        let response: Response | null = null;
        // 优先请求 API 路由（开发/本地环境支持 base 路径），失败则回退到静态 public-files.json
        try {
          response = await fetch(`${baseUrl}api/public-files`);
        } catch {}

        if (!response || !response.ok) {
          try {
            response = await fetch('/api/public-files');
          } catch {}
        }

        if (!response || !response.ok) {
          response = await fetch(`${baseUrl}public-files.json`);
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch public files: ${response.status}`);
        }
        const data = await response.json();
        const rawFiles = Array.isArray(data) ? data : data?.files || [];
        
        const publicFiles: PublicFile[] = rawFiles.map((file: { name: string; type: string; size: number }) => {
          const ext = file.name?.split('.').pop() || '';
          return {
            name: file.name,
            path: `${baseUrl}${file.name}`,
            size: file.size || 0,
            type: 'file' as const,
            extension: ext,
          };
        });
        
        setFiles(publicFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFiles();
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = import.meta.env.BASE_URL;
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-black dark:border-white animate-spin"></div>
          <span>LOADING // TindMark</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen md:h-screen bg-white dark:bg-black text-black dark:text-white flex overflow-hidden app-container public-app selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Mobile Header */}
      <header className={cn(
        "mobile-header md:hidden",
        searchOpen && "search-mode"
      )}>
        {searchOpen ? (
          <>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH_Files..."
              className="mobile-search-input"
              autoFocus
            />
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
              className="mobile-search-close"
              title="关闭搜索"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <div className="mobile-header-left">
              <button onClick={handleBack} className="mobile-back-btn" title="返回" aria-label="返回">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </button>
            </div>
            <span className="mobile-header-title font-mono text-xs font-bold uppercase tracking-wider">
              PUBLIC FILES // 公共文件
            </span>
            <button onClick={() => setSearchOpen(true)} className="mobile-search-btn" title="搜索" aria-label="搜索">
              <Search className="w-4 h-4" />
            </button>
          </>
        )}
      </header>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
<aside className={cn(
        "w-72 bg-white dark:bg-black border-r border-neutral-200 dark:border-neutral-800 flex flex-col shrink-0 hidden md:flex public-sidebar",
        sidebarOpen && "open",
        "left"
      )}>
        {/* Sidebar Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-black dark:text-white hover:opacity-60 transition-opacity"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>返回文档首页</span>
          </button>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={cn(
              "p-1.5 border transition-colors",
              searchOpen
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                : "border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white"
            )}
            title="搜索"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </header>

        {/* Search Bar in Sidebar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="hidden md:block overflow-hidden border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
            >
              <div className="p-3">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH_Files..."
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white placeholder-neutral-400"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 text-neutral-400 hover:text-black dark:hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="px-2 py-1 mb-2 border-b border-neutral-100 dark:border-neutral-900 font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold flex items-center justify-between">
            <span>// 全部文件</span>
            <span className="text-neutral-400 dark:text-neutral-600">[{filteredFiles.length}]</span>
          </div>
          
          <div className="space-y-0.5">
            <button
              onClick={() => setSelectedFile(null)}
              className={cn(
                "w-full text-left px-2.5 py-1.5 text-xs font-mono transition-colors duration-150 flex items-center gap-2 border-l-2",
                selectedFile === null
                  ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold"
                  : "border-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white"
              )}
            >
              <Folder className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">全部文件列表</span>
            </button>

            {filteredFiles.map((file) => {
              const isSelected = selectedFile === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => {
                    setSelectedFile(file.name);
                    window.open(file.path, '_blank', 'noopener,noreferrer');
                  }}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 text-xs font-mono transition-colors duration-150 flex items-center justify-between gap-2 border-l-2 group",
                    isSelected
                      ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold"
                      : "border-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white"
                  )}
                  title={`查看预览: ${file.name}`}
                >
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <File className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] shrink-0 font-mono",
                    isSelected ? "opacity-75" : "text-neutral-400 dark:text-neutral-600"
                  )}>
                    {formatFileSize(file.size)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-white dark:bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="max-w-4xl mx-auto"
        >
          {/* Page Title */}
          <div className="mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-mono text-xs text-neutral-400 mb-1">
                PUBLIC REPOSITORY // PUBLIC
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
                公共文件资源
              </h1>
            </div>
            <div className="font-mono text-xs text-neutral-400 border border-neutral-200 dark:border-neutral-800 px-3 py-1 self-start sm:self-auto">
              TOTAL FILES: {files.length}
            </div>
          </div>

          {/* Files List */}
          <div className="space-y-3">
            {filteredFiles.length === 0 ? (
              <div className="border border-dashed border-neutral-300 dark:border-neutral-800 p-16 text-center">
                <Folder className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                  {files.length === 0 ? '暂无公开文件' : '未找到匹配文件'}
                </p>
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div
                  key={file.name}
                  id={`file-${file.name}`}
                  className={cn(
                    "border p-4 transition-colors duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group",
                    selectedFile === file.name
                      ? "border-black dark:border-white bg-neutral-50 dark:bg-neutral-900"
                      : "border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-white bg-white dark:bg-neutral-950"
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2 border border-neutral-200 dark:border-neutral-800 group-hover:border-black dark:group-hover:border-white transition-colors">
                      {getFileIcon(file)}
                    </div>
                    
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-black dark:text-white truncate group-hover:underline underline-offset-4">
                        {file.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 font-mono text-[11px] text-neutral-500">
                        <span>SIZE: {formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span className="uppercase">TYPE: .{file.extension || 'FILE'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs self-end sm:self-auto shrink-0">
                    <a
                      href={file.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black px-3 py-1.5 transition-colors flex items-center gap-1.5"
                      title="在浏览器中打开"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>查看</span>
                    </a>
                    <a
                      href={file.path}
                      download={file.name}
                      className="border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black px-3 py-1.5 transition-colors flex items-center gap-1.5"
                      title="下载文件"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下载</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Hint */}
          <div className="mt-8 p-4 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 font-mono text-xs text-neutral-500">
            <span className="font-bold text-black dark:text-white">// 提示：</span>
            点击“查看”将在新标签页中打开文件，点击“下载”可保存至本地。
          </div>
        </motion.div>
      </main>
    </div>
  );
}
