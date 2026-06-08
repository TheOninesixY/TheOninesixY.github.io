import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "OninesixY的小站",
  description: "所以这个网站有什么用？",
  head:[
    ['link', { rel: 'icon', href: '/favicon.png' }]
  ],
  base: '/',                          // 链接前缀
  ignoreDeadLinks: true ,             // 禁用死链检查
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    logo: '/favicon.png',

    nav: [
      { text: '首页', link: '/' },
      { text: '文档', link: '/Docs/index.md' }
    ],

    sidebar: [
      {
        text: '导航',
        items: [
          { text: '首页', link: '/index.md' },
          { text: '文档', link: '/Docs/index.md' },
          { text: 'README', link :'/README.md'}
        ]
      },
      {
        text: '教程',
        items: [
          { text: '为设备刷入Recovery', link: '/Docs/Help/FlashRecovery/index.md' },
          { text: '为设备Root', link: '/Docs/Help/Root/index.md' }
        ]
      },
      {
        text: '工具',
        items: [
          { text: 'autoRe 自动刷新', link: '/Docs/Tools/autoRe/index.md' },
          { text: 'ByeCNBing 再见！中国必应', link: '/Docs/Tools/ByeCNBing/index.md' },
          { text: 'CFAD CloudflareAutoToDash', link: '/Docs/Tools/CFAD/index.md' }
        ]
      },
      {
        text: '以及',
        items: [
          { text: '神奇数字马戏团第9集解析', link: '/Docs/More/TADC9解析/index.md'}
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/TheOninesixY/TheOninesixY.github.io' }
    ]
  }
})