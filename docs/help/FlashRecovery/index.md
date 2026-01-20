# 如何给设备刷入Recovery

## 声明

任何由刷机出现的事故与我无关，请在刷前做好数据备份和原Recovery备份。

## 前言

Recovery是安卓设备的一个系统分区，可在设备不启动系统的情况下执行基本维护操作。刷入第三方Recovery能解锁更多功能，让你体验更多玩机乐趣。

## 准备工作

### 下载和配置platform-tools

1. 下载

    [下载Windows版本](https://dl.google.com/android/repository/platform-tools-latest-windows.zip?hl=zh-cn)

2. 配置

    将下载的platform-tools解压至C盘根目录

---

### 解锁Bootloader（简称BL锁）

1. 这是最难的一步，现在几乎所有厂商都锁死了BL锁，解锁难如登天。由于不同厂商的BL解锁不同，若以下教程无效，请自行查阅解锁方式。

#### 将设备重启至Fastboot模式

1. 将设备关机，然后按住音量-键和电源键，设备震动或屏幕亮起后，松开电源键，这样即可进入Fastboot模式

#### 将设备连接到电脑

1. 使用优质的数据线将设备连接至电脑
2. 在电脑上打开CMD
3. 以下命令并回车

    ~~~code
    cd C:\platform-tools
    ~~~

4. 若正常反馈，则输入

    ~~~code
    fastboot devices
    ~~~

5. 若显示设备序列号，则输入以下命令并回车

    ~~~code
    fastboot oem unlock
    ~~~

6. 若解锁失败，则尝试

    ~~~code
    fastboot flashing unlock
    ~~~

7. 若仍然解锁失败，请自行查询解锁方式

### 下载Recovery

1. 前往[TWRP官网](https://twrp.me/Devices/)或[OrangeFox官网](https://orangefox.download/)下载Recovery
2. 如果下载的是一个压缩包，请解压它，并把里面的recovery.img复制到C盘根目录。如果下载的直接是个recovery.img，请把它复制到C盘根目录

## 正式刷入

1. 打开CMD
2. 输入以下命令并回车

    ~~~code
    cd C:\platform-tools
    ~~~

3. 若正常切换，则输入以下命令并回车

    ~~~code
    fastboot devices
    ~~~

4. 若显示了设备ID，则输入

    ~~~code
    fastboot flash recovery C:/recovery.img
    ~~~

5. 刷入成功后输入以下命令重启到recovery模式

    ~~~code
    fastboot reboot recovery
    ~~~
