import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "OninesixY的小站",
  description: "一个非常网站的网站",
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '文档', link: '/docs'},
      { text: '关于', link: '/about' },
      { text: '旧版站', link: 'https://theoninesixy.github.io'},
    ],

    sidebar: [
      {
        text: '工具',
        items: [
          { text: 'autoRe', link: '/docs/tools/autoRe' },
          { text: 'ByeCNBing', link: '/docs/tools/ByeCNBing' },
          { text: 'CFAD', link: '/docs/tools/CFAD' },
          { text: 'QingTab', link: 'https://html.oninesixy.pages.dev/QingTab'}
        ]
      },
      {
        text: '帮助',
        items: [
          { text: '更换安卓设备的Recovery', link: 'docs/help/FlashRecovery'},
          { text: '获取安卓设备的Root权限', link: 'docs/help/Root'},
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/TheOninesixY/WebSite' }
    ]
  }
})
