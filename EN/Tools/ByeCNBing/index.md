# ![icon](../../../Tools/ByeCNBing/icon.svg) ByeCNBing - Force Bing International Version

## Sometimes even with a VPN, accessing Bing redirects to the Chinese version. This script perfectly solves this problem

## Working Principle

The working principle of this script is very simple. When you visit Bing, it checks if the current URL is the Chinese version. If it is, it will redirect you to the international version of Bing.

## Anti-Stuck Mechanism

A new feature has been added in version 2.0: the anti-stuck mechanism. If you return to the Chinese version within one second after redirecting to the international version, it will give up redirection to prevent getting stuck in a loop causing lag

## Download and Installation

### [✅Install Script](../../../Tools/ByeCNBing/script.user.js)

Note: You need to install a browser script manager to use this script

### 🐱[Download ScriptCat](https://docs.scriptcat.org)

Most recommended

### [🐒Download Violentmonkey](https://violentmonkey.github.io/)

Best compatibility

### [🟥Download Tampermonkey](https://www.tampermonkey.net/)

Most stable

## 源码

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
