# ![icon](file/icon.svg) ByeCNBing

## 必应强制国际版

### 有时即使开着梯子，访问必应也会被重定向到中国版，这个脚本可以完美解决这个问题

### 工作原理

这个脚本的工作原理很简单，当你访问必应时，它会检查当前的 URL 是否是中国版的。如果是，它会将你重定向到国际版的必应。

### 防卡机制

在2.0版本中添加了一项新功能：防卡机制。如果在重定向国际版后的一秒内返回到了中国版则会放弃重定向，防止陷入循环造成卡顿

### 下载与安装

[安装脚本](https://theoninesixy.github.io/Script/ByeCNBing/file/ByeCNBing.user.js)

[下载脚本猫](https://docs.scriptcat.org)

[下载暴力猴](https://violentmonkey.github.io/)

[下载纂改猴](https://www.tampermonkey.net/)

### 源码

~~~JavaScript
// ==UserScript==
// @name         ByeCNBing
// @namespace    https://theoninesixy.github.io/Script/ByeCNBing
// @author       OninesixY
// @version      2.1.1
// @updateURL    https://theoninesixy.github.io/Script/ByeCNBing/file/ByeCNBing.user.js
// @downloadURL  https://theoninesixy.github.io/Script/ByeCNBing/file/ByeCNBing.user.js
// @description  必应强制国际版
// @icon         https://theoninesixy.github.io/Script/ByeCNBing/file/icon.svg
// @match        *://cn.bing.com/*
// @grant        none
// @license      MIT

// ==/UserScript==

(function() {
    'use strict';

    // 获取当前URL
    const currentUrl = window.location.href;
    const redirectKey = 'lastBingRedirectTime';
    const now = Date.now();

    // 检查是否需要重定向
    if (currentUrl.startsWith('https://cn.bing.com') || currentUrl.startsWith('http://cn.bing.com')) {
        // 获取上次重定向时间
        const lastRedirectTime = localStorage.getItem(redirectKey);

        // 检查是否在1秒内返回
        if (lastRedirectTime && (now - parseInt(lastRedirectTime)) < 1000) {
            console.log('1秒内返回中国版，放弃重定向');
            // 清除记录，避免影响下次访问
            localStorage.removeItem(redirectKey);
        } else {
            // 记录重定向时间
            localStorage.setItem(redirectKey, now.toString());
            // 替换域名
            const newUrl = currentUrl.replace('cn.bing.com', 'www.bing.com');
            // 重定向
            window.location.replace(newUrl);
        }
    }
})();

~~~
