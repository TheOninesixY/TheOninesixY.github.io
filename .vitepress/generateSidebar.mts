import { readdirSync, statSync, existsSync, watch } from 'fs'
import { join, relative, extname, basename } from 'path'

// https://vitepress.dev/reference/site-config

interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
}

interface Article {
  name: string
  path: string
}

interface Category {
  name: string
  path: string
  articles: Article[]
}

/**
 * 判断文件是否为无扩展名文件
 */
function isExtensionlessFile(filename: string, dirPath: string): boolean {
  if (extname(filename) !== '' || filename === 'index.md') return false
  const filePath = join(dirPath, filename)
  return existsSync(filePath) && statSync(filePath).isFile()
}

/**
 * 判断路径是否为文件夹
 */
function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

/**
 * 获取文件夹中符合条件的子文件夹（包含index.md）
 */
function getArticleFolders(dirPath: string): string[] {
  try {
    return readdirSync(dirPath)
      .filter(item => {
        const itemPath = join(dirPath, item)
        return isDirectory(itemPath) && item !== 'public' && existsSync(join(itemPath, 'index.md'))
      })
  } catch {
    return []
  }
}

function isIgnoredDirectory(name: string): boolean {
  return name === 'public'
}

/**
 * 获取分类名称（无扩展名文件名）
 */
function getCategoryName(dirPath: string): string | null {
  try {
    const files = readdirSync(dirPath)
    const extensionlessFile = files.find(f => isExtensionlessFile(f, dirPath))
    return extensionlessFile || null
  } catch {
    return null
  }
}

function getMarkdownFiles(dirPath: string): string[] {
  try {
    return readdirSync(dirPath)
      .filter(item => {
        const itemPath = join(dirPath, item)
        return existsSync(itemPath) && statSync(itemPath).isFile() && extname(item) === '.md'
      })
  } catch {
    return []
  }
}

function hasIndexMarkdown(dirPath: string): boolean {
  const indexPath = join(dirPath, 'index.md')
  return existsSync(indexPath) && statSync(indexPath).isFile()
}

/**
 * 扫描srcDir生成侧边栏结构
 */
export function generateSidebar(srcDir: string): SidebarItem[] {
  const sidebar: SidebarItem[] = []

  if (!existsSync(srcDir)) {
    console.warn(`Warning: srcDir "${srcDir}" does not exist`)
    return sidebar
  }

  // 获取srcDir下的一级内容
  let entries: string[]
  try {
    entries = readdirSync(srcDir)
  } catch {
    return sidebar
  }

  const directories = entries.filter(entry => {
    const entryPath = join(srcDir, entry)
    return !isIgnoredDirectory(entry) && isDirectory(entryPath)
  })
  const hasDirectories = directories.length > 0
  const files = entries.filter(entry => {
    const entryPath = join(srcDir, entry)
    return existsSync(entryPath) && statSync(entryPath).isFile()
  })
  const extensionlessFiles = files.filter(file => isExtensionlessFile(file, srcDir))
  const mdFiles = files.filter(file => extname(file) === '.md' && file !== 'index.md' && file.toLowerCase() !== 'docs.md')
  const otherFiles = files.filter(file => !isExtensionlessFile(file, srcDir) && extname(file) !== '.md')

  // 无分类模式：srcDir 中没有子目录，且只有一个无扩展名分类名称文件和若干 md 文件
  if (!hasDirectories && extensionlessFiles.length === 1 && mdFiles.length > 0 && otherFiles.length === 0) {
    const categoryName = extensionlessFiles[0]
    const categoryItem: SidebarItem = {
      text: categoryName,
      items: mdFiles.map(file => ({
        text: basename(file, '.md'),
        link: `/${relative(srcDir, join(srcDir, file)).replace(/\\/g, '/')}`
      }))
    }

    sidebar.push(categoryItem)
    return sidebar
  }

  // 无分类文件夹模式：srcDir 中只有文档文件夹，每个文件夹下直接包含 index.md
  const directArticleFolders = directories.filter(dir => hasIndexMarkdown(join(srcDir, dir)))
  if (directories.length > 0 && directArticleFolders.length === directories.length) {
    for (const articleFolder of directArticleFolders) {
      const articlePath = join(srcDir, articleFolder)
      const relativePath = relative(srcDir, join(articlePath, 'index.md')).replace(/\\/g, '/')

      sidebar.push({
        text: basename(articleFolder),
        link: `/${relativePath}`
      })
    }

    return sidebar
  }

  // 遍历一级目录，识别分类
  for (const entry of entries) {
    const entryPath = join(srcDir, entry)

    // 忽略 public 目录，并且只处理目录
    if (isIgnoredDirectory(entry) || !isDirectory(entryPath)) continue

    const subItems = readdirSync(entryPath)
    const hasExtensionlessFile = subItems.some(item => isExtensionlessFile(item, entryPath))
    const hasSubfolders = subItems.some(item => {
      const itemPath = join(entryPath, item)
      return isDirectory(itemPath) && item !== 'index.md' && !isIgnoredDirectory(item)
    })

    // 分类条件：包含无扩展名文件 AND 至少一个子文件夹
    if (hasExtensionlessFile && hasSubfolders) {
      const categoryName = getCategoryName(entryPath) || entry
      const articleFolders = getArticleFolders(entryPath)

      const categoryItem: SidebarItem = {
        text: categoryName,
        items: []
      }

      for (const articleFolder of articleFolders) {
        const articlePath = join(entryPath, articleFolder)
        const articleName = basename(articleFolder)
        const mdPath = join(articlePath, 'index.md')
        const relativePath = relative(srcDir, mdPath).replace(/\\/g, '/')

        categoryItem.items!.push({
          text: articleName,
          link: `/${relativePath}`
        })
      }

      // 按现有顺序排列，保持一致性
      if (categoryItem.items!.length > 0) {
        sidebar.push(categoryItem)
      }
    }
  }

  return sidebar
}

/**
 * VitePress 插件：监控 Docs 目录变化并触发重新加载
 */
export function watchDocsPlugin() {
  return {
    name: 'vitepress-plugin-watch-docs',
    enforce: 'pre' as const,
    configureServer(server: any) {
      const docsPath = join(process.cwd(), 'Docs')
      
      if (!existsSync(docsPath)) {
        console.warn('[watch-docs] Docs directory not found')
        return
      }

      console.log('[watch-docs] Watching for changes in Docs directory...')
      
      const watcher = watch(docsPath, { recursive: true }, (eventType, filename) => {
        if (filename) {
          console.log(`[watch-docs] ${eventType}: ${filename}`)
          // 触发 VitePress 重新构建侧边栏
          server.ws.send({
            type: 'full-reload'
          })
        }
      })

      watcher.on('error', (err) => {
        console.error('[watch-docs] Watcher error:', err)
      })

      // 服务器关闭时清理 watcher
      server.httpServer?.on('close', () => {
        watcher.close()
      })
    }
  }
}
