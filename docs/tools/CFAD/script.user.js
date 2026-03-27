// ==UserScript==
// @name         CFAD
// @chinesename  自动跳转 Cloudflare 仪表盘
// @namespace    https://theoninesixy.github.io/Tools/CFAD
// @author       OninesixY
// @version      1.0
// @updateURL    https://theoninesixy.github.io/Tools/CFAD/script.user.js
// @downloadURL  https://theoninesixy.github.io/Tools/CFAD/script.user.js
// @description  自动将 Cloudflare 主页重定向到仪表盘页面
// @icon         
// @match        *://www.cloudflare.com/*
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
    if (currentUrl.includes('www.cloudflare.com')) {
        // 获取上次重定向时间
        const lastRedirectTime = localStorage.getItem(redirectKey);

        if (lastRedirectTime) {
            // 清除记录，避免影响下次访问
            localStorage.removeItem(redirectKey);
        } else {
            // 记录重定向时间
            localStorage.setItem(redirectKey, now.toString());
        }

        // 替换域名
        const newUrl = currentUrl.replace('www.cloudflare.com', 'dash.cloudflare.com');
        // 重定向
        window.location.replace(newUrl);
    }
})();
