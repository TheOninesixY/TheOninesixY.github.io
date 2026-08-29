---
title: "原来得加这个"
date: "2026-08-29"
excerpt: "使用Unity引擎且使用BepInEx模组运行库的游戏须在Steam启动项中加入配置"
---

使用Unity引擎且使用BepInEx模组运行库的游戏须在Steam启动项中加入：
```
WINEDLLOVERRIDES="winhttp=n,b" %command%
```