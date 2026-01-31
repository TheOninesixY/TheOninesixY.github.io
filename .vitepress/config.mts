import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "OninesixY的小站",
  description: "一个非常网站的网站",
  cleanUrls: true,
  head:[
    // 网站图标
    ['link', { rel: 'icon', href: 'favicon.ico' }]
  ],
  themeConfig: {
    // 本地搜索
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },
    // 标题图标
    logo: 'favicon.ico',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '文档', link: '/docs'},
      { text: '关于', link: 'README' },
    ],

    sidebar: [
      {
        text: '导航',
        items: [
          { text: '首页', link :'/' },
          { text: 'GitHub', link :'https://github.com/TheOninesixY/TheOninesixY.github.io' },

        ],
      },
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
      { icon: 'github', link: 'https://github.com/TheOninesixY/TheOninesixY.github.io' }
    ]
  }
})
