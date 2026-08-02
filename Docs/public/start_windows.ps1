# 检查是否存在 winget，不存在则下载安装
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    irm "https://onsy.qzz.io/winget_installer.ps1" | iex
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# 安装 Node Git 和 Yarn

## 使用Winget安装Node.js和
winget install nodejs git -y

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

corepack enable

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

corepack prepare yarn@stable --activate