# Wow，这是什么？这居然是世界上最神秘的README！

## 歪比巴布

这是我用VitePress搭建的世界上最诡异又神秘的网站
<br>

然后，我用的是Yarn包管理器，我之前用的是NPM，但它实在是太慢了，我在本地运行一个`npm run docs:dev`都要几秒，更何况运行`npm install`了，我改用Yarn之后，我就用Yarn的0安装模式，我在电脑上先把`yarn install`运行好再`push`到仓库，这样的话GitHub给免费用户的老头乐服务器就不用运行`yarn install`了，能直接运行`yarn build`，直接把从`push`到网站更新的时间间隔从几分钟弄到了一分钟甚至更短
![666你用的啥浏览器啊，连图片都加载不出来](/ReadmeFiles/image.png)

## 写给我自己的，以防以后想要更新却忘了怎么维护了
### 创建本地测试
```cmd
yarn run docs:dev
```
### 配置Yarn
- 安装 Yarn
  - 用npm安装
    ```cmd
    corepack enable
    ```

- 解决 Windows 下跨盘符链接报错
  - 关闭全局缓存
    ```cmd
    yarn config set enableGlobalCache false
    ```

- 让Yarn认为它是安全的
    ```cmd
    corepack prepare yarn@stable --activate
    ```

- 让VS Code不假报错
  - 安装`typescript`开发依赖
    ```cmd
    yarn add -D typescript
    ```
  - 生成VS Code SDK
    ```cmd
    yarn dlx @yarnpkg/sdks vscode
    ```

---

？ 不是哥们你还真翻到底了啊，真的有人看吗
