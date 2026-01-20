// ==UserScript==
// @name         autoRe Beta
// @namespace    https://theoninesixy.github.io/Tools/autoRe
// @author       OninesixY
// @version      0.1
// @updateURL    https://theoninesixy.github.io/Tools/autoRe/script.user.js
// @downloadURL  https://theoninesixy.github.io/Tools/autoRe/script.user.js
// @description  自动刷新网页
// @icon         https://theoninesixy.github.io/Tools/autoRe/icon.svg
// @match        *://*/*
// @grant        none
// @license      MIT

// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    setInterval(function() {
        location.reload();
    }, 60000); // 60000 milliseconds = 1 minute
})();