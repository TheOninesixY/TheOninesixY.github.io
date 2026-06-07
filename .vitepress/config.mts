import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "OninesixY的小站",
  description: "所以这个网站有什么用？",
  base: '/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '文档', link: '/docs/index.md' }
    ],

    sidebar: [
      {
        text: '导航',
        items: [
          { text: '首页', link: '/docs' },
          { text: '文档', link: '/docs/index.md' }
        ]
      },
      {
        text: '教程',
        items: [
          { text: '为设备刷入Recovery', link: '/docs/help/FlashRecovery/index.md' },
          { text: '为设备Root', link: '/docs/help/Root/index.md' }
        ]
      },
      {
        text: '工具',
        items: [
          { text: 'autoRe 自动刷新', link: '/docs/tool/autoRe/index.md' },
          { text: 'ByeCNBing 再见！中国必应', link: '/docs/tool/ByeCNBing/index.md' },
          { text: 'CFAD CloudflareAutoToDash', link: '/docs/tool/CFAD/index.md' }
        ]
      },
      {
        text: '以及',
        items: [
          { text: '神奇数字马戏团第9集解析', link: '/docs/and/TADC9解析/index.md'}
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/TheOninesixY/TheOninesixY.github.io' }
    ]
  }
})