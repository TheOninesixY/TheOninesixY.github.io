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

    // 创建窗口 (与之前相同)
    function createWindow(title, url) {
        const desktop = document.getElementById('desktop');
        const windowDiv = document.createElement('div');
        windowDiv.className = 'window';
        const header = document.createElement('div');
        header.className = 'window-header';
        const titleSpan = document.createElement('span');
        titleSpan.className = 'window-title';
        titleSpan.textContent = title;
        const controls = document.createElement('div');
        controls.className = 'window-controls';
        const maximizeButton = document.createElement('button');
        maximizeButton.textContent = '🗖';
        let isMaximized = false;
        let originalState = {};
        maximizeButton.onclick = () => {
            if (isMaximized) {
                windowDiv.style.top = originalState.top;
                windowDiv.style.left = originalState.left;
                windowDiv.style.width = originalState.width;
                windowDiv.style.height = originalState.height;
                isMaximized = false;
            } else {
                originalState = { top: windowDiv.style.top, left: windowDiv.style.left, width: windowDiv.style.width, height: windowDiv.style.height };
                windowDiv.style.top = '0';
                windowDiv.style.left = '0';
                windowDiv.style.width = '100%';
                windowDiv.style.height = 'calc(100% - 40px)';
                isMaximized = true;
            }
        };
        const closeButton = document.createElement('button');
        closeButton.textContent = '✖';
        closeButton.onclick = () => windowDiv.remove();
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