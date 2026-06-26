import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  
  title: "OninesixY的小站",
  description: "也许是吧",
  cleanUrls: true ,              // 纯净URL       \\
  // outDir: '.build',          //  Build产物目录  \\
  srcDir: "Docs",              //   文档目录        \\

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '文档列表', link: 'Docs' }
    ],

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/TheOninesixY/TheOninesixY.github.io/edit/main/Docs/:path'
    },

    // logo: '/favicon.png',

    sidebar: [
      {
        text: '导航',
        items: [
          { text: '首页', link: '/index.md' },
          { text: '文档', link: '/Docs/index.md' },
          //{ text: 'README', link :'/README.md'}
        ]
      },
      {
        text: '一些事',
        items: [
          { text: '这分明不是我的错', link: '/Note/这分明不是我的错/index.md' },
          { text: '我其实知道', link: '/Note/我其实知道/index.md'}
        ],
      },
      {
        text: '教程',
        items: [
          { text: '为设备刷入Recovery', link: '/Help/FlashRecovery/index.md' },
          { text: '为设备Root', link: '/Help/Root/index.md' }
        ]
      },
      {
        text: '工具',
        items: [
          { text: 'autoRe 自动刷新', link: '/Tools/autoRe/index.md' },
          { text: 'ByeCNBing 再见！中国必应', link: '/Tools/ByeCNBing/index.md' },
          { text: 'CFAD CloudflareAutoToDash', link: '/Tools/CFAD/index.md' }
        ]
      },
      {
        text: '宝库',
        items: [
          { text: '说明', link: '/Hub/index.md'},
          { text: 'DiskGenius 破解版', link: '/Hub/DiskGenius Pro/index.md'},
          { text: 'DriverBooster Pro破解版', link: '/Hub/DriverBooster Pro/index.md'}
        ],
      },
      {
        text: '以及',
        items: [
          { text: '神奇数字马戏团第9集解析', link: '/More/TADC9解析/index.md'}
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/TheOninesixY/TheOninesixY.github.io' },
      { icon: 'bilibili', link: 'https://space.bilibili.com/1133117111' }
    ]
  }
})
