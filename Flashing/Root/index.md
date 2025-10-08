---
title: 📱 手机Root指南
---

## 目录

- [重要声明](#重要声明请务必阅读)
- [一、准备工作](#一准备工作)
  - [1. 解锁Bootloader](#1-解锁bootloader)
  - [2. 下载必要文件与工具](#2-下载必要文件与工具)
- [二、Root核心操作](#二root核心操作)
  - [方法一：修补启动镜像（boot.img / init_boot.img）](#方法一修补启动镜像bootimg--init_bootimg)
  - [方法二：通过第三方Recovery刷入Magisk](#方法二通过第三方recovery刷入magisk)
- [三、紧急情况与卸载](#三紧急情况与卸载)
  - [刷入后无法开机？](#刷入后无法开机)
  - [如何卸载Magisk？](#如何卸载magisk)

---

## ⚠️ 重要声明（请务必阅读）

Root操作（获取最高系统权限）是一把双刃剑。它能让您完全掌控安卓设备，进行深度定制、卸载预装应用、运行高级工具等，但也伴随巨大风险：

- **失去官方保修：** 多数厂商不为已Root设备提供保修。
- **系统不稳定：** 错误操作可能导致频繁死机、重启，甚至“变砖”。
- **安全风险：** 恶意软件可能更易入侵，窃取隐私信息。
- **无法接收官方系统更新（OTA）：** Root会修改系统分区，影响官方推送的系统更新。

**请完整阅读本教程，理解每一步，并务必备份所有重要数据。因操作不当造成的任何损失，需自行承担！**

---

## 一、准备工作

在Root前，请务必完成以下准备：

### 1. 解锁Bootloader

- **什么是Bootloader？** 安卓系统启动前的引导程序，厂商默认锁定以防止系统被修改。
- **为何要解锁？** 只有解锁后，才能刷入第三方镜像（如修补后的`boot.img`或TWRP Recovery）。
- **如何解锁？** 不同品牌方式不同（如小米需官方工具，OPPO/Realme需深度测试等）。请查阅品牌官方指南或XDA-Developers等社区。  
**注意：** 解锁Bootloader会清除所有数据，请提前备份！

### 2. 下载必要文件与工具

- **Platform-Tools (ADB & Fastboot)：** Google官方命令行工具，用于电脑与手机间高级通信。
  - **官方下载：** [SDK Platform Tools release notes](https://developer.android.com/tools/releases/platform-tools)
  - **使用方法：** 下载对应系统的压缩包，解压到**不含中文或特殊字符**的路径（如 `C:\adb`），后续命令行操作均在此文件夹内进行。
    - **ADB (Android Debug Bridge)：** 用于与安卓设备通信，可以执行各种设备管理命令。
    - **Fastboot：** 用于在设备处于Fastboot模式时进行低级操作，如刷写分区。
- **手机官方固件（ROM）：** 下载与当前系统版本**完全一致**的ROM包，用于提取修补所需的`boot.img`或`init_boot.img`。可在手机官网或可信ROM资源站获取。
- **Magisk App：** 目前主流Root方案，具备“systemless”特性。请从官方GitHub发布页下载最新版Magisk App（`.apk`文件）。

---

## 二、Root核心操作

本教程推荐两种主流Magisk Root方法，**方法一最通用且推荐！**

### 方法一：修补启动镜像（boot.img / init_boot.img）

**Magisk官方推荐，兼容性最佳。**

#### 核心概念

- `boot.img`：包含系统内核和Ramdisk，是安卓启动关键。
- `init_boot.img`：Android 13及以上设备，Ramdisk被移至独立`init_boot`分区。
- **判断标准：** 安装并打开Magisk，主界面会显示“Ramdisk”状态。若需修补`init_boot.img`，会有提示或需根据内核版本判断。一般2022年后新机型多用`init_boot.img`。

#### 操作步骤

1. **提取启动镜像：** 解压官方ROM包，找到`boot.img`或`init_boot.img`。
2. **传输镜像到手机：** 将上述文件复制到手机内部存储（如“下载”文件夹）。
3. **安装Magisk应用：** 在手机安装Magisk `.apk`。
4. **修补镜像文件：**
   - 打开Magisk，点击“安装”
   - 选择“选择并修补一个文件”
   - 选择刚复制的`boot.img`或`init_boot.img`
   - 修补完成后在“下载”文件夹生成`magisk_patched-版本号.img`
5. **传输已修补镜像到电脑：** 将`magisk_patched-....img`复制回电脑`platform-tools`文件夹。
6. **进入Fastboot模式：** 手机关机，同时按“电源键+音量下键”（部分品牌组合键不同）至Fastboot/Bootloader界面。
7. **连接电脑并刷入：**
   - 用USB线连接手机至电脑。
   - 在`platform-tools`文件夹内，地址栏输入`cmd`或`powershell`回车，打开命令行。
   - 输入：
     ```
     fastboot devices
     ```
     若显示序列号，说明连接成功。
   - **根据修补文件类型，执行：**
     - 修补`boot.img`：
       ```
       fastboot flash boot magisk_patched-....img
       ```
     - 修补`init_boot.img`：
       ```
       fastboot flash init_boot magisk_patched-....img
       ```
     *(请将文件名替换为实际生成的文件名)*
8. **重启手机：**
   ```
   fastboot reboot
   ```
9. **完成：** 开机后打开Magisk，若显示当前版本号即Root成功！

> **提示：** 如果您不确定应该使用 `boot.img` 还是 `init_boot.img`，可以打开Magisk应用，在主界面查看“Ramdisk”状态。如果显示“无Ramdisk”，则需要修补 `init_boot.img`。

---

### 方法二：通过第三方Recovery刷入Magisk

如已刷入第三方Recovery（如TWRP），可用此法。

#### 前提条件

- 手机已成功刷入可用第三方Recovery（TWRP/OrangeFox等）。

#### 操作步骤

1. **准备文件：** 下载Magisk `.apk`，重命名为`Magisk.zip`，复制到手机存储或SD卡。
2. **进入Recovery模式：** 重启至TWRP等第三方Recovery（按键组合因机型而异）。
3. **刷入Magisk：**
   - TWRP主界面点击“Install”。
   - 选择`Magisk.zip`。
   - 滑动滑块确认刷入。
4. **重启系统：** 刷入完成后选择“Reboot System”。
5. **完成：** 重启后桌面会出现Magisk图标，若无可手动安装`.apk`。

> **提示：** 刷入Magisk后，建议立即重启手机，以确保Magisk正确加载。

---

## 三、紧急情况与卸载

### 刷入后无法开机？

如Root后卡在开机动画或无法进入系统，通常因镜像不匹配。只需重新进入Fastboot模式，刷回官方ROM中提取的**原始**`boot.img`或`init_boot.img`即可：

```
fastboot flash boot boot.img        # 刷回原始boot.img
fastboot flash init_boot init_boot.img  # 刷回原始init_boot.img
```

> **提示：** 如果您没有原始的 `boot.img` 或 `init_boot.img`，可以尝试重新下载与当前系统版本完全一致的官方ROM包，并从中提取。

### 如何卸载Magisk？

最简单方法：打开Magisk应用，首页下方有“卸载Magisk”选项，点击后选择“完全卸载”即可。

> **提示：** 卸载Magisk后，您可能需要手动删除一些由Magisk模块创建的文件或文件夹，以确保系统完全恢复到未Root状态。

---

## 总结

通过本教程，您应该已经了解了如何使用Magisk对安卓设备进行Root操作。请务必谨慎操作，并在操作前备份所有重要数据。Root操作虽然能带来强大的功能，但也伴随着风险。

## 参考资料

- [Magisk官方GitHub仓库](https://github.com/topjohnwu/Magisk)
- [XDA-Developers论坛](https://forum.xda-developers.com/)
- [Android开发者官方文档 - ADB](https://developer.android.com/tools/adb)
- [Android开发者官方文档 - Fastboot](https://developer.android.com/tools/fastboot)