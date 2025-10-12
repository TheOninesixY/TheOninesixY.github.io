document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素获取
    // 搜索相关
    const searchInput = document.getElementById('search-input'); // 搜索输入框
    const searchButton = document.getElementById('search-button'); // 搜索按钮
    // 设置模态框相关
    const settingsModal = document.getElementById('settings-modal'); // 设置模态框
    const closeModal = document.querySelector('#settings-modal .close'); // 设置模态框关闭按钮
    const searchEngineSelect = document.getElementById('search-engine'); // 搜索引擎选择器
   const searchOpenTypeSelect = document.getElementById('search-open-type'); // 搜索打开方式选择器
    // 背景图片相关
    const bgFileInput = document.getElementById('bg-file-input'); // 背景文件输入框
    const bgImageSelect = document.getElementById('bg-image-select'); // 背景图片选择器

    // 时间显示相关元素
    const timeDisplay = document.getElementById('time-display'); // 时间显示区域
    const showTimeCheckbox = document.getElementById('show-time'); // 是否显示时间的选择框
    const showSecondsCheckbox = document.getElementById('show-seconds'); // 是否显示秒数的选择框
    const timeFormatSelect = document.getElementById('time-format'); // 时间格式选择器 (12h/24h)
    const showAmpmSelect = document.getElementById('show-ampm'); // 是否显示 AM/PM 的选择器
    const timeColorSelect = document.getElementById('time-color'); // 时间颜色选择器
    const timeWeightSelect = document.getElementById('time-weight'); // 时间字体粗细选择器
    // 时间设置的子选项容器
    const timeFormatSettings = document.getElementById('time-format-settings'); // 秒数显示设置容器
    const ampmDisplaySettings = document.getElementById('ampm-display-settings'); // AM/PM 显示设置容器
    const timeFormatSelectContainer = document.getElementById('time-format-select-container'); // 时间格式设置容器
    const timeColorSettings = document.getElementById('time-color-settings'); // 时间颜色设置容器
    const timeWeightSettings = document.getElementById('time-weight-settings'); // 时间字体粗细设置容器

    // 深色模式相关元素
    const darkModeToggle = document.getElementById('dark-mode-toggle'); // 深色模式开关
    const darkModeTypeSelect = document.getElementById('dark-mode-type'); // 深色模式类型选择器 (深色/跟随系统)
    const darkModeTypeSettings = document.getElementById('dark-mode-type-settings'); // 深色模式类型设置容器

    // 快速访问相关元素
    const quickAccessLinksContainer = document.getElementById('quick-access-links'); // 快速访问链接的容器
    const quickAccessModal = document.getElementById('quick-access-modal'); // 添加/编辑快速访问的模态框
    const closeQuickAccessModal = document.getElementById('close-quick-access-modal'); // 关闭快速访问模态框的按钮
    const saveQuickAccessButton = document.getElementById('save-quick-access'); // 保存快速访问链接的按钮
    const cancelQuickAccessButton = document.getElementById('cancel-quick-access'); // 取消快速访问操作的按钮
    const quickAccessTitleInput = document.getElementById('quick-access-title'); // 快速访问标题输入框
    const quickAccessUrlInput = document.getElementById('quick-access-url'); // 快速访问URL输入框
    const quickAccessIconInput = document.getElementById('quick-access-icon'); // 快速访问图标URL输入框
    const quickAccessModalTitle = document.getElementById('quick-access-modal-title'); // 快速访问模态框的标题
    const quickAccessOriginalUrlInput = document.getElementById('quick-access-original-url'); // 隐藏输入框，用于存储编辑前链接的原始URL

    // 快速访问设置相关元素
    const showQuickAccessCheckbox = document.getElementById('show-quick-access'); // 是否显示快速访问的选择框
    const quickAccessContainer = document.querySelector('.quick-access-container'); // 快速访问容器
    const quickAccessOpenTypeSelect = document.getElementById('quick-access-open-type'); // 快速访问打开方式选择器
    const quickAccessOpenTypeSettings = document.getElementById('quick-access-open-type-settings'); // 快速访问打开方式设置容器
    const showQuickAccessTitleCheckbox = document.getElementById('show-quick-access-title'); // 是否显示快速访问标题的选择框
    const quickAccessTitleColorSelect = document.getElementById('quick-access-title-color'); // 快速访问标题颜色选择器
    const quickAccessTitleDisplaySettings = document.getElementById('quick-access-title-display-settings'); // 标题显示设置容器
    const quickAccessTitleColorSettings = document.getElementById('quick-access-title-color-settings'); // 标题颜色设置容器

     // 右键上下文菜单相关元素
     const contextMenu = document.getElementById('context-menu'); // 上下文菜单容器
    const editLinkButton = document.getElementById('edit-link'); // 编辑链接按钮
    const deleteLinkButton = document.getElementById('delete-link'); // 删除链接按钮
// 悬浮设置按钮
const floatingSettingsButton = document.getElementById('floating-settings-button');

// --- 初始化加载 ---


    // 加载已保存的搜索引擎偏好
    const savedSearchEngine = localStorage.getItem('searchEngine') || 'google'; // 从 localStorage 获取，默认为 google
    searchEngineSelect.value = savedSearchEngine; // 设置选择器的值为保存的值

   // 加载已保存的搜索打开方式
   const savedSearchOpenType = localStorage.getItem('searchOpenType') || '_self';
   searchOpenTypeSelect.value = savedSearchOpenType;

    /**
     * 加载并应用背景相关的保存设置
     */
    const loadBackgroundSettings = () => {
        const savedBgImageType = localStorage.getItem('bgImageType') || 'default';
        bgImageSelect.value = savedBgImageType;

        if (savedBgImageType === 'custom') {
            const savedBgImage = localStorage.getItem('bgImage');
            if (savedBgImage) {
                document.body.style.backgroundImage = `url(${savedBgImage})`;
            }
        } else if (savedBgImageType === 'bing') {
            // 对于bing壁纸，每次加载都重新获取，以确保是“今日”壁纸
            const bingWallpaperUrl = 'https://bing.img.run/uhd.php';
            document.body.style.backgroundImage = `url(${bingWallpaperUrl})`;
            localStorage.setItem('bgImage', bingWallpaperUrl); // 同时更新保存的URL
        } else { // default
            document.body.style.backgroundImage = '';
            localStorage.removeItem('bgImage');
        }
    };

    // --- 搜索功能 ---

    /**
     * 执行搜索操作
     */
    const performSearch = () => {
        const query = searchInput.value.trim(); // 获取并清理输入框中的查询内容
        if (query) {
           const openType = localStorage.getItem('searchOpenType') || '_self';
            // 检查输入是否为完整的 URL
            if (query.startsWith('http://') || query.startsWith('https://')) {
               window.open(query, openType);
            } else if (query.includes('.')) { // 简单检查是否为域名
               window.open(`https://${query}`, openType);
            } else {
                // 使用选择的搜索引擎进行搜索
                const searchEngine = searchEngineSelect.value;
                let searchUrl;
                switch (searchEngine) {
                    case 'bing':
                        searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                        break;
                    case 'duckduckgo':
                        searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
                        break;
                    case 'baidu':
                        searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
                        break;
                    default: // 默认为 google
                        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                }
               window.open(searchUrl, openType);
            }
        }
    };

    // 为搜索按钮添加点击事件监听
    searchButton.addEventListener('click', performSearch);

    // 为搜索输入框添加回车键监听
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    // --- 设置模态框功能 ---

    // 关闭设置模态框
    closeModal.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    // 点击模态框外部区域关闭
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // 保存搜索引擎偏好
    searchEngineSelect.addEventListener('change', () => {
        localStorage.setItem('searchEngine', searchEngineSelect.value);
    });

   // 保存搜索打开方式偏好
   searchOpenTypeSelect.addEventListener('change', () => {
       localStorage.setItem('searchOpenType', searchOpenTypeSelect.value);
   });

    // --- 背景图片功能 ---

    // 当背景图片来源选择变化时
    bgImageSelect.addEventListener('change', () => {
        const selectedValue = bgImageSelect.value;
        localStorage.setItem('bgImageType', selectedValue);

        if (selectedValue === 'default') {
            document.body.style.backgroundImage = '';
            localStorage.removeItem('bgImage');
            localStorage.removeItem('bgImageType');
        } else if (selectedValue === 'bing') {
            const bingWallpaperUrl = 'https://bing.img.run/uhd.php';
            document.body.style.backgroundImage = `url(${bingWallpaperUrl})`;
            localStorage.setItem('bgImage', bingWallpaperUrl);
        } else if (selectedValue === 'custom') {
            bgFileInput.click();
        }
    });

    // 当用户选择自定义背景文件后
    bgFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0]; // <--- [修复] 从文件列表中获取第一个文件
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                document.body.style.backgroundImage = `url(${imageUrl})`;
                localStorage.setItem('bgImage', imageUrl);
                // 确保下拉框也更新为 'custom'
                localStorage.setItem('bgImageType', 'custom');
                bgImageSelect.value = 'custom';
            };
            reader.readAsDataURL(file); // <--- [修复] 现在读取的是正确的文件对象
        } else {
            // 如果用户取消了文件选择，将下拉框恢复到之前保存的状态
            const previousType = localStorage.getItem('bgImageType') || 'default';
            bgImageSelect.value = previousType;
        }
    });

    // --- 深色模式功能 ---

    /**
     * 应用或移除深色模式样式
     * @param {boolean} isDarkMode - 是否启用深色模式
     */
    const applyDarkMode = (isDarkMode) => {
        document.body.classList.toggle('dark-mode', isDarkMode);
    };

    /**
     * 检查系统是否处于深色模式
     * @returns {boolean} - 如果系统是深色模式则返回 true
     */
    const checkSystemDarkMode = () => {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    /**
     * 根据用户设置更新深色模式状态
     */
    const updateDarkMode = () => {
        const darkModeEnabled = localStorage.getItem('darkModeEnabled') !== 'false';
        const darkModeType = localStorage.getItem('darkModeType') || 'system';
        
        if (darkModeType === 'system') {
            applyDarkMode(checkSystemDarkMode()); // 跟随系统设置
        } else {
            applyDarkMode(darkModeEnabled); // 根据手动开关设置
        }
        
        // 当深色模式切换时，重新应用颜色设置以响应“自动”选项
        updateTimeDisplay();
        applyQuickAccessTitleSettings();
    };

    /**
     * 加载并应用深色模式的保存设置
     */
    const loadDarkModeSettings = () => {
        darkModeToggle.checked = localStorage.getItem('darkModeEnabled') !== 'false';
        darkModeTypeSelect.value = localStorage.getItem('darkModeType') || 'system';
        
        // 根据是否启用深色模式来显示或隐藏类型选择器
        darkModeTypeSettings.style.display = darkModeToggle.checked ? 'flex' : 'none';
        
        updateDarkMode();
    };

    // 深色模式开关事件监听
    darkModeToggle.addEventListener('change', () => {
        localStorage.setItem('darkModeEnabled', darkModeToggle.checked);
        darkModeTypeSettings.style.display = darkModeToggle.checked ? 'flex' : 'none';
        updateDarkMode();
    });

    // 深色模式类型选择器事件监听
    darkModeTypeSelect.addEventListener('change', () => {
        localStorage.setItem('darkModeType', darkModeTypeSelect.value);
        updateDarkMode();
    });

    // 监听系统颜色方案变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('darkModeType') === 'system') {
            updateDarkMode();
        }
    });

    // --- 时间显示功能 ---

    /**
     * 更新时间显示
     */
    const updateTimeDisplay = () => {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();

        // 从 localStorage 加载时间显示相关设置
        const showTime = localStorage.getItem('showTime') === 'true' || false;
        const showSeconds = localStorage.getItem('showSeconds') === 'true';
        const timeFormat = localStorage.getItem('timeFormat') || '24h';
        const showAmpm = localStorage.getItem('showAmpm') || 'no';
        let timeColor = localStorage.getItem('timeColor') || 'white';

        // 处理自动颜色
        if (timeColor === 'auto') {
            const isDarkMode = document.body.classList.contains('dark-mode');
            timeColor = isDarkMode ? 'white' : 'black';
        }
        const timeWeight = localStorage.getItem('timeWeight') || 'normal';

        // 根据设置决定是否显示时间
        if (!showTime) {
            timeDisplay.style.display = 'none';
            return;
        } else {
            timeDisplay.style.display = 'block';
        }

        // 处理12小时制
        let ampm = '';
        if (timeFormat === '12h') {
            ampm = hours >= 12 ? ' PM' : ' AM';
            hours = hours % 12;
            hours = hours === 0 ? 12 : hours; // 0点应显示为12点
        }

        // 格式化时间，单位数前补零
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        // 构建时间字符串
        let timeString = `${hours}:${minutes}`;
        if (showSeconds) {
            timeString += `:${seconds}`;
        }
        if (timeFormat === '12h' && showAmpm === 'yes') {
            timeString += ampm;
        }

        // 更新页面显示
        timeDisplay.textContent = timeString;
        timeDisplay.className = `time-display ${timeColor}`; // 应用颜色类
        timeDisplay.style.fontWeight = timeWeight; // 应用字体粗细
    };

    /**
     * 加载并应用时间相关的保存设置
     */
    const loadTimeSettings = () => {
        showTimeCheckbox.checked = localStorage.getItem('showTime') === 'true' || false;
        showSecondsCheckbox.checked = localStorage.getItem('showSeconds') === 'true';
        timeFormatSelect.value = localStorage.getItem('timeFormat') || '24h';
        showAmpmSelect.value = localStorage.getItem('showAmpm') || 'no';
        timeColorSelect.value = localStorage.getItem('timeColor') || 'white';
        timeWeightSelect.value = localStorage.getItem('timeWeight') || 'normal';
        
        toggleTimeSubSettings(); // 根据主开关状态更新子选项可见性
        updateTimeDisplay();
    };

    /**
     * 根据“是否显示时间”的开关，切换时间相关子设置的可见性
     */
    const toggleTimeSubSettings = () => {
        const isTimeVisible = showTimeCheckbox.checked;
        timeFormatSettings.style.display = isTimeVisible ? 'flex' : 'none';
        // AM/PM 选项仅在12小时制下可见
        ampmDisplaySettings.style.display = (isTimeVisible && timeFormatSelect.value === '12h') ? 'flex' : 'none';
        timeFormatSelectContainer.style.display = isTimeVisible ? 'flex' : 'none';
        timeColorSettings.style.display = isTimeVisible ? 'flex' : 'none';
        timeWeightSettings.style.display = isTimeVisible ? 'flex' : 'none';
    };

    // 为所有时间设置项添加事件监听，并在更改时更新显示
    showTimeCheckbox.addEventListener('change', () => {
        localStorage.setItem('showTime', showTimeCheckbox.checked);
        toggleTimeSubSettings();
        updateTimeDisplay();
    });

    showSecondsCheckbox.addEventListener('change', () => {
        localStorage.setItem('showSeconds', showSecondsCheckbox.checked);
        updateTimeDisplay();
    });

    timeFormatSelect.addEventListener('change', () => {
        localStorage.setItem('timeFormat', timeFormatSelect.value);
        toggleTimeSubSettings(); // 切换12/24小时制时需要检查 AM/PM 的可见性
        updateTimeDisplay();
    });

    showAmpmSelect.addEventListener('change', () => {
        localStorage.setItem('showAmpm', showAmpmSelect.value);
        updateTimeDisplay();
    });

    timeColorSelect.addEventListener('change', () => {
        localStorage.setItem('timeColor', timeColorSelect.value);
        updateTimeDisplay();
    });

    timeWeightSelect.addEventListener('change', () => {
        localStorage.setItem('timeWeight', timeWeightSelect.value);
        updateTimeDisplay();
    });

    // --- 快速访问功能 ---

    /**
     * 初始化预设的快速访问链接（如果用户是第一次使用）
     */
    const initializePresetLinks = () => {
        if (localStorage.getItem('quickAccessLinks') === null) {
            const presetLinks = [
                {
                    title: 'GitHub',
                    url: 'https://github.com',
                    icon: './files/show-quick/github.ico'
                }
            ];
            localStorage.setItem('quickAccessLinks', JSON.stringify(presetLinks));
        }
    };

    /**
     * 从 localStorage 加载快速访问链接并渲染到页面
     */
    const loadQuickAccessLinks = () => {
        const links = JSON.parse(localStorage.getItem('quickAccessLinks') || '[]');
        quickAccessLinksContainer.innerHTML = ''; // 清空现有链接
        
        // 创建并添加“设置”这个特殊的系统链接
        const settingsLink = {
            title: '设置',
            url: 'settings://open', // 特殊 URL 用于内部处理
            icon: '',
            isSystem: true // 标记为系统链接
        };
        createQuickAccessLinkElement(settingsLink);
        
        // 创建并添加“添加”按钮
        const addLink = {
            title: '添加',
            url: '',
            icon: '',
            isSystem: true,
            isAddButton: true // 标记为添加按钮
        };
        createQuickAccessLinkElement(addLink);
        
        // 渲染所有用户保存的链接
        links.forEach(link => {
            createQuickAccessLinkElement(link);
        });
    };
    
    /**
     * 加载并应用快速访问的保存设置
     */
    const loadQuickAccessSettings = () => {
        const showQuickAccess = localStorage.getItem('showQuickAccess') !== 'false'; // 默认显示
        showQuickAccessCheckbox.checked = showQuickAccess;
        quickAccessOpenTypeSelect.value = localStorage.getItem('quickAccessOpenType') || '_blank';
        
        // 加载标题显示设置
        const showTitle = localStorage.getItem('showQuickAccessTitle') !== 'false';
        showQuickAccessTitleCheckbox.checked = showTitle;
        quickAccessTitleColorSelect.value = localStorage.getItem('quickAccessTitleColor') || 'black';

        toggleQuickAccessSubSettings(); // 根据主开关状态更新子选项可见性
        applyQuickAccessTitleSettings(); // 应用标题样式
    };

    /**
     * 根据“是否显示快速访问”的开关，切换相关子设置的可见性
     */
    const toggleQuickAccessSubSettings = () => {
        const isVisible = showQuickAccessCheckbox.checked;
        quickAccessContainer.style.display = isVisible ? 'block' : 'none';
        floatingSettingsButton.style.display = isVisible ? 'none' : 'flex';
        quickAccessOpenTypeSettings.style.display = isVisible ? 'flex' : 'none';
        quickAccessTitleDisplaySettings.style.display = isVisible ? 'flex' : 'none';
        
        // 标题颜色设置仅在“显示标题”开启时可见
        const isTitleVisible = showQuickAccessTitleCheckbox.checked;
        quickAccessTitleColorSettings.style.display = (isVisible && isTitleVisible) ? 'flex' : 'none';
    };

    /**
     * 应用快速访问标题的显示和颜色设置
     */
    const applyQuickAccessTitleSettings = () => {
        const showTitle = showQuickAccessTitleCheckbox.checked;
        let titleColor = quickAccessTitleColorSelect.value;

        // 处理自动颜色
        if (titleColor === 'auto') {
            const isDarkMode = document.body.classList.contains('dark-mode');
            titleColor = isDarkMode ? 'white' : 'black';
        }

        quickAccessLinksContainer.classList.toggle('hide-title', !showTitle);
        
        quickAccessLinksContainer.classList.remove('title-white', 'title-black');
        if (showTitle) {
            quickAccessLinksContainer.classList.add(`title-${titleColor}`);
        }
    };

    /**
     * 创建单个快速访问链接的 DOM 元素
     * @param {object} link - 链接对象 {title, url, icon, isSystem, isAddButton}
     */
    const createQuickAccessLinkElement = (link) => {
        const linkElement = document.createElement('div');
        linkElement.className = 'quick-access-link';
        if (link.isSystem) {
            linkElement.classList.add('system-link');
        } else {
            linkElement.draggable = true; // 只有非系统链接可以拖动
        }
        linkElement.dataset.url = link.url; // 将 URL 存储在 data 属性中
        
        // 创建图标元素
        const iconElement = document.createElement('div');
        iconElement.className = 'link-icon';
        
        if (link.icon) {
            // 如果提供了自定义图标 URL
            iconElement.style.backgroundImage = `url(${link.icon})`;
            iconElement.style.backgroundSize = 'cover';
            iconElement.style.backgroundPosition = 'center';
            iconElement.textContent = '';
        } else if (link.isSystem && link.title === '设置') {
            // “设置”链接的特殊图标
            iconElement.innerHTML = '<span class="material-symbols-outlined">settings</span>';
            iconElement.style.backgroundColor = '#666';
        } else if (link.isAddButton) {
            // “添加”按钮的特殊样式
            iconElement.textContent = '+';
            iconElement.style.backgroundColor = '#4CAF50';
            iconElement.style.fontSize = '18px';
            iconElement.style.lineHeight = '36px';
        } else {
            // 尝试获取网站的 favicon
            try {
                const url = new URL(link.url);
                const faviconUrl = `${url.protocol}//${url.hostname}/favicon.ico`;
                iconElement.style.backgroundImage = `url(${faviconUrl})`;
                iconElement.style.backgroundSize = 'cover';
                iconElement.style.backgroundPosition = 'center';
                iconElement.textContent = '';

                // 如果 favicon 加载失败，则回退到默认图标
                const img = new Image();
                img.src = faviconUrl;
                img.onerror = () => {
                    const firstChar = link.title.charAt(0).toUpperCase();
                    iconElement.textContent = firstChar;
                    iconElement.style.backgroundImage = '';
                    // 根据标题生成一个伪随机的背景色
                    const colors = ['#4285f4', '#ea4335', '#fbbc05', '#34a853', '#1a73e8', '#d93025', '#f28b82', '#fdd663', '#81c995', '#8ab4f8'];
                    const colorIndex = Math.abs(link.title.charCodeAt(0)) % colors.length;
                    iconElement.style.backgroundColor = colors[colorIndex];
                };
            } catch (e) {
                 // 如果 URL 无效，直接使用默认图标
                const firstChar = link.title.charAt(0).toUpperCase();
                iconElement.textContent = firstChar;
                const colors = ['#4285f4', '#ea4335', '#fbbc05', '#34a853', '#1a73e8', '#d93025', '#f28b82', '#fdd663', '#81c995', '#8ab4f8'];
                const colorIndex = Math.abs(link.title.charCodeAt(0)) % colors.length;
                iconElement.style.backgroundColor = colors[colorIndex];
            }
        }
        
        // 创建标题元素
        const titleElement = document.createElement('div');
        titleElement.className = 'link-title';
        titleElement.textContent = link.title;
        
        // 为非系统链接添加右键、长按和拖拽事件
        if (!link.isSystem) {
            let pressTimer; // 用于检测长按

            // 右键菜单
            linkElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showContextMenu(e.pageX, e.pageY, link);
            });

            // 移动端长按事件模拟
            linkElement.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'touch') {
                    pressTimer = setTimeout(() => {
                        showContextMenu(e.pageX, e.pageY, link);
                    }, 500); // 500毫秒算作长按
                }
            });
            linkElement.addEventListener('pointerup', () => clearTimeout(pressTimer));
            linkElement.addEventListener('pointerleave', () => clearTimeout(pressTimer));

            // 桌面端拖拽事件
            linkElement.addEventListener('dragstart', handleDragStart);
            linkElement.addEventListener('dragover', handleDragOver);
            linkElement.addEventListener('dragleave', handleDragLeave);
            linkElement.addEventListener('drop', handleDrop);
            linkElement.addEventListener('dragend', handleDragEnd);

            // 移动端触摸拖拽事件
            linkElement.addEventListener('touchstart', handleTouchStart, { passive: true });
            linkElement.addEventListener('touchmove', handleTouchMove, { passive: false });
            linkElement.addEventListener('touchend', handleTouchEnd);
        }
        
        // 组装元素
        linkElement.appendChild(iconElement);
        linkElement.appendChild(titleElement);
        
        // 添加点击事件
        if (link.isSystem && link.title === '设置') {
            linkElement.addEventListener('click', () => {
                settingsModal.style.display = 'block'; // 打开设置
            });
        } else if (link.isAddButton) {
            linkElement.addEventListener('click', () => {
                openQuickAccessModalForAdd(); // 打开添加链接模态框
            });
        } else {
            linkElement.addEventListener('click', () => {
                const openType = localStorage.getItem('quickAccessOpenType') || '_blank';
                window.open(link.url, openType);
            });
        }
        
        quickAccessLinksContainer.appendChild(linkElement);
    };
    
    /**
     * 打开用于“添加”新链接的模态框
     */
    const openQuickAccessModalForAdd = () => {
        quickAccessModalTitle.textContent = '添加快速访问';
        quickAccessOriginalUrlInput.value = ''; // 清空原始URL，表示是添加模式
        quickAccessTitleInput.value = '';
        quickAccessUrlInput.value = '';
        quickAccessIconInput.value = '';
        quickAccessModal.style.display = 'block';
    };

    /**
     * 打开用于“编辑”现有链接的模态框
     * @param {object} link - 要编辑的链接对象
     */
    const openQuickAccessModalForEdit = (link) => {
        quickAccessModalTitle.textContent = '编辑快速访问';
        quickAccessOriginalUrlInput.value = link.url; // 存储原始URL，用于查找和替换
        quickAccessTitleInput.value = link.title;
        quickAccessUrlInput.value = link.url;
        quickAccessIconInput.value = link.icon || '';
        quickAccessModal.style.display = 'block';
    };

    /**
     * 保存快速访问链接（添加或编辑）
     */
    const saveQuickAccessLink = () => {
        const title = quickAccessTitleInput.value.trim();
        let url = quickAccessUrlInput.value.trim();
        const icon = quickAccessIconInput.value.trim();
        const originalUrl = quickAccessOriginalUrlInput.value;

        if (!title || !url) {
            alert('请输入标题和网址');
            return;
        }

        // 自动为 URL 添加协议头
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
            url = 'https://' + url;
        }

        const links = JSON.parse(localStorage.getItem('quickAccessLinks') || '[]');

        if (originalUrl) {
            // 编辑模式
            const existingIndex = links.findIndex(link => link.url === originalUrl);
            if (existingIndex !== -1) {
                links[existingIndex] = { title, url, icon };
            }
        } else {
            // 添加模式
            const existingLink = links.find(link => link.url === url || link.title === title);
            if (existingLink) {
                alert('已存在具有相同标题或网址的链接。');
                return;
            }
            links.push({ title, url, icon });
        }

        localStorage.setItem('quickAccessLinks', JSON.stringify(links));
        loadQuickAccessLinks(); // 重新加载链接以显示更改

        // 清空输入框并关闭模态框
        quickAccessTitleInput.value = '';
        quickAccessUrlInput.value = '';
        quickAccessIconInput.value = '';
        quickAccessOriginalUrlInput.value = '';
        quickAccessModal.style.display = 'none';
    };
    
    /**
     * 删除指定的快速访问链接
     * @param {string} title - 要删除链接的标题
     * @param {string} url - 要删除链接的URL
     */
    const deleteQuickAccessLink = (title, url) => {
        if (confirm(`确定要删除 "${title}" 吗？`)) {
            const links = JSON.parse(localStorage.getItem('quickAccessLinks') || '[]');
            const filteredLinks = links.filter(link => !(link.title === title && link.url === url));
            localStorage.setItem('quickAccessLinks', JSON.stringify(filteredLinks));
            loadQuickAccessLinks(); // 重新加载
        }
    };
    
    // --- 快速访问模态框的控制事件 ---
    closeQuickAccessModal.addEventListener('click', () => {
        quickAccessModal.style.display = 'none';
    });
    
    cancelQuickAccessButton.addEventListener('click', () => {
        quickAccessModal.style.display = 'none';
    });
    
    saveQuickAccessButton.addEventListener('click', saveQuickAccessLink);
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === quickAccessModal) {
            quickAccessModal.style.display = 'none';
        }
    });
    
    // 在URL输入框按回车键保存
    quickAccessUrlInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            saveQuickAccessLink();
        }
    });

    // --- 快速访问设置事件 ---
    showQuickAccessCheckbox.addEventListener('change', () => {
        localStorage.setItem('showQuickAccess', showQuickAccessCheckbox.checked);
        toggleQuickAccessSubSettings();
    });

    quickAccessOpenTypeSelect.addEventListener('change', () => {
        localStorage.setItem('quickAccessOpenType', quickAccessOpenTypeSelect.value);
    });

    showQuickAccessTitleCheckbox.addEventListener('change', () => {
        localStorage.setItem('showQuickAccessTitle', showQuickAccessTitleCheckbox.checked);
        toggleQuickAccessSubSettings(); // 需要切换颜色选择器的可见性
        applyQuickAccessTitleSettings();
    });

    quickAccessTitleColorSelect.addEventListener('change', () => {
        localStorage.setItem('quickAccessTitleColor', quickAccessTitleColorSelect.value);
        applyQuickAccessTitleSettings();
    });

    // --- 悬浮设置按钮事件 ---
    floatingSettingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });

    // --- 页面初始化调用 ---
    loadBackgroundSettings(); // 加载背景设置
    loadTimeSettings(); // 加载时间设置
    loadDarkModeSettings(); // 加载深色模式设置
    loadQuickAccessSettings(); // 加载快速访问设置
    setInterval(updateTimeDisplay, 1000); // 每秒更新一次时间
    
    /**
     * 清理旧版本可能残留的默认链接
     */
    const cleanupDefaultLinks = () => {
        const links = JSON.parse(localStorage.getItem('quickAccessLinks') || '[]');
        const defaultLinkUrls = ['https://www.google.com', 'https://www.youtube.com', 'https://www.github.com'];
        
        const hasDefaultLinks = links.some(link => defaultLinkUrls.includes(link.url));
        
        if (hasDefaultLinks) {
            const filteredLinks = links.filter(link => !defaultLinkUrls.includes(link.url));
            localStorage.setItem('quickAccessLinks', JSON.stringify(filteredLinks));
        }
    };
    
    // --- 上下文菜单（右键菜单）功能 ---

    /**
     * 在指定位置显示上下文菜单
     * @param {number} x - 屏幕 x 坐标
     * @param {number} y - 屏幕 y 坐标
     * @param {object} link - 关联的链接对象
     */
    const showContextMenu = (x, y, link) => {
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;

        // 为菜单项动态绑定事件
        editLinkButton.onclick = () => {
            openQuickAccessModalForEdit(link);
            hideContextMenu();
        };
        deleteLinkButton.onclick = () => {
            deleteQuickAccessLink(link.title, link.url);
            hideContextMenu();
        };
    };

    /**
     * 隐藏上下文菜单
     */
    const hideContextMenu = () => {
        contextMenu.style.display = 'none';
    };

    // 点击页面任何其他地方都会关闭上下文菜单
    window.addEventListener('click', () => {
        hideContextMenu();
    });

    // --- 更多初始化调用 ---
    cleanupDefaultLinks(); // 清理旧的默认链接
    initializePresetLinks(); // 初始化预设链接
    loadQuickAccessLinks(); // 加载快速访问链接

    // --- 拖拽排序功能 (桌面端) ---
    let draggedItem = null; // 用于存储当前正在拖动的元素

    function handleDragStart(e) {
        draggedItem = this;
        setTimeout(() => {
            this.style.display = 'none'; // 拖动时暂时隐藏原元素
        }, 0);
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(e) {
        e.preventDefault(); // 必须阻止默认行为才能触发 drop
        this.classList.add('drag-over'); // 添加视觉反馈
    }

    function handleDragLeave(e) {
        this.classList.remove('drag-over'); // 移除视觉反馈
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        if (draggedItem !== this) {
            // 更新 localStorage 中的链接顺序
            const links = JSON.parse(localStorage.getItem('quickAccessLinks') || '[]');
            const fromIndex = links.findIndex(link => link.url === draggedItem.dataset.url);
            const toIndex = links.findIndex(link => link.url === this.dataset.url);

            if (fromIndex !== -1 && toIndex !== -1) {
                const [movedItem] = links.splice(fromIndex, 1); // 移除拖动的项
                links.splice(toIndex, 0, movedItem); // 在目标位置插入
                localStorage.setItem('quickAccessLinks', JSON.stringify(links));
                loadQuickAccessLinks(); // 重新渲染
            }
        }
    }

    function handleDragEnd() {
        // 拖动结束后清理
        if (draggedItem) {
            draggedItem.style.display = ''; // 恢复显示
            draggedItem = null;
        }
        document.querySelectorAll('.quick-access-link').forEach(link => {
            link.classList.remove('drag-over');
        });
    }

    // --- 触摸拖拽排序功能 (移动端) ---
    let touchDraggedItem = null;

    function handleTouchStart(e) {
        if (this.classList.contains('system-link')) return; // 系统链接不可拖动
        touchDraggedItem = this;
        // 添加视觉反馈
        this.style.opacity = '0.5';
        this.style.transform = 'scale(1.1)';
    }

    function handleTouchMove(e) {
        if (!touchDraggedItem) return;
        e.preventDefault(); // 阻止页面滚动

        const touch = e.touches[0];
        // 暂时隐藏拖动元素，以获取其下方的元素
        touchDraggedItem.style.display = 'none';
        const overElement = document.elementFromPoint(touch.clientX, touch.clientY);
        touchDraggedItem.style.display = ''; // 恢复显示

        // 移除所有旧的视觉反馈
        document.querySelectorAll('.quick-access-link').forEach(link => {
            link.classList.remove('drag-over');
        });

        if (overElement) {
            const targetLink = overElement.closest('.quick-access-link:not(.system-link)');
            if (targetLink && targetLink !== touchDraggedItem) {
                targetLink.classList.add('drag-over'); // 添加新的视觉反馈
            }
        }
    }

    function handleTouchEnd(e) {
        if (!touchDraggedItem) return;

        // 恢复样式
        touchDraggedItem.style.opacity = '1';
        touchDraggedItem.style.transform = 'scale(1)';

        const touch = e.changedTouches[0];
        // 再次隐藏以准确找到最终的目标元素
        touchDraggedItem.style.display = 'none';
        const overElement = document.elementFromPoint(touch.clientX, touch.clientY);
        touchDraggedItem.style.display = '';

        if (overElement) {
            const targetLink = overElement.closest('.quick-access-link:not(.system-link)');
            if (targetLink && targetLink !== touchDraggedItem) {
                // 与桌面端 drop 逻辑相同，更新数据并重新渲染
                const links = JSON.parse(localStorage.getItem('quickAccessLinks') || '[]');
                const fromIndex = links.findIndex(link => link.url === touchDraggedItem.dataset.url);
                const toIndex = links.findIndex(link => link.url === targetLink.dataset.url);

                if (fromIndex !== -1 && toIndex !== -1) {
                    const [movedItem] = links.splice(fromIndex, 1);
                    links.splice(toIndex, 0, movedItem);
                    localStorage.setItem('quickAccessLinks', JSON.stringify(links));
                    loadQuickAccessLinks();
                }
            }
        }

        // 清理
        document.querySelectorAll('.quick-access-link').forEach(link => {
            link.classList.remove('drag-over');
        });
        touchDraggedItem = null;
    }
});
