document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 元素 ---
    const startButton = document.getElementById('start-button');
    const timeElement = document.getElementById('time');
    const startMenuIframe = document.getElementById('start-menu-iframe');
    const shutdownScreen = document.getElementById('shutdown-screen');

    // --- 函数 ---

    // 切换开始菜单
    function toggleStartMenu() {
        const isVisible = startMenuIframe.style.display !== 'none';
        if (isVisible) {
            // 向iframe发送消息，关闭开始菜单
            startMenuIframe.contentWindow.postMessage({ type: 'closeStartMenu' }, '*');
            startMenuIframe.style.display = 'none';
        } else {
            // 确保iframe已加载
            startMenuIframe.style.display = 'block';
            // 向iframe发送消息，显示开始菜单
            if (startMenuIframe.contentWindow) {
                startMenuIframe.contentWindow.postMessage({ type: 'toggleStartMenu' }, '*');
            }
        }
    }

    // 关闭开始菜单
    function closeStartMenu() {
        startMenuIframe.style.display = 'none';
        if (startMenuIframe.contentWindow) {
            startMenuIframe.contentWindow.postMessage({ type: 'closeStartMenu' }, '*');
        }
    }

    // 开始按钮点击事件
    startButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStartMenu();
    });

    // 点击其他地方隐藏菜单
    document.addEventListener('click', (e) => {
        if (!startButton.contains(e.target) && startMenuIframe.style.display !== 'none') {
            closeStartMenu();
        }
    });

    // 按下 Ctrl 键切换开始菜单
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Control') {
            toggleStartMenu();
        }
    });

    // 监听来自iframe的消息
    window.addEventListener('message', (event) => {
        if (event.data.type === 'createWindow') {
            createWindow(event.data.title, event.data.url);
        } else if (event.data.type === 'closeStartMenu') {
            closeStartMenu();
        } else if (event.data.type === 'shutdown') {
            shutdown();
        } else if (event.data.type === 'setWallpaper') {
            // 设置桌面壁纸
            document.body.style.backgroundImage = `url('${event.data.url}')`;
            // 保存到localStorage
            localStorage.setItem('hotmelos_wallpaper', event.data.url);
        }
    });
    
    // 初始化壁纸
    function initWallpaper() {
        const savedWallpaper = localStorage.getItem('hotmelos_wallpaper');
        if (savedWallpaper) {
            document.body.style.backgroundImage = `url('${savedWallpaper}')`;
        }
    }

    // 关机功能
    function shutdown() {
        shutdownScreen.style.display = 'block';
        // 向父窗口转发关机消息，以便关闭iframe和退出全屏
        window.parent.postMessage('shutdown', '*');
        setTimeout(() => {
            shutdownScreen.style.display = 'none';
        }, 1000);
    };

    // 更新时间
    function updateTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}`;
    }

    // 窗口数据管理
    let windows = [];
    let windowIdCounter = 0;

    // 创建窗口
    function createWindow(title, url) {
        const desktop = document.getElementById('desktop');
        const windowDiv = document.createElement('div');
        windowDiv.className = 'window';
        const windowId = windowIdCounter++;
        windowDiv.dataset.windowId = windowId;
        
        const header = document.createElement('div');
        header.className = 'window-header';
        const titleSpan = document.createElement('span');
        titleSpan.className = 'window-title';
        titleSpan.textContent = title;
        const controls = document.createElement('div');
        controls.className = 'window-controls';
        
        // 最小化按钮
        const minimizeButton = document.createElement('button');
        const minimizeIcon = document.createElement('span');
        minimizeIcon.className = 'material-icons';
        minimizeIcon.textContent = 'minimize';
        minimizeButton.appendChild(minimizeIcon);
        minimizeButton.onclick = () => minimizeWindow(windowId);
        
        // 最大化按钮
        const maximizeButton = document.createElement('button');
        const maximizeIcon = document.createElement('span');
        maximizeIcon.className = 'material-icons';
        maximizeIcon.textContent = 'fullscreen';
        maximizeButton.appendChild(maximizeIcon);
        let isMaximized = false;
        let originalState = {};
        maximizeButton.onclick = () => {
            if (isMaximized) {
                windowDiv.style.top = originalState.top;
                windowDiv.style.left = originalState.left;
                windowDiv.style.width = originalState.width;
                windowDiv.style.height = originalState.height;
                isMaximized = false;
                maximizeIcon.textContent = 'fullscreen';
            } else {
                originalState = { top: windowDiv.style.top, left: windowDiv.style.left, width: windowDiv.style.width, height: windowDiv.style.height };
                windowDiv.style.top = '0';
                windowDiv.style.left = '0';
                windowDiv.style.width = '100%';
                windowDiv.style.height = 'calc(100% - 40px)';
                isMaximized = true;
                maximizeIcon.textContent = 'fullscreen_exit';
            }
        };
        
        // 关闭按钮
        const closeButton = document.createElement('button');
        const closeIcon = document.createElement('span');
        closeIcon.className = 'material-icons';
        closeIcon.textContent = 'close';
        closeButton.appendChild(closeIcon);
        closeButton.onclick = () => closeWindow(windowId);
        
        controls.appendChild(minimizeButton);
        controls.appendChild(maximizeButton);
        controls.appendChild(closeButton);
        header.appendChild(titleSpan);
        header.appendChild(controls);
        
        const body = document.createElement('div');
        body.className = 'window-body';
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', '');
        body.appendChild(iframe);
        
        windowDiv.appendChild(header);
        windowDiv.appendChild(body);
        desktop.appendChild(windowDiv);
        
        // 窗口拖动逻辑
        let isDragging = false;
        let offsetX, offsetY;
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - windowDiv.offsetLeft;
            offsetY = e.clientY - windowDiv.offsetTop;
            windowDiv.style.zIndex = 101;
        });
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                windowDiv.style.left = `${e.clientX - offsetX}px`;
                windowDiv.style.top = `${e.clientY - offsetY}px`;
            }
        });
        document.addEventListener('mouseup', () => {
            isDragging = false;
            windowDiv.style.zIndex = 100;
        });
        
        // 保存窗口信息
        const windowInfo = {
            id: windowId,
            title: title,
            element: windowDiv,
            isMinimized: false,
            taskbarIcon: null
        };
        windows.push(windowInfo);
        
        // 创建任务栏图标
        createTaskbarIcon(windowInfo);
    }
    
    // 最小化窗口
    function minimizeWindow(windowId) {
        const windowInfo = windows.find(w => w.id === windowId);
        if (windowInfo) {
            windowInfo.element.style.display = 'none';
            windowInfo.isMinimized = true;
        }
    }
    
    // 恢复窗口
    function restoreWindow(windowId) {
        const windowInfo = windows.find(w => w.id === windowId);
        if (windowInfo) {
            windowInfo.element.style.display = 'flex';
            windowInfo.element.style.zIndex = 101;
            windowInfo.isMinimized = false;
            setTimeout(() => {
                windowInfo.element.style.zIndex = 100;
            }, 100);
        }
    }
    
    // 关闭窗口
    function closeWindow(windowId) {
        const windowIndex = windows.findIndex(w => w.id === windowId);
        if (windowIndex !== -1) {
            const windowInfo = windows[windowIndex];
            // 移除窗口元素
            windowInfo.element.remove();
            // 移除任务栏图标
            if (windowInfo.taskbarIcon) {
                windowInfo.taskbarIcon.remove();
            }
            // 从数组中移除
            windows.splice(windowIndex, 1);
        }
    }
    
    // 创建任务栏图标
    function createTaskbarIcon(windowInfo) {
        const taskbarIcons = document.getElementById('taskbar-icons');
        const icon = document.createElement('div');
        icon.className = 'taskbar-icon';
        icon.textContent = windowInfo.title;
        icon.dataset.windowId = windowInfo.id;
        icon.onclick = () => {
            if (windowInfo.isMinimized) {
                restoreWindow(windowInfo.id);
            } else {
                minimizeWindow(windowInfo.id);
            }
        };
        taskbarIcons.appendChild(icon);
        windowInfo.taskbarIcon = icon;
    }

    // --- 初始化 ---
    setInterval(updateTime, 1000);
    updateTime();
    initWallpaper();

    // 确保iframe内容完全加载
    startMenuIframe.onload = function() {
        console.log('开始菜单iframe已加载');
    };
    
    // 初始化时尝试向iframe发送一个消息，确认连接已建立
    setTimeout(() => {
        if (startMenuIframe.contentWindow) {
            startMenuIframe.contentWindow.postMessage({ type: 'init' }, '*');
        }
    }, 1000);
});