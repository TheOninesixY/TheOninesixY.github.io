import React, { useState, useEffect } from 'react';
import { ArrowLeft, File, Video, Image, Download, Folder, Monitor, Moon, Sun, ExternalLink } from 'lucide-react';
import { cn } from './utils/cn';
import { motion } from 'motion/react';

interface PublicFile {
  name: string;
  path: string;
  size: number;
  type: 'file' | 'folder';
  extension: string;
}

export default function PublicFileList() {
  const [files, setFiles] = useState<PublicFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'system' | 'dark' | 'light'>('system');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: PublicFile) => {
    if (file.type === 'folder') {
      return <Folder className="w-6 h-6 text-stone-500" />;
    }
    
    const ext = file.extension.toLowerCase();
    if (ext.includes('video') || ext.includes('mp4') || ext.includes('webm') || ext.includes('mov')) {
      return <Video className="w-6 h-6 text-red-500" />;
    }
    if (ext.includes('image') || ext.includes('jpg') || ext.includes('jpeg') || ext.includes('png') || ext.includes('svg') || ext.includes('gif')) {
      return <Image className="w-6 h-6 text-green-500" />;
    }
    return <File className="w-6 h-6 text-stone-400" />;
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        // 开发模式使用 API，生产模式使用静态 JSON
        const isDev = import.meta.env.DEV;
        const url = isDev ? '/api/public-files' : '/public-files.json';
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch public files');
        }
        const config = await response.json();
        
        const publicFiles: PublicFile[] = config.files.map((file: { name: string; type: string; size: number }) => {
          const ext = file.name.split('.').pop() || '';
          return {
            name: file.name,
            path: `/public/${file.name}`,
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
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-stone-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex overflow-hidden app-container">
      {/* Mobile Header */}
      <header className="mobile-header md:hidden">
        <div className="mobile-header-left">
          <button onClick={handleBack} className="mobile-back-btn">
            <ArrowLeft />
          </button>
          <span className="mobile-header-title">公共文件</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mobile-menu-btn">
          <span className="text-stone-500 text-lg">☰</span>
        </button>
      </header>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-stone-50 border-r border-stone-200 flex flex-col shrink-0 md:block",
        sidebarOpen && "open",
        "left"
      )}>
        {/* Sidebar Header */}
        <header className="h-14 flex items-center px-4 border-b border-stone-200">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-stone-700 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">返回首页</span>
          </button>
        </header>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="px-3 py-1 text-xs text-stone-400 font-medium uppercase tracking-wider mb-2">
            导航
          </div>
          <button
            onClick={handleBack}
            className="w-full text-left px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded transition-colors"
          >
            返回首页
          </button>
        </div>

        {/* Sidebar Bottom */}
        <div className="p-3 border-t border-stone-200 flex gap-2">
          <button
            onClick={handleBack}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg",
              "text-stone-600 hover:bg-stone-200 transition-all duration-200",
              "hover:scale-105 active:scale-95"
            )}
            title="返回首页"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回首页</span>
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
      <main className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-stone-900 mb-2">公共文件</h1>
            <p className="text-stone-500">点击文件以下载或查看</p>
          </div>

          <div className="space-y-2">
            {files.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">暂无文件</p>
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-4 p-4 bg-stone-100 rounded-lg hover:bg-stone-150 transition-all duration-200 group"
                >
                  <div className="shrink-0">
                    {getFileIcon(file)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-stone-900 truncate group-hover:text-stone-700 transition-colors">
                      {file.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-stone-500">
                        {formatFileSize(file.size)}
                      </span>
                      <span className="text-xs text-stone-400">
                        {`.${file.extension}`}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <a
                      href={file.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-stone-200 rounded-lg transition-colors"
                      title="在浏览器中打开"
                    >
                      <ExternalLink className="w-5 h-5 text-stone-500" />
                    </a>
                    <a
                      href={file.path}
                      download={file.name}
                      className="p-2 hover:bg-stone-200 rounded-lg transition-colors"
                      title="下载文件"
                    >
                      <Download className="w-5 h-5 text-stone-500" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 p-4 bg-stone-100 rounded-lg">
            <p className="text-sm text-stone-500">
              提示：悬停显示按钮，点击左键在浏览器中打开，点击下载图标保存文件。
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}