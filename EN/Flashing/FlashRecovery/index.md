# How to Flash Recovery on Your Device

## Disclaimer

I am not responsible for any accidents caused by flashing. Please back up all your data and the original recovery before proceeding.

## Introduction

Recovery is a system partition on Android devices that allows performing basic maintenance operations without booting into the system. Flashing a custom recovery unlocks more features and enhances your device customization experience.

## Preparation

### Download and Configure Platform-Tools

1. Download

    [Download Windows Version](https://dl.google.com/android/repository/platform-tools-latest-windows.zip?hl=zh-cn)

2. Configuration

    Extract the downloaded platform-tools to the root directory of drive C

---

### Unlock Bootloader (BL Lock)

1. This is the most difficult step. Almost all manufacturers have locked the BL lock tightly, making unlocking extremely challenging. Since BL unlocking methods vary by manufacturer, please search for the specific method if the following tutorial doesn't work for your device.

#### Reboot Device into Fastboot Mode

1. Turn off your device, then press and hold the Volume Down button and Power button. Release the Power button after the device vibrates or the screen lights up to enter Fastboot mode

#### Connect Device to Computer

1. Use a high-quality USB cable to connect your device to the computer
2. Open CMD on your computer
3. Enter the following command and press Enter

    ~~~code
    cd C:\platform-tools
    ~~~

4. If it responds normally, enter

    ~~~code
    fastboot devices
    ~~~

5. If the device serial number is displayed, enter the following command and press Enter

    ~~~code
    fastboot oem unlock
    ~~~

6. If unlocking fails, try

    ~~~code
    fastboot flashing unlock
    ~~~

7. If unlocking still fails, please search for the unlocking method yourself

### Download Recovery

1. Visit the [TWRP official website](https://twrp.me/Devices/) or [OrangeFox official website](https://orangefox.download/) to download Recovery
2. If the downloaded file is a compressed package, extract it and copy the recovery.img file inside to the root directory of drive C. If the downloaded file is directly recovery.img, copy it to the root directory of drive C

## Official Flashing

1. Open CMD
2. Enter the following command and press Enter

    ~~~code
    cd C:\platform-tools
    ~~~

3. If it switches normally, enter the following command and press Enter

    ~~~code
    fastboot devices
    ~~~

4. If the device ID is displayed, enter

    ~~~code
    fastboot flash recovery C:/recovery.img
    ~~~

5. After successful flashing, enter the following command to reboot into recovery mode

    ~~~code
    fastboot reboot recovery
    ~~~
