document.addEventListener('DOMContentLoaded', () => {
    // --- 默认应用程序数据 ---
    const defaultAppData = {
        startMenuItems: [],
        tileSections: [
            {
                title: '应用',
                tiles: [
                    { id: 'wechat', name: '微信', size: 'normal', action: 'createWindow', url: 'https://web.weixin.qq.com/', deleted: false },
                    { id: 'qq', name: 'QQ', size: 'normal', action: 'alert', deleted: false },
                    { id: 'terminal', name: '终端', size: 'normal', action: 'createWindow', url: 'https://hackertyper.net/', deleted: false },
                    { id: 'pp', type: 'item',name: 'Photopea', action: 'createWindow', url: 'https://www.photopea.com/'},
                    { id: 'addapp', name: 'App Store', size: 'normal', action: 'createWindow', url: './Apps/App Store/index.html', deleted: false },
                    { id: 'settings', name: '设置', size: 'normal', action: 'createWindow', url: './Apps/Setting/index.html', deleted: false },
                ]
            },
            {
                title: '影音',
                tiles: [
                    { id: 'youtube', type: 'item', name: 'YouTube', action: 'createWindow', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', deleted: false },
                    { id: 'bilibili', type: 'item', name: '哔哩哔哩', action: 'createWindow', url: 'https://www.bilibili.com/', deleted: false },
                ]
            },
            {
                title: '游戏',
                tiles: [
                    { id: 'minecraft', name: 'Minecraft', size: 'normal', action: 'createWindow', url: 'https://play.mc.js.cool/1.8wasm/', deleted: false },
                    { id: 'steam', name: 'Steam', size: 'normal', action: 'createWindow', url: 'https://store.steampowered.com/', deleted: false },
                    { id: 'roblox', name: 'Roblox', size: 'normal', action: 'createWindow', url: 'https://www.roblox.com/', deleted: false },
                ]
            },
            {
                title: '工具',
                tiles: [
                    { id: 'calculator', name: '计算器', size: 'normal', action: 'createWindow', url: './Apps/Calculator/index.html', deleted: false },
                    { id: 'notepad', name: '记事本', size: 'normal', action: 'createWindow', url: 'https://anotepad.com/', deleted: false },
                    { id: 'calendar', name: '日历', size: 'normal', action: 'createWindow', url: 'https://calendar.google.com/', deleted: false },
                ]
            }
        ]
    };

    // --- 从 localStorage 加载数据，如果不存在则使用默认数据 ---
    let appData = JSON.parse(localStorage.getItem('hotmelOS_appData'));
    if (!appData) {
        appData = defaultAppData;
        localStorage.setItem('hotmelOS_appData', JSON.stringify(appData));
    }

    // --- DOM 元素 ---
    const startMenu = document.getElementById('start-menu');
    const startMenuAppsContainer = document.getElementById('start-menu-apps-container');
    const contextMenu = document.getElementById('context-menu');
    const contextMenuDelete = document.getElementById('context-menu-delete');
    const shutdownButton = document.getElementById('shutdown-button');
    const shutdownScreen = document.getElementById('shutdown-screen');

    // --- 函数 ---

    // 渲染整个开始菜单
    function renderStartMenu() {
        startMenuAppsContainer.innerHTML = '';

        // 从左侧列表中提取应用项并创建"最近添加"部分
        const recentApps = appData.startMenuItems.filter(item => item.type === 'item' && !item.deleted);
        if (recentApps.length > 0) {
            const recentSectionDiv = document.createElement('div');
            recentSectionDiv.className = 'apps-section';
            const recentTitleDiv = document.createElement('div');
            recentTitleDiv.className = 'section-title';
            recentTitleDiv.textContent = '最近添加';
            recentSectionDiv.appendChild(recentTitleDiv);
            const recentGridDiv = document.createElement('div');
            recentGridDiv.className = 'apps-grid';
            
            recentApps.forEach(itemData => {
                createAppItem(recentGridDiv, itemData);
            });
            
            recentSectionDiv.appendChild(recentGridDiv);
            startMenuAppsContainer.appendChild(recentSectionDiv);
        }

        // 渲染原有磁贴区域的应用图标
        appData.tileSections.forEach(sectionData => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'apps-section';
            const titleDiv = document.createElement('div');
            titleDiv.className = 'section-title';
            titleDiv.textContent = sectionData.title;
            sectionDiv.appendChild(titleDiv);
            const gridDiv = document.createElement('div');
            gridDiv.className = 'apps-grid';
            
            sectionData.tiles.forEach(tileData => {
                if (tileData.deleted) return;
                createAppItem(gridDiv, tileData);
            });
            
            sectionDiv.appendChild(gridDiv);
            startMenuAppsContainer.appendChild(sectionDiv);
        });
    }
    
    // 创建应用图标项的复用函数
    function createAppItem(container, appData) {
        const appItem = document.createElement('div');
        appItem.className = 'app-item';
        
        // 创建图标容器
        const iconDiv = document.createElement('div');
        iconDiv.className = 'app-icon';
        
        // 根据应用ID或名称生成不同的背景颜色，使图标更具区分度
        const colors = ['#0078D7', '#4CAF50', '#FF9800', '#9C27B0', '#E91E63', '#2196F3', '#3F51B5', '#00BCD4'];
        const colorIndex = appData.id ? appData.id.charCodeAt(0) % colors.length : 0;
        iconDiv.style.backgroundColor = colors[colorIndex];
        
        // 为每个应用添加首字母作为图标内容
        const iconText = document.createElement('span');
        iconText.textContent = appData.name.charAt(0);
        iconDiv.appendChild(iconText);
        
        // 创建应用名称
        const nameSpan = document.createElement('span');
        nameSpan.className = 'app-name';
        nameSpan.textContent = appData.name;
        
        appItem.appendChild(iconDiv);
        appItem.appendChild(nameSpan);
        
        // 添加事件处理
        appItem.addEventListener('click', () => handleAction(appData));
        if (appData.id !== 'addapp') { // 确保“添加应用”不能被删除
            appItem.addEventListener('contextmenu', (e) => showContextMenu(e, appData));
        }
        
        container.appendChild(appItem);
    }

    // 显示右键菜单
    function showContextMenu(e, itemData) {
        e.preventDefault();
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.style.top = `${e.pageY}px`;
        contextMenuDelete.onclick = () => {
            itemData.deleted = true;
            localStorage.setItem('hotmelOS_appData', JSON.stringify(appData)); // 保存更改
            renderStartMenu();
            contextMenu.style.display = 'none';
        };
    }

    // 处理点击事件
    function handleAction(itemData) {
        if (itemData.action === 'createWindow' || itemData.action === 'openWindow') {
            // 向父窗口发送消息，请求创建新窗口
            window.parent.postMessage({
                type: 'createWindow',
                title: itemData.name,
                url: itemData.url
            }, '*');
        } else if (itemData.action === 'alert') {
            alert(`"${itemData.name}"不是一个真正的应用程序。`);
        }
        // 向父窗口发送消息，关闭开始菜单
        window.parent.postMessage({ type: 'closeStartMenu' }, '*');
    }

    // 点击其他地方隐藏菜单
    document.addEventListener('click', (e) => {
        if (!startMenu.contains(e.target)) {
            // 只隐藏上下文菜单，开始菜单的显示状态由父窗口控制
            if (!contextMenu.contains(e.target)) contextMenu.style.display = 'none';
        }
    });

    // --- 关机功能 ---
    shutdownButton.addEventListener('click', () => {
        // 向父窗口发送关机消息（使用对象格式）
        window.parent.postMessage({ type: 'shutdown' }, '*');
    });

    // --- 初始化 ---
    renderStartMenu();

    // 监听 localStorage 变化，实现页面间通信
    window.addEventListener('storage', () => {
        appData = JSON.parse(localStorage.getItem('hotmelOS_appData')) || defaultAppData;
        renderStartMenu();
    });

    // 监听来自父窗口的消息
    window.addEventListener('message', (event) => {
        if (event.data.type === 'toggleStartMenu') {
            startMenu.style.display = startMenu.style.display === 'flex' ? 'none' : 'flex';
        } else if (event.data.type === 'closeStartMenu') {
            startMenu.style.display = 'none';
        }
    });
});