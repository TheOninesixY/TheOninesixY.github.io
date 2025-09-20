# 📱 Android Root Guide

**Author:** OninesixY  |  **Compilation and Optimization:** GoogleGemini

---

## Table of Contents

- [Important Notice](#important-notice-please-read)
- [I. Preparation](#i-preparation)
  - [1. Unlock Bootloader](#1-unlock-bootloader)
  - [2. Download Necessary Files and Tools](#2-download-necessary-files-and-tools)
- [II. Core Root Operations](#ii-core-root-operations)
  - [Method 1: Patch Boot Image (boot.img / init_boot.img)](#method-1-patch-boot-image-bootimg--init_bootimg)
  - [Method 2: Flash Magisk via Custom Recovery](#method-2-flash-magisk-via-custom-recovery)
- [III. Emergency Situations and Uninstallation](#iii-emergency-situations-and-uninstallation)
  - [Can't Boot After Flashing?](#cant-boot-after-flashing)
  - [How to Uninstall Magisk?](#how-to-uninstall-magisk)

---

## ⚠️ Important Notice (Please Read)

Rooting (gaining superuser access) is a double-edged sword. It allows you to fully control your Android device, perform deep customization, uninstall pre-installed apps, run advanced tools, but it also comes with significant risks:

- **Loss of Official Warranty:** Most manufacturers do not provide warranty for rooted devices.
- **System Instability:** Incorrect operations may cause frequent crashes, reboots, or even "bricking" your device.
- **Security Risks:** Malicious software may more easily invade and steal your private information.
- **Unable to Receive Official System Updates (OTA):** Rooting modifies system partitions, affecting official system updates.

**Please read this tutorial completely, understand every step, and be sure to back up all important data. You are responsible for any losses caused by improper operations!**

---

## I. Preparation

Before rooting, please complete the following preparations:

### 1. Unlock Bootloader

- **What is a Bootloader?** A boot program that runs before the Android system starts, which manufacturers lock by default to prevent system modification.
- **Why Unlock?** Only after unlocking can you flash custom images (such as patched `boot.img` or TWRP Recovery).
- **How to Unlock?** Different brands have different methods (e.g., Xiaomi requires official tools, OPPO/Realme require deep testing, etc.). Please refer to the brand's official guidelines or communities like XDA-Developers.
**Note:** Unlocking the Bootloader will erase all data, please back up in advance!

### 2. Download Necessary Files and Tools

- **Platform-Tools (ADB & Fastboot):** Google's official command-line tools for advanced communication between computer and phone.
  - **Official Download:** [SDK Platform Tools release notes](https://developer.android.com/tools/releases/platform-tools)
  - **Usage:** Download the compressed package for your system, extract it to a path **without Chinese characters or special symbols** (e.g., `C:\adb`), and all subsequent command-line operations will be performed in this folder.
    - **ADB (Android Debug Bridge):** Used to communicate with Android devices and execute various device management commands.
    - **Fastboot:** Used for low-level operations when the device is in Fastboot mode, such as flashing partitions.
- **Official Phone Firmware (ROM):** Download the **exact same version** of the ROM package as your current system, used to extract `boot.img` or `init_boot.img` needed for patching. Can be obtained from the phone manufacturer's official website or trusted ROM resource sites.
- **Magisk App:** The current mainstream rooting solution with "systemless" features. Please download the latest version of the Magisk App (`.apk` file) from the official GitHub release page.

---

## II. Core Root Operations

This tutorial recommends two mainstream Magisk rooting methods, **Method 1 is the most universal and recommended!**

### Method 1: Patch Boot Image (boot.img / init_boot.img)

**Officially recommended by Magisk, with the best compatibility.**

#### Core Concepts

- `boot.img`: Contains the system kernel and Ramdisk, a key component for Android startup.
- `init_boot.img`: For Android 13 and above devices, Ramdisk is moved to a separate `init_boot` partition.
- **Judgment Criteria:** Install and open Magisk, the main interface will display the "Ramdisk" status. If you need to patch `init_boot.img`, there will be a prompt or you need to judge based on the kernel version. Generally, new models after 2022 mostly use `init_boot.img`.

#### Operation Steps

1. **Extract Boot Image:** Unzip the official ROM package and find `boot.img` or `init_boot.img`.
2. **Transfer Image to Phone:** Copy the above file to the phone's internal storage (e.g., "Download" folder).
3. **Install Magisk App:** Install the Magisk `.apk` on your phone.
4. **Patch Image File:**
   - Open Magisk and click "Install"
   - Select "Select and Patch a File"
   - Choose the `boot.img` or `init_boot.img` you just copied
   - After patching, `magisk_patched-version.img` will be generated in the "Download" folder
5. **Transfer Patched Image to Computer:** Copy `magisk_patched-....img` back to the computer's `platform-tools` folder.
6. **Enter Fastboot Mode:** Turn off the phone, press "Power Button + Volume Down" simultaneously (combination keys differ for some brands) to enter Fastboot/Bootloader interface.
7. **Connect to Computer and Flash:**
   - Connect the phone to the computer with a USB cable.
   - In the `platform-tools` folder, enter `cmd` or `powershell` in the address bar and press Enter to open the command line.
   - Enter:
     ```
     fastboot devices
     ```
     If a serial number is displayed, the connection is successful.
   - **Depending on the patched file type, execute:**
     - Patching `boot.img`:
       ```
       fastboot flash boot magisk_patched-....img
       ```
     - Patching `init_boot.img`:
       ```
       fastboot flash init_boot magisk_patched-....img
       ```
     *(Please replace the filename with the actual generated filename)*
8. **Reboot Phone:**
   ```
   fastboot reboot
   ```
9. **Complete:** After booting up, open Magisk. If the current version number is displayed, rooting is successful!

> **Tip:** If you are unsure whether to use `boot.img` or `init_boot.img`, you can open the Magisk app and check the "Ramdisk" status on the main interface. If it shows "No Ramdisk", then you need to patch `init_boot.img`.

---

### Method 2: Flash Magisk via Custom Recovery

If you have already flashed a custom Recovery (such as TWRP), you can use this method.

#### Prerequisites

- The phone has successfully flashed a usable custom Recovery (TWRP/OrangeFox, etc.).

#### Operation Steps

1. **Prepare Files:** Download Magisk `.apk`, rename it to `Magisk.zip`, and copy it to phone storage or SD card.
2. **Enter Recovery Mode:** Reboot to TWRP or other custom Recovery (key combination varies by model).
3. **Flash Magisk:**
   - Click "Install" on the TWRP main interface.
   - Select `Magisk.zip`.
   - Swipe the slider to confirm flashing.
4. **Reboot System:** After flashing is complete, select "Reboot System".
5. **Complete:** After rebooting, the Magisk icon will appear on the desktop. If not, you can manually install the `.apk`.

> **Tip:** After flashing Magisk, it is recommended to reboot the phone immediately to ensure that Magisk loads correctly.

---

## III. Emergency Situations and Uninstallation

### Can't Boot After Flashing?

If the phone gets stuck on the boot animation or can't enter the system after rooting, it's usually due to image mismatch. Just re-enter Fastboot mode and flash back the **original** `boot.img` or `init_boot.img` extracted from the official ROM:

```
fastboot flash boot boot.img        # Flash back original boot.img
fastboot flash init_boot init_boot.img  # Flash back original init_boot.img
```

> **Tip:** If you don't have the original `boot.img` or `init_boot.img`, you can try re-downloading the official ROM package that matches your current system version exactly and extract it from there.

### How to Uninstall Magisk?

The simplest method: Open the Magisk app, there is an "Uninstall Magisk" option at the bottom of the home page, click it and select "Complete Uninstall".

> **Tip:** After uninstalling Magisk, you may need to manually delete some files or folders created by Magisk modules to ensure the system is completely restored to an unrooted state.

---

## Summary

Through this tutorial, you should have learned how to use Magisk to root your Android device. Please operate with caution and back up all important data before proceeding. While rooting can bring powerful functions, it also comes with risks.

## Reference Materials

- [Magisk Official GitHub Repository](https://github.com/topjohnwu/Magisk)
- [XDA-Developers Forum](https://forum.xda-developers.com/)
- [Android Developer Official Documentation - ADB](https://developer.android.com/tools/adb)
- [Android Developer Official Documentation - Fastboot](https://developer.android.com/tools/fastboot)