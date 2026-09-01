import React, { useState } from 'react';
import { SiteConfig } from './utils/config';
import { PostMetadata } from './utils/markdown';
import { FileText, FolderOpen, ArrowRight, Sparkles, BookOpen, Layers, Terminal } from 'lucide-react';
import { cn } from './utils/cn';

interface HomeViewProps {
  config: SiteConfig;
  posts: PostMetadata[];
  onNavigateDocs: () => void;
  onNavigatePost: (slug: string) => void;
  onNavigatePublic: () => void;
  onOpenSettings: () => void;
}

export default function HomeView({
  config,
  posts,
  onNavigateDocs,
  onNavigatePost,
  onNavigatePublic,
  onOpenSettings,
}: HomeViewProps) {
  const docsFolderName = (config.DocsFolder || 'Docs').replace(/^\/+|\/+$/g, '');
  const recentPosts = posts.slice(0, 6);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  };

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-16 px-4 sm:px-6">
      {/* Hero Section */}
      <section className="mb-14 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 font-mono text-xs border border-neutral-300 dark:border-neutral-800 mb-6 uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>INDEX // HOME</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-black dark:text-white mb-4 leading-none">
          {config.Title || 'TindMark'}
        </h1>

        {config.Subtitle && (
          <p className="text-xl sm:text-2xl font-mono text-neutral-600 dark:text-neutral-400 mb-4">
            {config.Subtitle}
          </p>
        )}

        {config.Description && (
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed mb-8">
            {config.Description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <button
            onClick={onNavigateDocs}
            className="flex items-center gap-2 px-5 py-3 bg-black text-white dark:bg-white dark:text-black font-bold hover:opacity-85 transition-opacity"
          >
            <BookOpen className="w-4 h-4" />
            <span>浏览文档列表</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onNavigatePublic}
            className="flex items-center gap-2 px-5 py-3 border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            <span>公共资源区</span>
          </button>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14 sm:mb-20 font-mono">
        <div 
          onClick={onNavigateDocs}
          className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50 dark:bg-neutral-950 hover:border-black dark:hover:border-white transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase tracking-wider">// 文档总数</span>
            <Layers className="w-4 h-4 group-hover:text-black dark:group-hover:text-white transition-colors" />
          </div>
          <div className="text-3xl font-black text-black dark:text-white">
            {posts.length}
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            位于 /{docsFolderName} 目录下
          </p>
        </div>

        <div 
          onClick={onNavigatePublic}
          className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50 dark:bg-neutral-950 hover:border-black dark:hover:border-white transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase tracking-wider">// 公共文件</span>
            <FolderOpen className="w-4 h-4 group-hover:text-black dark:group-hover:text-white transition-colors" />
          </div>
          <div className="text-3xl font-black text-black dark:text-white">
            FILES
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            快捷访问静态分发文件
          </p>
        </div>

        <div 
          onClick={onOpenSettings}
          className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50 dark:bg-neutral-950 hover:border-black dark:hover:border-white transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase tracking-wider">// 个性化主题</span>
            <Sparkles className="w-4 h-4 group-hover:text-black dark:group-hover:text-white transition-colors" />
          </div>
          <div className="text-3xl font-black text-black dark:text-white">
            THEME
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            自定义配色与深浅外观
          </p>
        </div>
      </section>

      {/* Recent Posts Section */}
      {recentPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-6">
            <h2 className="font-mono text-sm uppercase tracking-wider font-bold text-black dark:text-white">
              // 最新发布
            </h2>
            <button
              onClick={onNavigateDocs}
              className="font-mono text-xs text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1 underline underline-offset-4"
            >
              <span>查看全部文档</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPosts.map((post) => (
              <article
                key={post.slug}
                onClick={() => onNavigatePost(post.slug)}
                className="border border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-white p-5 cursor-pointer transition-colors duration-150 bg-white dark:bg-neutral-950 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] text-neutral-500 uppercase">
                      {formatDate(post.date) || 'DOC'}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors flex items-center gap-0.5">
                      <span>// READ</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-black dark:text-white mb-2 leading-snug group-hover:underline underline-offset-4">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-neutral-600 dark:text-neutral-400 text-xs line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between font-mono text-[10px] text-neutral-400">
                  <span className="truncate max-w-[180px]">/{post.slug}</span>
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
