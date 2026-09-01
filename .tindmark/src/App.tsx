/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import PublicFileList from './PublicFileList';
import HomeView from './HomeView';
import { getAllPosts, getPostBySlug, Post, PostMetadata, FolderItem, buildFolderTree, resolvePostUrl } from './utils/markdown';
import { loadThemeColors, loadCustomThemes, applyCustomAccentColor, applyCustomTheme, ThemeColorMap, DEFAULT_THEME_COLOR_KEY, DEFAULT_CUSTOM_THEME_KEY } from './utils/themeColor';
import { loadSiteConfig, SiteConfig } from './utils/config';
import Markdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Search, Folder, FileText, Copy, Check, Monitor, Moon, Sun, Menu, X, FolderOpen, Hash, Settings } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './utils/cn';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const getBasePath = () => {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const appUrl = (path = '/') => {
  const basePath = getBasePath();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}` || '/';
};

const currentPath = () => {
  const pathname = window.location.pathname;
  const basePath = getBasePath();
  if (basePath && pathname.startsWith(basePath)) {
    return pathname.slice(basePath.length) || '/';
  }
  return pathname || '/';
};

export default function App() {
  const [isPublicPath, setIsPublicPath] = useState(false);
  const [posts, setPosts] = useState<PostMetadata[]>([]);
  const [folderTree, setFolderTree] = useState<FolderItem[]>([]);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'home' | 'list' | 'post'>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [toc, setToc] = useState<TocItem[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [theme, setTheme] = useState<'system' | 'dark' | 'light'>('system');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customColors, setCustomColors] = useState<ThemeColorMap>({});
  const [activeColorKey, setActiveColorKey] = useState<string>(DEFAULT_THEME_COLOR_KEY);
  const [customHexInput, setCustomHexInput] = useState<string>('');
  const [customThemesList, setCustomThemesList] = useState<Record<string, string>>({});
  const [activeThemeStyleKey, setActiveThemeStyleKey] = useState<string>(DEFAULT_CUSTOM_THEME_KEY);
  const [config, setConfig] = useState<SiteConfig>(() => loadSiteConfig());

  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const siteConfig = loadSiteConfig();
    setConfig(siteConfig);
    const loadedColors = loadThemeColors();
    setCustomColors(loadedColors);

    const loadedThemes = loadCustomThemes();
    setCustomThemesList(loadedThemes);

    // 先准备颜色相关信息（但暂不立即应用），以便在应用主题后强制覆盖任何主题样式
    const configuredDefaultKey = siteConfig.DefaultColor?.trim() || DEFAULT_THEME_COLOR_KEY;
    const savedColorKey = localStorage.getItem('theme-accent-key');
    const activeKey = savedColorKey || configuredDefaultKey;
    const savedCustomHex = localStorage.getItem('theme-custom-hex') || '';

    if (savedCustomHex) {
      setCustomHexInput(savedCustomHex);
    }
    setActiveColorKey(activeKey);

    const savedThemeStyle = localStorage.getItem('theme-custom-style-key');
    const configuredDefaultTheme = siteConfig.DefaultTheme?.trim() || DEFAULT_CUSTOM_THEME_KEY;
    const initialThemeStyle = (savedThemeStyle && savedThemeStyle.trim()) ? savedThemeStyle : configuredDefaultTheme;
    setActiveThemeStyleKey(initialThemeStyle);
    if (initialThemeStyle && initialThemeStyle !== DEFAULT_CUSTOM_THEME_KEY && loadedThemes[initialThemeStyle]) {
      applyCustomTheme(initialThemeStyle);
    } else {
      applyCustomTheme(null);
    }

    // 主题应用后，重新应用 accent 色，确保 DefaultColor 覆盖主题可能的样式
    if (activeKey === 'custom' && savedCustomHex) {
      applyCustomAccentColor(savedCustomHex);
    } else if (activeKey && activeKey !== DEFAULT_THEME_COLOR_KEY && loadedColors[activeKey]) {
      applyCustomAccentColor(loadedColors[activeKey]);
    } else {
      applyCustomAccentColor(null);
    }
  }, []);

  const handleCustomThemeChange = (themeName: string) => {
    setActiveThemeStyleKey(themeName);
    localStorage.setItem('theme-custom-style-key', themeName);
    applyCustomTheme(themeName);
  };

  const handleColorChange = (key: string, hex: string | null) => {
    setActiveColorKey(key);
    localStorage.setItem('theme-accent-key', key);
    if (hex) {
      localStorage.setItem('theme-accent-color', hex);
      applyCustomAccentColor(hex);
    } else {
      localStorage.removeItem('theme-accent-color');
      applyCustomAccentColor(null);
    }
  };

  const handleCustomHexSubmit = (inputVal?: string) => {
    const rawVal = inputVal !== undefined ? inputVal : customHexInput;
    let hex = rawVal.trim();
    if (!hex) return;
    if (!hex.startsWith('#')) {
      hex = `#${hex}`;
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(hex) || /^#[0-9A-Fa-f]{3}$/.test(hex)) {
      setCustomHexInput(hex);
      localStorage.setItem('theme-custom-hex', hex);
      handleColorChange('custom', hex);
    }
  };

  const publicRoutePath = `/${(config.PublicFolder || 'public').replace(/^\/+|\/+$/g, '')}`;
  const isPublicRoute = (path: string) => {
    const normalized = path.replace(/\/+$/, '') || '/';
    return normalized === publicRoutePath || normalized.startsWith(`${publicRoutePath}/`) || normalized === '/public' || normalized.startsWith('/public/');
  };

  const docsRoutePath = `/${(config.DocsFolder || 'Docs').replace(/^\/+|\/+$/g, '')}`;
  const isDocsListRoute = (path: string) => {
    const normalized = path.replace(/\/+$/, '') || '/';
    return normalized.toLowerCase() === docsRoutePath.toLowerCase() || normalized.toLowerCase() === '/docs';
  };

  useEffect(() => {
    const handlePopState = async () => {
      const path = currentPath();
      if (isPublicRoute(path)) {
        setIsPublicPath(true);
        return;
      }
      setIsPublicPath(false);

      if (path === '/' || path === '') {
        setView('home');
        setCurrentPost(null);
        setCurrentFolder(null);
        setToc([]);
        document.title = config.Title || 'TindMark';
        if (mainContentRef.current) {
          mainContentRef.current.scrollTo(0, 0);
        }
        return;
      }

      if (isDocsListRoute(path)) {
        setView('list');
        setCurrentPost(null);
        setToc([]);
        document.title = `${config.DocsFolder || 'Docs'} // ${config.Title || 'TindMark'}`;
        if (mainContentRef.current) {
          mainContentRef.current.scrollTo(0, 0);
        }
        return;
      }

      const docsFolderName = (config.DocsFolder || 'Docs').replace(/^\/+|\/+$/g, '');
      const docsRegex = new RegExp(`^(${docsFolderName}|Docs)\\/`, 'i');
      const rawSlug = path.replace(/^\/+/, '').replace(docsRegex, '').replace(/\/+$/, '');
      if (rawSlug) {
        const post = await getPostBySlug(rawSlug);
        if (post) {
          setCurrentPost(post);
          setToc(extractToc(post.content));
          setView('post');
          setCurrentFolder(null);
          document.title = `${post.title} // ${config.Title || 'TindMark'}`;
          if (mainContentRef.current) {
            mainContentRef.current.scrollTo(0, 0);
          }
          return;
        } else {
          // Slug was provided but post not found, redirect to root
          if (window.location.pathname !== appUrl('/')) {
            window.history.replaceState(null, '', appUrl('/'));
          }
        }
      }

      setView('home');
      setCurrentPost(null);
      setToc([]);
      document.title = config.Title || 'TindMark';
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [config.Title, config.DocsFolder]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && (sidebarOpen || settingsOpen)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, settingsOpen]);

  const toggleFolderExpand = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
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

  useEffect(() => {
    async function loadPosts() {
      const path = currentPath();

      // Always load posts so returning from /public shows the list
      const allPosts = await getAllPosts();
      setPosts(allPosts);
      const tree = await buildFolderTree(allPosts);
      setFolderTree(tree);
      // Expand top level folders by default
      const defaultExpanded: Record<string, boolean> = {};
      tree.forEach(item => {
        if (item.type === 'folder') {
          defaultExpanded[item.path] = true;
        }
      });
      setExpandedFolders(defaultExpanded);

      if (isPublicRoute(path)) {
        setIsPublicPath(true);
        setLoading(false);
        return;
      }

      if (path === '/' || path === '') {
        setView('home');
        setCurrentPost(null);
        setCurrentFolder(null);
        setToc([]);
        document.title = config.Title || 'TindMark';
        setLoading(false);
        return;
      }

      if (isDocsListRoute(path)) {
        setView('list');
        setCurrentPost(null);
        setToc([]);
        document.title = `${config.DocsFolder || 'Docs'} // ${config.Title || 'TindMark'}`;
        setLoading(false);
        return;
      }

      const docsFolderName = (config.DocsFolder || 'Docs').replace(/^\/+|\/+$/g, '');
      const docsRegex = new RegExp(`^(${docsFolderName}|Docs)\\/`, 'i');
      const rawSlug = path.replace(/^\/+/, '').replace(docsRegex, '').replace(/\/+$/, '');
      if (rawSlug) {
        const post = await getPostBySlug(rawSlug);
        if (post) {
          setCurrentPost(post);
          setToc(extractToc(post.content));
          setView('post');
          document.title = `${post.title} // ${config.Title || 'TindMark'}`;
        } else {
          // Slug was provided but post not found, redirect to root
          if (window.location.pathname !== appUrl('/')) {
            window.history.replaceState(null, '', appUrl('/'));
          }
        }
      }

      setLoading(false);
    }
    loadPosts();
  }, [config.Title, config.DocsFolder]);

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
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  };

  const scrollToTop = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handlePostClick = async (slug: string, updateUrl = true) => {
    setLoading(true);
    const post = await getPostBySlug(slug);
    setCurrentPost(post);
    if (post) {
      setToc(extractToc(post.content));
      document.title = `${post.title} // ${config.Title || 'TindMark'}`;
      if (updateUrl) {
        const targetPath = appUrl('/' + post.slug);
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ slug: post.slug }, '', targetPath);
        }
      }
    }
    setCurrentFolder(null);
    setView('post');
    setLoading(false);
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  };

  const handleHomeClick = (updateUrl: boolean = true) => {
    setView('home');
    setCurrentPost(null);
    setCurrentFolder(null);
    setToc([]);
    document.title = config.Title || 'TindMark';
    if (updateUrl && window.location.pathname !== appUrl('/')) {
      window.history.pushState(null, '', appUrl('/'));
    }
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  };

  const handleDocsListClick = (updateUrl: boolean = true) => {
    setView('list');
    setCurrentPost(null);
    setCurrentFolder(null);
    setToc([]);
    document.title = `${config.DocsFolder || 'Docs'} // ${config.Title || 'TindMark'}`;
    const targetPath = appUrl(docsRoutePath);
    if (updateUrl && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  };

  const handleBack = (updateUrl: boolean = true) => {
    handleDocsListClick(updateUrl);
  };

  const handleBackClick = () => {
    handleDocsListClick(true);
  };

  const handleResetToList = () => {
    handleDocsListClick(true);
  };

  const handlePublicClick = () => {
    const targetPath = appUrl(publicRoutePath);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    setSidebarOpen(false);
    setSettingsOpen(false);
    document.body.style.overflow = '';
    setIsPublicPath(true);
  };

  const handleFolderClick = (folder: FolderItem) => {
    setCurrentFolder(folder);
    setView('list');
    setCurrentPost(null);
    setToc([]);
    document.title = `${folder.title || folder.name} // ${config.Title || 'TindMark'}`;
    const targetPath = appUrl(docsRoutePath);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
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

  const countFolderItems = (folder: FolderItem): number => {
    if (!folder || !folder.children) return 0;
    let count = 0;
    for (const child of folder.children) {
      if (child.type === 'file') count += 1;
      else if (child.type === 'folder') count += countFolderItems(child);
    }
    return count;
  };

  const renderFolderTree = (items: FolderItem[], level: number = 0) => {
    return items.map((item) => {
      if (item.type === 'folder') {
        const displayName = item.title || item.name;
        const isCurrentFolder = currentFolder?.path === item.path;
        const isExpanded = expandedFolders[item.path] ?? true;
        const itemCount = countFolderItems(item);

        return (
          <div key={item.path} className="my-0.5">
            <div
              onClick={() => handleFolderClick(item)}
              className={cn(
                "w-full text-left px-2.5 py-1.5 text-xs font-mono cursor-pointer transition-colors duration-150 flex items-center justify-between group border-l-2",
                isCurrentFolder
                  ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold"
                  : "border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              )}
              style={{ paddingLeft: `${8 + level * 10}px` }}
            >
              <div className="flex items-center gap-2 truncate">
                <button
                  onClick={(e) => toggleFolderExpand(item.path, e)}
                  className="p-0.5 hover:opacity-75 focus:outline-none flex items-center justify-center"
                >
                  <span className={cn(
                    "material-symbols-outlined text-[16px] transition-transform duration-150 shrink-0",
                    isExpanded && "rotate-90"
                  )}>
                    chevron_right
                  </span>
                </button>
                <Folder className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{displayName}</span>
              </div>
              <span className={cn(
                "text-[10px] px-1 font-mono shrink-0 ml-1",
                isCurrentFolder ? "opacity-75" : "text-neutral-400 dark:text-neutral-600"
              )}>
                [{itemCount}]
              </span>
            </div>
            {isExpanded && item.children && (
              <div key={`children-${item.path}`} className="border-l border-neutral-200 dark:border-neutral-800 ml-3.5 my-0.5">
                {renderFolderTree(item.children, level + 1)}
              </div>
            )}
          </div>
        );
      } else {
        const displayName = item.title || item.post?.title || item.name;
        const isCurrentPost = currentPost?.slug === item.post!.slug;

        return (
          <div
            key={item.path}
            onClick={() => handlePostClick(item.post!.slug)}
            className={cn(
              "w-full text-left px-2.5 py-1.5 text-xs font-mono cursor-pointer transition-colors duration-150 flex items-center gap-2 border-l-2",
              isCurrentPost
                ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold"
                : "border-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white"
            )}
            style={{ paddingLeft: `${8 + level * 10}px` }}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{displayName}</span>
          </div>
        );
      }
    });
  };

  if (isPublicPath) {
    return <PublicFileList onBack={() => {
      setIsPublicPath(false);
      document.body.style.overflow = '';
      handleBack(true);
    }} />;
  }

  if (loading && posts.length === 0) {
    return (
      <div className="h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-black dark:border-white animate-spin"></div>
          <span>LOADING // TindMark</span>
        </div>
      </div>
    );
  }

  const filteredPosts = posts.filter(post => {
    if (!searchQuery && !searchTerm) return true;
    const query = (searchQuery || searchTerm).toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(query))
    );
  });

  return (
    <div className="h-screen md:h-screen bg-white dark:bg-black text-black dark:text-white flex overflow-hidden app-container selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
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
              placeholder="SEARCH_Docs..."
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
        ) : view === 'post' ? (
          <>
            <div className="mobile-header-left">
              <button
                onClick={() => { handleBack(); closeSidebar(); }}
                className="mobile-back-btn"
                title="返回"
                aria-label="返回"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </button>
            </div>
            <span className="mobile-header-title font-mono text-xs font-bold uppercase truncate max-w-[160px]">
              {currentPost?.title || 'DOCUMENT'}
            </span>
            <button
              onClick={toggleSidebar}
              className="mobile-menu-btn font-mono text-xs"
              title="目录"
            >
              <Menu className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={toggleSidebar}
              className="mobile-menu-btn"
              title="菜单"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span 
              onClick={() => handleHomeClick(true)}
              className="mobile-header-title font-mono text-sm font-bold uppercase tracking-wider cursor-pointer"
            >
              {config.Title || 'TindMark'}
            </span>
            <button
              onClick={() => setSearchOpen(true)}
              className="mobile-search-btn"
              title="搜索"
            >
              <Search className="w-4 h-4" />
            </button>
          </>
        )}
      </header>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      />

      {/* Settings Panel */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setSettingsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-md bg-white dark:bg-neutral-950 text-black dark:text-white border border-neutral-200 dark:border-neutral-800 shadow-none">
                {/* Settings Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider">
                    <Settings className="w-4 h-4" />
                    <span>设置</span>
                  </div>
                  <button
                    onClick={() => setSettingsOpen(false)}
                    className="p-1.5 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors"
                    title="关闭"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Settings Body */}
                <div className="p-5">
                  {/* Theme Section */}
                  <div className="mb-5">
                    <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-2.5">
                      // 主题模式
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { key: 'system' as const, label: '系统', icon: <Monitor className="w-4 h-4" /> },
                        { key: 'light' as const, label: '浅色', icon: <Sun className="w-4 h-4" /> },
                        { key: 'dark' as const, label: '深色', icon: <Moon className="w-4 h-4" /> },
                      ]).map((option) => (
                        <button
                          key={option.key}
                          onClick={() => {
                            setTheme(option.key);
                            localStorage.setItem('blog-theme', option.key);
                            applyTheme(option.key);
                          }}
                          className={cn(
                            "flex flex-col items-center gap-1.5 px-3 py-3 border font-mono text-xs transition-colors",
                            theme === option.key
                              ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                              : "border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-neutral-700 dark:text-neutral-300"
                          )}
                        >
                          {option.icon}
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Theme Style Section (ThemeFolder CSS) */}
                  {Object.keys(customThemesList).length > 0 && (
                    <div className="mb-5">
                      <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-2.5">
                        <span>// 自定义主题样式</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => handleCustomThemeChange(DEFAULT_CUSTOM_THEME_KEY)}
                          className={cn(
                            "flex items-center justify-center gap-1.5 px-3 py-2 border font-mono text-xs transition-colors truncate",
                            activeThemeStyleKey === DEFAULT_CUSTOM_THEME_KEY
                              ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold"
                              : "border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-neutral-700 dark:text-neutral-300"
                          )}
                        >
                          <span>TindMark</span>
                        </button>
                        {Object.keys(customThemesList).map((themeName) => (
                          <button
                            key={themeName}
                            onClick={() => handleCustomThemeChange(themeName)}
                            className={cn(
                              "flex items-center justify-center gap-1.5 px-3 py-2 border font-mono text-xs transition-colors truncate",
                              activeThemeStyleKey === themeName
                                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold"
                                : "border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-neutral-700 dark:text-neutral-300"
                            )}
                            title={themeName}
                          >
                            <span className="truncate">{themeName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Accent Color Section (Dynamic from color.yaml & Custom Input) */}
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-2.5">
                      <span>// 主题色</span>
                    </div>

                    {/* Custom HEX Input */}
                    <div className="mb-3 flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={customHexInput}
                          onChange={(e) => setCustomHexInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCustomHexSubmit();
                            }
                          }}
                          placeholder="#1e348a 自定义 HEX"
                          className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white placeholder-neutral-400"
                        />
                        {customHexInput && (/^#?[0-9A-Fa-f]{6}$/.test(customHexInput.trim()) || /^#?[0-9A-Fa-f]{3}$/.test(customHexInput.trim())) && (
                          <span
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border border-black/20 dark:border-white/20"
                            style={{ backgroundColor: customHexInput.startsWith('#') ? customHexInput : `#${customHexInput}` }}
                          />
                        )}
                      </div>
                      <button
                        onClick={() => handleCustomHexSubmit()}
                        className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white font-mono text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                      >
                        应用
                      </button>
                    </div>

                    {Object.keys(customColors).length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                        <button
                          onClick={() => handleColorChange(DEFAULT_THEME_COLOR_KEY, null)}
                          className={cn(
                            "flex items-center gap-2 px-2.5 py-2 border font-mono text-xs transition-colors text-left truncate",
                            activeColorKey === DEFAULT_THEME_COLOR_KEY
                              ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 font-bold"
                              : "border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white"
                          )}
                        >
                          <span className="w-3 h-3 rounded-none border border-neutral-400 dark:border-neutral-600 shrink-0 theme-swatch-default" />
                          <span className="truncate theme-text-default">默认</span>
                        </button>
                        {Object.entries(customColors).map(([label, hex]) => (
                          <button
                            key={label}
                            onClick={() => handleColorChange(label, hex)}
                            className={cn(
                              "flex items-center gap-2 px-2.5 py-2 border font-mono text-xs transition-colors text-left truncate",
                              activeColorKey === label
                                ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 font-bold"
                                : "border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white"
                            )}
                            title={`${label} (${hex})`}
                          >
                            <span
                              className="w-3 h-3 rounded-none border border-black/20 dark:border-white/20 shrink-0"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="truncate" style={{ color: hex }}>{label}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => handleColorChange(DEFAULT_THEME_COLOR_KEY, null)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 border font-mono text-xs transition-colors",
                            activeColorKey === DEFAULT_THEME_COLOR_KEY
                              ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 font-bold"
                              : "border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white"
                          )}
                        >
                          <span className="w-3 h-3 rounded-none border border-neutral-400 dark:border-neutral-600 shrink-0 theme-swatch-default" />
                          <span className="theme-text-default">重置为默认黑白</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Powered By Section */}
                  <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span>// 关于</span>
                    <a
                      href="https://github.com/TheOninesixY/TindMark"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-black dark:hover:text-white underline underline-offset-2 transition-colors"
                    >
                      由 TindMark (Beta) 驱动
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "w-72 bg-white dark:bg-black border-r border-neutral-200 dark:border-neutral-800 flex flex-col shrink-0 md:block",
        sidebarOpen && "open",
        view === 'post' ? "right" : "left"
      )}>
        {/* Sidebar Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
          {view === 'post' ? (
            <button
              onClick={handleBackClick}
              className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-black dark:text-white hover:opacity-60 transition-opacity"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>返回文档列表</span>
            </button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div 
                onClick={() => handleHomeClick(true)} 
                className="cursor-pointer font-mono font-black text-sm tracking-wider uppercase text-black dark:text-white flex items-center gap-1.5 truncate"
                title="返回首页"
              >
                <span className="truncate">{config.Title || 'TindMark'}</span>
              </div>
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
            </div>
          )}
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
                    placeholder="SEARCH_Docs..."
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
          {view === 'home' || view === 'list' ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-neutral-100 dark:border-neutral-900">
                <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold">
                  // 导航目录
                </span>
                {currentFolder && (
                  <button
                    onClick={handleResetToList}
                    className="font-mono text-[10px] uppercase text-neutral-500 hover:text-black dark:hover:text-white underline"
                  >
                    全部
                  </button>
                )}
              </div>
              <div
                onClick={() => handleHomeClick(true)}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 text-xs font-mono cursor-pointer transition-colors duration-150 flex items-center justify-between border-l-2 mb-1",
                  view === 'home'
                    ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold"
                    : "border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] shrink-0">home</span>
                  <span>首页</span>
                </div>
              </div>
              <div
                onClick={handleResetToList}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 text-xs font-mono cursor-pointer transition-colors duration-150 flex items-center justify-between border-l-2 mb-1",
                  view === 'list' && currentFolder === null
                    ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold"
                    : "border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                )}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>全部文档</span>
                </div>
                <span className={cn(
                  "text-[10px] font-mono",
                  view === 'list' && currentFolder === null ? "opacity-75" : "text-neutral-400 dark:text-neutral-600"
                )}>
                  [{posts.length}]
                </span>
              </div>
              {renderFolderTree(folderTree)}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-1 mb-2 border-b border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold">
                  // 本文大纲
                </span>
                <span className="font-mono text-[10px] text-neutral-400">
                  {toc.length} 节
                </span>
              </div>
              {toc.length === 0 ? (
                <div className="px-2 py-4 text-xs font-mono text-neutral-400 italic">
                  无标题目录
                </div>
              ) : (
                toc.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToHeading(item.id)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 text-xs font-mono text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors flex items-center gap-1.5 border-l-2 border-transparent hover:border-black dark:hover:border-white",
                      item.level === 3 && "pl-5 text-[11px]"
                    )}
                  >
                    <Hash className="w-3 h-3 opacity-40 shrink-0" />
                    <span className="truncate">{item.text}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sidebar Bottom (desktop only) */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex gap-2 desktop-sidebar-actions">
          <button
            onClick={handlePublicClick}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            title="资源区"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>公共文件</span>
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            title="设置"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>设置</span>
          </button>
        </div>
      </aside>

      {/* Mobile floating action buttons */}
      <div className={`mobile-floating-actions ${sidebarOpen && (view === 'list' || view === 'home') ? 'show' : ''}`}>
        <button onClick={handlePublicClick} title="公共文件" aria-label="公共文件" className="rounded-full">
          <FolderOpen className="w-4 h-4" />
        </button>
        <button onClick={() => { setSettingsOpen(true); closeSidebar(); }} title="设置" aria-label="设置" className="rounded-full">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <main
        ref={mainContentRef}
        className="flex-1 overflow-y-auto p-6 md:p-10 bg-white dark:bg-black"
      >
        <AnimatePresence mode="wait">
          {searchOpen || searchQuery ? (
            <motion.div
              key="search-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="max-w-6xl mx-auto"
            >
              <div className="mb-6 pb-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <h2 className="font-mono text-sm uppercase tracking-wider font-bold text-black dark:text-white">
                    // 搜索结果
                  </h2>
                  <p className="font-mono text-xs text-neutral-500 mt-0.5">
                    关键词: "{searchQuery}" — 找到 {filteredPosts.length} 篇文档
                  </p>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="font-mono text-xs border border-neutral-300 dark:border-neutral-700 px-2 py-1 hover:border-black dark:hover:border-white"
                  >
                    [ 清空 ]
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPosts.map((post) => (
                  <article
                    key={post.slug}
                    className="border border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-white p-5 cursor-pointer transition-colors duration-150 bg-white dark:bg-neutral-950 flex flex-col justify-between group"
                    onClick={() => {
                      handlePostClick(post.slug);
                      setSearchOpen(false);
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] text-neutral-500 uppercase">
                          {formatDate(post.date) || 'DOC'}
                        </span>
                        <span className="font-mono text-[10px] text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors flex items-center gap-0.5">
                          <span>// READ</span>
                          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-black dark:text-white mb-2 leading-snug">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-neutral-600 dark:text-neutral-400 text-xs line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              {filteredPosts.length === 0 && (
                <div className="border border-dashed border-neutral-300 dark:border-neutral-800 p-12 text-center font-mono text-xs text-neutral-400 uppercase tracking-widest">
                  未找到与 "{searchQuery}" 相关的文档
                </div>
              )}
            </motion.div>
          ) : view === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <HomeView
                config={config}
                posts={posts}
                onNavigateDocs={() => handleDocsListClick(true)}
                onNavigatePost={(slug) => handlePostClick(slug, true)}
                onNavigatePublic={handlePublicClick}
                onOpenSettings={() => setSettingsOpen(true)}
              />
            </motion.div>
          ) : view === 'list' ? (
            <motion.div
              key={currentFolder ? `folder-${currentFolder.path}` : 'list'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="max-w-6xl mx-auto"
            >
              {/* Header Info */}
              <div className="mb-6 pb-3 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 mb-1">
                    <span>ROOT</span>
                    {currentFolder && (
                      <>
                        <span>/</span>
                        <span className="text-black dark:text-white font-bold uppercase">{currentFolder.title || currentFolder.name}</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-black dark:text-white">
                    {currentFolder ? (currentFolder.title || currentFolder.name) : '全部文档'}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  {currentFolder && (
                    <button
                      onClick={() => setCurrentFolder(null)}
                      className="font-mono text-xs border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 hover:border-black dark:hover:border-white transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                      <span>返回根目录</span>
                    </button>
                  )}
                  <span className="font-mono text-xs text-neutral-400 border border-neutral-200 dark:border-neutral-800 px-2.5 py-1">
                    COUNT: {(currentFolder ? getFolderContents() : posts).length}
                  </span>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(currentFolder ? getFolderContents() : posts).map((item) => {
                  const isFolder = (item as FolderItem).type === 'folder';
                  const displayName = (item as FolderItem).title || (item as FolderItem).post?.title || (item as PostMetadata).title || (item as FolderItem).name;
                  const excerpt = isFolder ? '' : ((item as FolderItem).post?.excerpt || (item as PostMetadata).excerpt || '');
                  const date = !isFolder ? ((item as FolderItem).post?.date || (item as PostMetadata).date) : '';
                  const targetSlug = isFolder ? '' : ((item as FolderItem).post?.slug || (item as PostMetadata).slug);
                  
                  return (
                    <article
                      key={isFolder ? (item as FolderItem).path : (item as PostMetadata).slug}
                      className={cn(
                        "border border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-white p-5 cursor-pointer transition-colors duration-150 flex flex-col justify-between group",
                        isFolder ? "bg-neutral-50 dark:bg-neutral-900/50" : "bg-white dark:bg-neutral-950"
                      )}
                      onClick={() => isFolder ? handleFolderClick(item as FolderItem) : handlePostClick(targetSlug)}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[10px] tracking-wider uppercase px-1.5 py-0.5 border border-neutral-200 dark:border-neutral-800 text-neutral-500">
                            {isFolder ? 'FOLDER // 文件夹' : (formatDate(date) || 'DOC // 文档')}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-black dark:text-white mb-2 leading-snug group-hover:underline underline-offset-4">
                          {displayName}
                        </h3>
                        {(excerpt || isFolder) && (
                          <p className="text-neutral-600 dark:text-neutral-400 text-xs line-clamp-2 leading-relaxed">
                            {excerpt || '点击展开分类内容'}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between font-mono text-[10px] text-neutral-400">
                        <span>{isFolder ? `[ ${countFolderItems(item as FolderItem)} ITEMS ]` : `[ ${targetSlug} ]`}</span>
                        <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <motion.div
                key="post"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {currentPost && (
                  <article>
                    {/* Post Top Bar */}
                    <div className="mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-end">
                      <div className="flex items-center gap-2 font-mono text-xs text-neutral-500">
                        {currentPost.date && (
                          <span className="border border-neutral-200 dark:border-neutral-800 px-2 py-1">
                            {formatDate(currentPost.date)}
                          </span>
                        )}
                        <span className="border border-neutral-200 dark:border-neutral-800 px-2 py-1 uppercase truncate max-w-[150px]">
                          {currentPost.slug}
                        </span>
                      </div>
                    </div>

                    {/* Markdown Body */}
                    <div className="markdown-body">
                      <Markdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        urlTransform={(url) => defaultUrlTransform(resolvePostUrl(url, currentPost.path))}
                        components={{
                          h1: ({ children, node, ...props }: any) => {
                            const text = React.Children.toArray(children).map(c => typeof c === 'string' ? c : '').join('');
                            const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
                            return (
                              <h1 id={id} className="group flex items-center gap-2" {...props}>
                                <span className="markdown-heading-accent">{children}</span>
                                <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-black dark:hover:text-white font-mono text-base no-underline ml-1">
                                  #
                                </a>
                              </h1>
                            );
                          },
                          h2: ({ children, node, ...props }: any) => {
                            const text = React.Children.toArray(children).map(c => typeof c === 'string' ? c : '').join('');
                            const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
                            return (
                              <h2 id={id} className="group flex items-center gap-2" {...props}>
                                <span className="markdown-heading-accent">{children}</span>
                                <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-black dark:hover:text-white font-mono text-sm no-underline ml-1">
                                  #
                                </a>
                              </h2>
                            );
                          },
                          h3: ({ children, node, ...props }: any) => {
                            const text = React.Children.toArray(children).map(c => typeof c === 'string' ? c : '').join('');
                            const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
                            return (
                              <h3 id={id} className="group flex items-center gap-2" {...props}>
                                <span className="markdown-heading-accent">{children}</span>
                                <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-black dark:hover:text-white font-mono text-xs no-underline ml-1">
                                  #
                                </a>
                              </h3>
                            );
                          },
                          h4: ({ children, node, ...props }: any) => (
                            <h4 {...props}><span className="markdown-heading-accent">{children}</span></h4>
                          ),
                          h5: ({ children, node, ...props }: any) => (
                            <h5 {...props}><span className="markdown-heading-accent">{children}</span></h5>
                          ),
                          h6: ({ children, node, ...props }: any) => (
                            <h6 {...props}><span className="markdown-heading-accent">{children}</span></h6>
                          ),
                          code: ({ className, children, node, ...props }: any) => {
                            const isBlock = className?.includes('language-');
                            if (isBlock) {
                              const codeText = Array.isArray(children)
                                ? children.join('')
                                : typeof children === 'string'
                                ? children
                                : React.Children.toArray(children).join('');
                              const codeKey = `code-${codeText.length}`;
                              const lang = className?.replace('language-', '') || 'text';
                              const lines = codeText.split('\n');
                              const lineCount = lines.length;
                              
                              return (
                                <div key={codeKey} className="my-6 border border-neutral-800 bg-neutral-950 font-mono">
                                  {/* Code Header */}
                                  <div className="flex items-center justify-between bg-neutral-900 px-3 py-2 border-b border-neutral-800">
                                    <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider font-bold">
                                      // {lang}
                                    </span>
                                    <button
                                      onClick={() => copyToClipboard(codeText, codeKey)}
                                      className="flex items-center gap-1 text-[11px] font-mono border border-neutral-700 hover:border-white hover:bg-white hover:text-black px-2 py-0.5 text-neutral-300 transition-colors"
                                    >
                                      {copiedKey === codeKey ? (
                                        <>
                                          <Check className="w-3 h-3 text-white" />
                                          <span>COPIED</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span>COPY</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  {/* Code Content */}
                                  <div className="flex overflow-x-auto">
                                    {/* Line numbers */}
                                    <div className="select-none bg-neutral-900/70 px-3 py-3 text-neutral-600 text-xs font-mono text-right border-r border-neutral-800 shrink-0">
                                      {Array.from({ length: lineCount }, (_, i) => (
                                        <div key={i} className="leading-6">{i + 1}</div>
                                      ))}
                                    </div>
                                    {/* Highlighted text */}
                                    <div className="overflow-x-auto flex-1">
                                      <SyntaxHighlighter
                                        language={lang}
                                        style={oneDark as any}
                                        showLineNumbers={false}
                                        wrapLines={true}
                                        customStyle={{
                                          margin: 0,
                                          backgroundColor: 'transparent',
                                          padding: '12px 16px',
                                          fontSize: '13px',
                                          lineHeight: '1.6',
                                          fontFamily: 'var(--font-mono)',
                                        }}
                                      >
                                        {codeText}
                                      </SyntaxHighlighter>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return <code className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 px-1.5 py-0.5 text-xs font-mono" {...props}>{children}</code>;
                          },
                        }}
                      >
                        {currentPost.content}
                      </Markdown>
                    </div>

                    {/* Post Bottom Footer */}
                    <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between font-mono text-xs">
                      <button
                        onClick={handleBackClick}
                        className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 hover:border-black dark:hover:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                        <span>返回文档列表</span>
                      </button>
                      <button
                        onClick={scrollToTop}
                        className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 hover:border-black dark:hover:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                        <span>回到顶部</span>
                      </button>
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
