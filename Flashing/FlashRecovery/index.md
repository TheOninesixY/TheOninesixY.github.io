# 如何刷入第三方Recovery

Recovery是Android系统的一个特殊模式，它可以帮助用户修复系统问题、备份数据、安装第三方应用等。不同手机品牌和型号可能使用不同的Recovery软件，例如TWRP、CWM等，因此需要根据自己的设备选择对应的Recovery软件。

## 准备工作：

### 1. 下载刷机工具：platform-tools

- [下载Windows版本](https://dl.google.com/android/repository/platform-tools-latest-windows.zip?hl=zh-cn)
- [下载Linux版本](https://dl.google.com/android/repository/platform-tools-latest-linux.zip?hl=zh-cn)
- [下载Mac版本](https://dl.google.com/android/repository/platform-tools-latest-darwin.zip?hl=zh-cn)

下载完成后，解压到C盘根目录下，即C:\platform-tools

### 2. 下载Recovery软件

推荐使用TWRP和OrangeFox，它们功能强大，操作简单。

- [前往TWRP官网](https://twrp.me/Devices/)
- [前往OrangeFox官网](https://orangefox.download/)

下载后会得到一个zip文件，双击打开它，里面有一个recovery.img文件，复制到C:\platform-tools。

## 开始刷入：

1. 将手机关机，按住音量下键和电源键，直到出现fastboot界面。
2. 连接手机到电脑，打开命令提示符（管理员），输入以下命令并回车：
   ```
   cd C:\platform-tools
   ```
3. 输入以下命令并回车，检查设备连接：
   ```
   fastboot devices
   ```
   如果显示出手机的序列号，说明连接成功。
4. 输入以下命令并回车，开始刷入Recovery：
   ```
   fastboot flash recovery recovery.img
   ```
   等待刷入完成。