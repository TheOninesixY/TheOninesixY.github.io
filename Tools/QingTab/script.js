document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const settingsModal = document.getElementById('settings-modal');
    const closeModal = document.querySelector('#settings-modal .close');
    const searchEngineSelect = document.getElementById('search-engine');
    const changeBgButton = document.getElementById('change-bg');
    const bgFileInput = document.getElementById('bg-file-input');
    const currentBgSpan = document.getElementById('current-bg');

    // Time display elements
    const timeDisplay = document.getElementById('time-display');
    const showTimeCheckbox = document.getElementById('show-time');
    const showSecondsCheckbox = document.getElementById('show-seconds');
    const timeFormatSelect = document.getElementById('time-format');
    const showAmpmSelect = document.getElementById('show-ampm');
    const timeColorSelect = document.getElementById('time-color');
    const timeWeightSelect = document.getElementById('time-weight');

    const timeFormatSettings = document.getElementById('time-format-settings');
    const ampmDisplaySettings = document.getElementById('ampm-display-settings');
    const timeFormatSelectContainer = document.getElementById('time-format-select-container');
    const timeColorSettings = document.getElementById('time-color-settings');
    const timeWeightSettings = document.getElementById('time-weight-settings');

    // Dark mode elements
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeTypeSelect = document.getElementById('dark-mode-type');
    const darkModeTypeSettings = document.getElementById('dark-mode-type-settings');

    // 快速访问元素
    const quickAccessLinksContainer = document.getElementById('quick-access-links');
    const quickAccessModal = document.getElementById('quick-access-modal');
    const closeQuickAccessModal = document.getElementById('close-quick-access-modal');
    const saveQuickAccessButton = document.getElementById('save-quick-access');
    const cancelQuickAccessButton = document.getElementById('cancel-quick-access');
    const quickAccessTitleInput = document.getElementById('quick-access-title');
    const quickAccessUrlInput = document.getElementById('quick-access-url');
    const quickAccessIconInput = document.getElementById('quick-access-icon');
    const quickAccessModalTitle = document.getElementById('quick-access-modal-title');
    const quickAccessOriginalUrlInput = document.getElementById('quick-access-original-url');

    // 上下文菜单元素
    const contextMenu = document.getElementById('context-menu');
    const editLinkButton = document.getElementById('edit-link');
    const deleteLinkButton = document.getElementById('delete-link');


    // Load saved preferences
    const savedSearchEngine = localStorage.getItem('searchEngine') || 'google';
    searchEngineSelect.value = savedSearchEngine;

    // Load saved background image
    const savedBgImage = localStorage.getItem('bgImage');
    if (savedBgImage) {
        document.body.style.backgroundImage = `url(${savedBgImage})`;
        currentBgSpan.textContent = '自定义';
    }

    const performSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            // Check if the query is a URL
            if (query.startsWith('http://') || query.startsWith('https://')) {
                window.location.href = query;
            } else if (query.includes('.')) { // Simple check for potential domain
                window.location.href = `https://${query}`;
            } else {
                // Use selected search engine
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
                    default: // google
                        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                }
                window.location.href = searchUrl;
            }
        }
    };

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    // Settings modal functionality
    closeModal.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // Save search engine preference
    searchEngineSelect.addEventListener('change', () => {
        localStorage.setItem('searchEngine', searchEngineSelect.value);
    });

    // Background image change functionality
    changeBgButton.addEventListener('click', () => {
        bgFileInput.click();
    });

    bgFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                document.body.style.backgroundImage = `url(${imageUrl})`;
                localStorage.setItem('bgImage', imageUrl);
                currentBgSpan.textContent = '自定义';
            };
            reader.readAsDataURL(file);
        }
    });

    // Reset background image functionality
    const resetBgButton = document.getElementById('reset-bg');
    resetBgButton.addEventListener('click', () => {
        document.body.style.backgroundImage = '';
        localStorage.removeItem('bgImage');
        currentBgSpan.textContent = '默认';
    });

    // Dark mode functionality
    const applyDarkMode = (isDarkMode) => {
        document.body.classList.toggle('dark-mode', isDarkMode);
        
        // Update time color automatically if in dark mode with light background
        if (isDarkMode && timeColorSelect.value === 'white') {
            timeDisplay.className = `time-display ${timeColorSelect.value} dark-mode`;
        } else {
            timeDisplay.className = `time-display ${timeColorSelect.value}`;
        }
    };

    const checkSystemDarkMode = () => {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    const updateDarkMode = () => {
        const darkModeEnabled = localStorage.getItem('darkModeEnabled') === 'true';
        const darkModeType = localStorage.getItem('darkModeType') || 'dark';
        
        if (darkModeType === 'system') {
            const systemDarkMode = checkSystemDarkMode();
            applyDarkMode(systemDarkMode);
        } else {
            applyDarkMode(darkModeEnabled);
        }
    };

    const loadDarkModeSettings = () => {
        darkModeToggle.checked = localStorage.getItem('darkModeEnabled') === 'true';
        darkModeTypeSelect.value = localStorage.getItem('darkModeType') || 'dark';
        
        // 隐藏/显示深色模式类型选择器
        darkModeTypeSettings.style.display = darkModeToggle.checked ? 'flex' : 'none';
        
        updateDarkMode();
    };

    darkModeToggle.addEventListener('change', () => {
        localStorage.setItem('darkModeEnabled', darkModeToggle.checked);
        darkModeTypeSettings.style.display = darkModeToggle.checked ? 'flex' : 'none';
        updateDarkMode();
    });

    darkModeTypeSelect.addEventListener('change', () => {
        localStorage.setItem('darkModeType', darkModeTypeSelect.value);
        updateDarkMode();
    });

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('darkModeType') === 'system') {
            updateDarkMode();
        }
    });

    // Today's Bing wallpaper functionality
    const todayBingWallpaperButton = document.getElementById('todaybingwallpaper');
    todayBingWallpaperButton.addEventListener('click', () => {
        const bingWallpaperUrl = 'https://bing.img.run/uhd.php';
        document.body.style.backgroundImage = `url(${bingWallpaperUrl})`;
        localStorage.setItem('bgImage', bingWallpaperUrl);
        currentBgSpan.textContent = '必应壁纸';
    });

    // Time display functionality
    const updateTimeDisplay = () => {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();

        const showTime = localStorage.getItem('showTime') === 'true';
        const showSeconds = localStorage.getItem('showSeconds') === 'true';
        const timeFormat = localStorage.getItem('timeFormat') || '24h';
        const showAmpm = localStorage.getItem('showAmpm') || 'no';
        const timeColor = localStorage.getItem('timeColor') || 'white';
        const timeWeight = localStorage.getItem('timeWeight') || 'normal';

        if (!showTime) {
            timeDisplay.style.display = 'none';
            return;
        } else {
            timeDisplay.style.display = 'block';
        }

        let ampm = '';
        if (timeFormat === '12h') {
            ampm = hours >= 12 ? ' PM' : ' AM';
            hours = hours % 12;
            hours = hours === 0 ? 12 : hours; // the hour '0' should be '12'
        }

        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        let timeString = `${hours}:${minutes}`;
        if (showSeconds) {
            timeString += `:${seconds}`;
        }
        if (timeFormat === '12h' && showAmpm === 'yes') {
            timeString += ampm;
        }

        timeDisplay.textContent = timeString;
        timeDisplay.className = `time-display ${timeColor}`;
        timeDisplay.style.fontWeight = timeWeight;
    };

    const loadTimeSettings = () => {
        showTimeCheckbox.checked = localStorage.getItem('showTime') === 'true';
        showSecondsCheckbox.checked = localStorage.getItem('showSeconds') === 'true';
        timeFormatSelect.value = localStorage.getItem('timeFormat') || '24h';
        showAmpmSelect.value = localStorage.getItem('showAmpm') || 'no';
        timeColorSelect.value = localStorage.getItem('timeColor') || 'white';
        timeWeightSelect.value = localStorage.getItem('timeWeight') || 'normal';
        
        toggleTimeSubSettings();
        updateTimeDisplay();
    };

    const toggleTimeSubSettings = () => {
        const isTimeVisible = showTimeCheckbox.checked;
        timeFormatSettings.style.display = isTimeVisible ? 'flex' : 'none';
        ampmDisplaySettings.style.display = (isTimeVisible && timeFormatSelect.value === '12h') ? 'flex' : 'none';
        timeFormatSelectContainer.style.display = isTimeVisible ? 'flex' : 'none';
        timeColorSettings.style.display = isTimeVisible ? 'flex' : 'none';
        timeWeightSettings.style.display = isTimeVisible ? 'flex' : 'none';
    };

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
        toggleTimeSubSettings();
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

    // 快速访问功能
    const loadQuickAccessLinks = () => {
        const links = JSON.parse(localStorage.getItem('quickAccessLinks') || '[]');
        quickAccessLinksContainer.innerHTML = '';
        
        // 添加设置链接（不可删除）
        const settingsLink = {
            title: '设置',
            url: 'settings://open',
            icon: '',
            isSystem: true
        };
        createQuickAccessLinkElement(settingsLink);
        
        // 添加添加按钮链接（不可删除）
        const addLink = {
            title: '添加',
            url: '',
            icon: '',
            isSystem: true,
            isAddButton: true
        };
        createQuickAccessLinkElement(addLink);
        
        links.forEach(link => {
            createQuickAccessLinkElement(link);
        });
    };
    
    const createQuickAccessLinkElement = (link) => {
        const linkElement = document.createElement('div');
        linkElement.className = 'quick-access-link';
        if (link.isSystem) {
            linkElement.classList.add('system-link');
        } else {
            linkElement.draggable = true; // 使非系统链接可拖动
        }
        linkElement.dataset.url = link.url;
        
        // 创建图标元素
        const iconElement = document.createElement('div');
        iconElement.className = 'link-icon';
        
        if (link.icon) {
            // 使用自定义图标
            iconElement.style.backgroundImage = `url(${link.icon})`;
            iconElement.style.backgroundSize = 'cover';
            iconElement.style.backgroundPosition = 'center';
            iconElement.textContent = '';
        } else if (link.isSystem && link.title === '设置') {
            // 为设置链接使用特殊图标
            iconElement.innerHTML = '<span class="material-symbols-outlined">settings</span>';
            iconElement.style.backgroundColor = '#666';
        } else if (link.isAddButton) {
            // 为添加按钮使用特殊样式
            iconElement.textContent = '+';
            iconElement.style.backgroundColor = '#4CAF50';
            iconElement.style.fontSize = '18px';
            iconElement.style.lineHeight = '36px';
        } else {
            // 使用默认图标（标题的第一个字符）
            const firstChar = link.title.charAt(0).toUpperCase();
            iconElement.textContent = firstChar;
            
            // 为不同的链接生成不同的背景色
            const colors = ['#4285f4', '#ea4335', '#fbbc05', '#34a853', '#1a73e8', '#d93025', '#f28b82', '#fdd663', '#81c995', '#8ab4f8'];
            const colorIndex = Math.abs(link.title.charCodeAt(0)) % colors.length;
            iconElement.style.backgroundColor = colors[colorIndex];
        }
        
        // 创建标题元素
        const titleElement = document.createElement('div');
        titleElement.className = 'link-title';
        titleElement.textContent = link.title;
        
        if (!link.isSystem) {
            // 添加右键和长按事件
            let pressTimer;

            linkElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showContextMenu(e.pageX, e.pageY, link);
            });

            linkElement.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'touch') {
                    pressTimer = setTimeout(() => {
                        showContextMenu(e.pageX, e.pageY, link);
                    }, 500); // 500ms for long press
                }
            });

            linkElement.addEventListener('pointerup', () => {
                clearTimeout(pressTimer);
            });

            linkElement.addEventListener('pointerleave', () => {
                clearTimeout(pressTimer);
            });

            // 添加拖拽事件
            linkElement.addEventListener('dragstart', handleDragStart);
            linkElement.addEventListener('dragover', handleDragOver);
            linkElement.addEventListener('dragleave', handleDragLeave);
            linkElement.addEventListener('drop', handleDrop);
            linkElement.addEventListener('dragend', handleDragEnd);
        }
        
        // 将元素添加到容器中
        linkElement.appendChild(iconElement);
        linkElement.appendChild(titleElement);
        
        // 添加点击事件
        if (link.isSystem && link.title === '设置') {
            linkElement.addEventListener('click', () => {
                settingsModal.style.display = 'block';
            });
        } else if (link.isAddButton) {
            linkElement.addEventListener('click', () => {
                openQuickAccessModalForAdd();
            });
        } else {
            linkElement.addEventListener('click', () => {
                window.open(link.url, '_blank');
            });
        }
        
        quickAccessLinksContainer.appendChild(linkElement);
    };
    
    const openQuickAccessModalForAdd = () => {
        quickAccessModalTitle.textContent = '添加快速访问';
        quickAccessOriginalUrlInput.value = '';
        quickAccessTitleInput.value = '';
        quickAccessUrlInput.value = '';
        quickAccessIconInput.value = '';
        quickAccessModal.style.display = 'block';
    };

    const openQuickAccessModalForEdit = (link) => {
        quickAccessModalTitle.textContent = '编辑快速访问';
        quickAccessOriginalUrlInput.value = link.url;
        quickAccessTitleInput.value = link.title;
        quickAccessUrlInput.value = link.url;
        quickAccessIconInput.value = link.icon || '';
        quickAccessModal.style.display = 'block';
    };

    const saveQuickAccessLink = () => {
        const title = quickAccessTitleInput.value.trim();
        let url = quickAccessUrlInput.value.trim();
        const icon = quickAccessIconInput.value.trim();
        const originalUrl = quickAccessOriginalUrlInput.value;

        if (!title || !url) {
            alert('请输入标题和网址');
            return;
        }

        // 确保URL有协议
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
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
        loadQuickAccessLinks();

        // 清空输入框并关闭模态框
        quickAccessTitleInput.value = '';
        quickAccessUrlInput.value = '';
        quickAccessIconInput.value = '';
        quickAccessOriginalUrlInput.value = '';
        quickAccessModal.style.display = 'none';
    };
    
    const deleteQuickAccessLink = (title, url) => {
        if (confirm(`确定要删除 "${title}" 吗？`)) {
            const links = JSON.parse(localStorage.getItem('quickAccessLinks') || '[]');
            const filteredLinks = links.filter(link => !(link.title === title && link.url === url));
            localStorage.setItem('quickAccessLinks', JSON.stringify(filteredLinks));
            loadQuickAccessLinks();
        }
    };
    
    // 快速访问模态框控制
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
    
    // 按Enter键保存
    quickAccessUrlInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            saveQuickAccessLink();
        }
    });

    // Initial load of time settings and start updating time
    loadTimeSettings();
    loadDarkModeSettings();
    setInterval(updateTimeDisplay, 1000);
    
    // 清理默认链接函数
    const cleanupDefaultLinks = () => {
        const links = JSON.parse(localStorage.getItem('quickAccessLinks') || '[]');
        const defaultLinkUrls = ['https://www.google.com', 'https://www.youtube.com', 'https://www.github.com'];
        
        // 检查是否存在默认链接
        const hasDefaultLinks = links.some(link => defaultLinkUrls.includes(link.url));
        
        if (hasDefaultLinks) {
            // 过滤掉默认链接
            const filteredLinks = links.filter(link => !defaultLinkUrls.includes(link.url));
            localStorage.setItem('quickAccessLinks', JSON.stringify(filteredLinks));
        }
    };
    

    // 上下文菜单功能
    const showContextMenu = (x, y, link) => {
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;

        // 传递链接数据到菜单按钮
        editLinkButton.onclick = () => {
            openQuickAccessModalForEdit(link);
            hideContextMenu();
        };
        deleteLinkButton.onclick = () => {
            deleteQuickAccessLink(link.title, link.url);
            hideContextMenu();
        };
    };

    const hideContextMenu = () => {
        contextMenu.style.display = 'none';
    };

    window.addEventListener('click', () => {
        hideContextMenu();
    });
    // 清理默认链接
    cleanupDefaultLinks();
    
    // 加载快速访问链接
    loadQuickAccessLinks();

    // 拖拽功能实现
    let draggedItem = null;

    function handleDragStart(e) {
        draggedItem = this;
        setTimeout(() => {
            this.style.display = 'none';
        }, 0);
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        if (draggedItem !== this) {
            const links = JSON.parse(localStorage.getItem('quickAccessLinks') || '[]');
            const fromIndex = links.findIndex(link => link.url === draggedItem.dataset.url);
            const toIndex = links.findIndex(link => link.url === this.dataset.url);

            if (fromIndex !== -1 && toIndex !== -1) {
                const [movedItem] = links.splice(fromIndex, 1);
                links.splice(toIndex, 0, movedItem);
                localStorage.setItem('quickAccessLinks', JSON.stringify(links));
                loadQuickAccessLinks();
            }
        }
    }

    function handleDragEnd() {
        if (draggedItem) {
            draggedItem.style.display = '';
            draggedItem = null;
        }
        document.querySelectorAll('.quick-access-link').forEach(link => {
            link.classList.remove('drag-over');
        });
    }
});
