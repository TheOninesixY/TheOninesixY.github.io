document.addEventListener('DOMContentLoaded', () => {
    // --- 应用程序主对象 ---
    const App = {
        // --- DOM 元素引用 ---
        DOM: {
            // 搜索
            searchInput: document.getElementById('search-input'),
            searchButton: document.getElementById('search-button'),
            // 设置模态框
            settingsModal: document.getElementById('settings-modal'),
            closeSettingsModal: document.querySelector('#settings-modal .close'),
            searchEngineSelect: document.getElementById('search-engine'),
            searchOpenTypeSelect: document.getElementById('search-open-type'),
            // 背景
            bgFileInput: document.getElementById('bg-file-input'),
            bgImageSelect: document.getElementById('bg-image-select'),
            // 时间
            timeDisplay: document.getElementById('time-display'),
            showTimeCheckbox: document.getElementById('show-time'),
            showSecondsCheckbox: document.getElementById('show-seconds'),
            timeFormatSelect: document.getElementById('time-format'),
            showAmpmSelect: document.getElementById('show-ampm'),
            timeColorSelect: document.getElementById('time-color'),
            timeWeightSelect: document.getElementById('time-weight'),
            timeFormatSettings: document.getElementById('time-format-settings'),
            ampmDisplaySettings: document.getElementById('ampm-display-settings'),
            timeFormatSelectContainer: document.getElementById('time-format-select-container'),
            timeColorSettings: document.getElementById('time-color-settings'),
            timeWeightSettings: document.getElementById('time-weight-settings'),
            // 深色模式
            darkModeToggle: document.getElementById('dark-mode-toggle'),
            darkModeTypeSelect: document.getElementById('dark-mode-type'),
            darkModeTypeSettings: document.getElementById('dark-mode-type-settings'),
            // 快速访问
            quickAccessContainer: document.querySelector('.quick-access-container'),
            quickAccessLinksContainer: document.getElementById('quick-access-links'),
            // 快速访问模态框
            quickAccessModal: document.getElementById('quick-access-modal'),
            closeQuickAccessModal: document.getElementById('close-quick-access-modal'),
            saveQuickAccessButton: document.getElementById('save-quick-access'),
            cancelQuickAccessButton: document.getElementById('cancel-quick-access'),
            quickAccessTitleInput: document.getElementById('quick-access-title'),
            quickAccessUrlInput: document.getElementById('quick-access-url'),
            quickAccessIconInput: document.getElementById('quick-access-icon'),
            quickAccessModalTitle: document.getElementById('quick-access-modal-title'),
            quickAccessOriginalUrlInput: document.getElementById('quick-access-original-url'),
            // 快速访问设置
            showQuickAccessCheckbox: document.getElementById('show-quick-access'),
            quickAccessOpenTypeSelect: document.getElementById('quick-access-open-type'),
            quickAccessOpenTypeSettings: document.getElementById('quick-access-open-type-settings'),
            showQuickAccessTitleCheckbox: document.getElementById('show-quick-access-title'),
            quickAccessTitleColorSelect: document.getElementById('quick-access-title-color'),
            quickAccessTitleDisplaySettings: document.getElementById('quick-access-title-display-settings'),
            quickAccessTitleColorSettings: document.getElementById('quick-access-title-color-settings'),
            // 上下文菜单
            contextMenu: document.getElementById('context-menu'),
            editLinkButton: document.getElementById('edit-link'),
            deleteLinkButton: document.getElementById('delete-link'),
            // 悬浮按钮
            floatingSettingsButton: document.getElementById('floating-settings-button'),
        },

        // --- 状态管理 ---
        State: {
            draggedItem: null,
            touchDraggedItem: null,
        },

        // --- 核心逻辑 ---

        /**
         * 执行搜索
         */
        performSearch() {
            const query = App.DOM.searchInput.value.trim();
            if (!query) return;

            const searchEngine = App.DOM.searchEngineSelect.value;
            const openType = App.DOM.searchOpenTypeSelect.value;
            let searchUrl;

            try {
                // 检查是否为有效URL
                new URL(query.startsWith('http') ? query : `https://${query}`);
                let urlToOpen = query;
                if (!query.startsWith('http://') && !query.startsWith('https://')) {
                    urlToOpen = 'https://' + query;
                }
                window.open(urlToOpen, openType);
            } catch (_) {
                // 如果不是URL，则执行搜索
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
                    case 'google':
                    default:
                        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                        break;
                }
                window.open(searchUrl, openType);
            }
        },

        // --- UI 更新模块 ---
        UI: {
            /**
             * 更新时间显示
             */
            updateTimeDisplay() {
                if (!App.DOM.showTimeCheckbox.checked) {
                    App.DOM.timeDisplay.textContent = '';
                    return;
                }

                const now = new Date();
                const showSeconds = App.DOM.showSecondsCheckbox.checked;
                const format = App.DOM.timeFormatSelect.value;
                const showAmpm = App.DOM.showAmpmSelect.value === 'yes';
                let timeColor = App.DOM.timeColorSelect.value;
                const timeWeight = App.DOM.timeWeightSelect.value;

                let hours = now.getHours();
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const seconds = now.getSeconds().toString().padStart(2, '0');
                let ampm = '';

                if (format === '12h') {
                    ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12 || 12;
                }

                let timeString = `${hours.toString().padStart(2, '0')}:${minutes}`;
                if (showSeconds) timeString += `:${seconds}`;
                if (format === '12h' && showAmpm) timeString += ` ${ampm}`;

                App.DOM.timeDisplay.textContent = timeString;

                if (timeColor === 'auto') {
                    timeColor = document.body.classList.contains('dark-mode') ? 'white' : 'black';
                }

                App.DOM.timeDisplay.style.fontWeight = timeWeight;
                App.DOM.timeDisplay.classList.remove('white', 'black');
                App.DOM.timeDisplay.classList.add(timeColor);
            },

            /**
             * 应用深色模式
             */
            applyDarkMode() {
                const { darkModeToggle, darkModeTypeSelect } = App.DOM;
                const isEnabled = darkModeToggle.checked;
                const type = darkModeTypeSelect.value;

                document.body.classList.remove('dark-mode');

                if (isEnabled) {
                    if (type === 'dark' || (type === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                        document.body.classList.add('dark-mode');
                    }
                }
                
                App.UI.updateTimeDisplay();
                App.QuickAccess.applyTitleSettings();
            },

            /**
             * 切换子设置的可见性
             */
            toggleSubSettings(checkbox, ...elements) {
                const isVisible = checkbox.checked;
                elements.forEach(el => {
                    if (el) el.style.display = isVisible ? 'flex' : 'none';
                });
            },
            
            toggleTimeSubSettings() {
                const { showTimeCheckbox, timeDisplay, timeFormatSettings, timeFormatSelectContainer, timeColorSettings, timeWeightSettings, timeFormatSelect, ampmDisplaySettings } = App.DOM;
                const isVisible = showTimeCheckbox.checked;
                timeDisplay.style.display = isVisible ? 'block' : 'none';
                this.toggleSubSettings(showTimeCheckbox, timeFormatSettings, timeFormatSelectContainer, timeColorSettings, timeWeightSettings);
                const is12h = timeFormatSelect.value === '12h';
                ampmDisplaySettings.style.display = (isVisible && is12h) ? 'flex' : 'none';
            },

            toggleDarkModeSubSettings() {
                this.toggleSubSettings(App.DOM.darkModeToggle, App.DOM.darkModeTypeSettings);
            },

            /**
             * 显示上下文菜单
             */
            showContextMenu(x, y, link) {
                const { contextMenu, editLinkButton, deleteLinkButton } = App.DOM;
                contextMenu.style.display = 'block';
                contextMenu.style.left = `${x}px`;
                contextMenu.style.top = `${y}px`;

                editLinkButton.onclick = () => {
                    App.QuickAccess.openModalForEdit(link);
                    this.hideContextMenu();
                };
                deleteLinkButton.onclick = () => {
                    App.QuickAccess.deleteLink(link.title, link.url);
                    this.hideContextMenu();
                };
            },

            /**
             * 隐藏上下文菜单
             */
            hideContextMenu() {
                App.DOM.contextMenu.style.display = 'none';
            }
        },

        // --- 设置管理模块 ---
        Settings: {
            load() {
                this.loadSearch();
                this.loadBackground();
                this.loadTime();
                this.loadDarkMode();
                this.loadQuickAccess();
            },

            loadSearch() {
                App.DOM.searchEngineSelect.value = localStorage.getItem('searchEngine') || 'google';
                App.DOM.searchOpenTypeSelect.value = localStorage.getItem('searchOpenType') || '_self';
            },

            loadBackground() {
                const type = localStorage.getItem('bgImageType') || 'default';
                App.DOM.bgImageSelect.value = type;

                if (type === 'custom') {
                    const savedImage = localStorage.getItem('bgImage');
                    if (savedImage) document.body.style.backgroundImage = `url(${savedImage})`;
                } else if (type === 'bing') {
                    document.body.style.backgroundImage = `url(https://bing.img.run/uhd.php)`;
                } else {
                    document.body.style.backgroundImage = 'none';
                }
            },

            loadTime() {
                const { showTimeCheckbox, showSecondsCheckbox, timeFormatSelect, showAmpmSelect, timeColorSelect, timeWeightSelect } = App.DOM;
                showTimeCheckbox.checked = localStorage.getItem('showTime') !== 'false';
                showSecondsCheckbox.checked = localStorage.getItem('showSeconds') === 'true';
                timeFormatSelect.value = localStorage.getItem('timeFormat') || '24h';
                showAmpmSelect.value = localStorage.getItem('showAmpm') || 'no';
                timeColorSelect.value = localStorage.getItem('timeColor') || 'auto';
                timeWeightSelect.value = localStorage.getItem('timeWeight') || 'normal';
                App.UI.toggleTimeSubSettings();
                App.UI.updateTimeDisplay();
            },

            loadDarkMode() {
                const { darkModeToggle, darkModeTypeSelect } = App.DOM;
                darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
                darkModeTypeSelect.value = localStorage.getItem('darkModeType') || 'system';
                App.UI.toggleDarkModeSubSettings();
                App.UI.applyDarkMode();
            },

            loadQuickAccess() {
                const { showQuickAccessCheckbox, quickAccessOpenTypeSelect, showQuickAccessTitleCheckbox, quickAccessTitleColorSelect } = App.DOM;
                showQuickAccessCheckbox.checked = localStorage.getItem('showQuickAccess') !== 'false';
                quickAccessOpenTypeSelect.value = localStorage.getItem('quickAccessOpenType') || '_blank';
                showQuickAccessTitleCheckbox.checked = localStorage.getItem('showQuickAccessTitle') !== 'false';
                quickAccessTitleColorSelect.value = localStorage.getItem('quickAccessTitleColor') || 'black';
                App.QuickAccess.toggleSubSettings();
                App.QuickAccess.applyTitleSettings();
            }
        },

        // --- 快速访问模块 ---
        QuickAccess: {
            init() {
                this.cleanupDefaultLinks();
                this.initializePresetLinks();
                this.loadLinks();
            },

            getLinks: () => JSON.parse(localStorage.getItem('quickAccessLinks') || '[]'),
            saveLinks: (links) => localStorage.setItem('quickAccessLinks', JSON.stringify(links)),

            loadLinks() {
                const { quickAccessLinksContainer } = App.DOM;
                quickAccessLinksContainer.innerHTML = '';
                
                const systemLinks = [
                    { title: '设置', url: 'settings://open', icon: '', isSystem: true },
                    { title: '添加', url: '', icon: '', isSystem: true, isAddButton: true }
                ];

                systemLinks.forEach(link => this.createLinkElement(link));
                this.getLinks().forEach(link => this.createLinkElement(link));
            },

            createLinkElement(link) {
                const linkElement = document.createElement('div');
                linkElement.className = 'quick-access-link';
                linkElement.dataset.url = link.url;

                if (link.isSystem) {
                    linkElement.classList.add('system-link');
                } else {
                    linkElement.draggable = true;
                    this.addDragHandlers(linkElement);
                    this.addContextMenuHandlers(linkElement, link);
                }

                const iconElement = this.createIconElement(link);
                const titleElement = this.createTitleElement(link);

                linkElement.append(iconElement, titleElement);
                this.addClickHandler(linkElement, link);
                App.DOM.quickAccessLinksContainer.appendChild(linkElement);
            },

            createIconElement(link) {
                const iconElement = document.createElement('div');
                iconElement.className = 'link-icon';

                if (link.icon) {
                    iconElement.style.backgroundImage = `url(${link.icon})`;
                    iconElement.style.backgroundSize = 'cover';
                    iconElement.style.backgroundPosition = 'center';
                } else if (link.isSystem && link.title === '设置') {
                    iconElement.innerHTML = '<span class="material-symbols-outlined">settings</span>';
                    iconElement.style.backgroundColor = '#666';
                } else if (link.isAddButton) {
                    iconElement.textContent = '+';
                    iconElement.style.cssText = 'background-color: #4CAF50; font-size: 18px; line-height: 36px;';
                } else {
                    try {
                        const url = new URL(link.url);
                        const faviconUrl = `${url.protocol}//${url.hostname}/favicon.ico`;
                        iconElement.style.backgroundImage = `url(${faviconUrl})`;
                        iconElement.style.backgroundSize = 'cover';
                        iconElement.style.backgroundPosition = 'center';
                        
                        const img = new Image();
                        img.src = faviconUrl;
                        img.onerror = () => this.createDefaultIcon(iconElement, link.title);
                    } catch (e) {
                        this.createDefaultIcon(iconElement, link.title);
                    }
                }
                return iconElement;
            },

            createDefaultIcon(element, title) {
                const firstChar = title.charAt(0).toUpperCase();
                element.textContent = firstChar;
                element.style.backgroundImage = '';
                const colors = ['#4285f4', '#ea4335', '#fbbc05', '#34a853', '#1a73e8', '#d93025', '#f28b82', '#fdd663', '#81c995', '#8ab4f8'];
                element.style.backgroundColor = colors[Math.abs(title.charCodeAt(0)) % colors.length];
            },

            createTitleElement(link) {
                const titleElement = document.createElement('div');
                titleElement.className = 'link-title';
                titleElement.textContent = link.title;
                return titleElement;
            },

            addClickHandler(element, link) {
                element.addEventListener('click', () => {
                    if (link.isSystem && link.title === '设置') {
                        App.DOM.settingsModal.style.display = 'block';
                    } else if (link.isAddButton) {
                        this.openModalForAdd();
                    } else {
                        const openType = localStorage.getItem('quickAccessOpenType') || '_blank';
                        window.open(link.url, openType);
                    }
                });
            },

            addContextMenuHandlers(element, link) {
                let pressTimer;
                element.addEventListener('contextmenu', e => {
                    e.preventDefault();
                    App.UI.showContextMenu(e.pageX, e.pageY, link);
                });
                element.addEventListener('pointerdown', e => {
                    if (e.pointerType === 'touch') {
                        pressTimer = setTimeout(() => App.UI.showContextMenu(e.pageX, e.pageY, link), 500);
                    }
                });
                element.addEventListener('pointerup', () => clearTimeout(pressTimer));
                element.addEventListener('pointerleave', () => clearTimeout(pressTimer));
            },

            openModalForAdd() {
                this.openModal('添加快速访问', { title: '', url: '', icon: '' });
            },

            openModalForEdit(link) {
                this.openModal('编辑快速访问', link, link.url);
            },

            openModal(title, linkData, originalUrl = '') {
                const { quickAccessModal, quickAccessModalTitle, quickAccessOriginalUrlInput, quickAccessTitleInput, quickAccessUrlInput, quickAccessIconInput } = App.DOM;
                quickAccessModalTitle.textContent = title;
                quickAccessOriginalUrlInput.value = originalUrl;
                quickAccessTitleInput.value = linkData.title;
                quickAccessUrlInput.value = linkData.url;
                quickAccessIconInput.value = linkData.icon || '';
                quickAccessModal.style.display = 'block';
            },

            saveLink() {
                const { quickAccessTitleInput, quickAccessUrlInput, quickAccessIconInput, quickAccessOriginalUrlInput, quickAccessModal } = App.DOM;
                const title = quickAccessTitleInput.value.trim();
                let url = quickAccessUrlInput.value.trim();
                const icon = quickAccessIconInput.value.trim();
                const originalUrl = quickAccessOriginalUrlInput.value;

                if (!title || !url) return alert('请输入标题和网址');

                if (!/^(https?|file):\/\//i.test(url)) {
                    url = 'https://' + url;
                }

                const links = this.getLinks();
                const newLink = { title, url, icon };

                if (originalUrl) { // Edit mode
                    const index = links.findIndex(l => l.url === originalUrl);
                    if (index !== -1) links[index] = newLink;
                } else { // Add mode
                    if (links.some(l => l.url === url || l.title === title)) {
                        return alert('已存在具有相同标题或网址的链接。');
                    }
                    links.push(newLink);
                }

                this.saveLinks(links);
                this.loadLinks();
                quickAccessModal.style.display = 'none';
            },

            deleteLink(title, url) {
                if (confirm(`确定要删除 "${title}" 吗？`)) {
                    const links = this.getLinks().filter(l => !(l.title === title && l.url === url));
                    this.saveLinks(links);
                    this.loadLinks();
                }
            },

            toggleSubSettings() {
                const { showQuickAccessCheckbox, quickAccessContainer, floatingSettingsButton, quickAccessOpenTypeSettings, quickAccessTitleDisplaySettings, showQuickAccessTitleCheckbox, quickAccessTitleColorSettings } = App.DOM;
                const isVisible = showQuickAccessCheckbox.checked;
                quickAccessContainer.style.display = isVisible ? 'block' : 'none';
                floatingSettingsButton.style.display = isVisible ? 'none' : 'flex';
                App.UI.toggleSubSettings(showQuickAccessCheckbox, quickAccessOpenTypeSettings, quickAccessTitleDisplaySettings);
                const isTitleVisible = showQuickAccessTitleCheckbox.checked;
                quickAccessTitleColorSettings.style.display = (isVisible && isTitleVisible) ? 'flex' : 'none';
            },

            applyTitleSettings() {
                const { showQuickAccessTitleCheckbox, quickAccessTitleColorSelect, quickAccessLinksContainer } = App.DOM;
                const showTitle = showQuickAccessTitleCheckbox.checked;
                let titleColor = quickAccessTitleColorSelect.value;

                if (titleColor === 'auto') {
                    titleColor = document.body.classList.contains('dark-mode') ? 'white' : 'black';
                }

                quickAccessLinksContainer.classList.toggle('hide-title', !showTitle);
                quickAccessLinksContainer.classList.remove('title-white', 'title-black');
                if (showTitle) {
                    quickAccessLinksContainer.classList.add(`title-${titleColor}`);
                }
            },

            initializePresetLinks() {
                if (localStorage.getItem('quickAccessLinks') === null) {
                    this.saveLinks([{ title: 'GitHub', url: 'https://github.com', icon: './files/show-quick/github.ico' }]);
                }
            },

            cleanupDefaultLinks() {
                const defaultUrls = ['https://www.google.com', 'https://www.youtube.com', 'https://www.github.com'];
                const links = this.getLinks();
                if (links.some(l => defaultUrls.includes(l.url))) {
                    this.saveLinks(links.filter(l => !defaultUrls.includes(l.url)));
                }
            },

            // --- 拖拽处理 ---
            addDragHandlers(element) {
                element.addEventListener('dragstart', this.handleDragStart);
                element.addEventListener('dragover', this.handleDragOver);
                element.addEventListener('dragleave', this.handleDragLeave);
                element.addEventListener('drop', this.handleDrop);
                element.addEventListener('dragend', this.handleDragEnd);
                element.addEventListener('touchstart', this.handleTouchStart, { passive: true });
                element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
                element.addEventListener('touchend', this.handleTouchEnd);
            },

            handleDragStart(e) {
                App.State.draggedItem = this;
                setTimeout(() => this.style.display = 'none', 0);
                e.dataTransfer.effectAllowed = 'move';
            },
            handleDragOver(e) {
                e.preventDefault();
                this.classList.add('drag-over');
            },
            handleDragLeave() {
                this.classList.remove('drag-over');
            },
            handleDrop(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
                if (App.State.draggedItem !== this) {
                    App.QuickAccess.reorderLinks(App.State.draggedItem.dataset.url, this.dataset.url);
                }
            },
            handleDragEnd() {
                if (App.State.draggedItem) {
                    App.State.draggedItem.style.display = '';
                }
                App.State.draggedItem = null;
                document.querySelectorAll('.quick-access-link.drag-over').forEach(el => el.classList.remove('drag-over'));
            },
            handleTouchStart(e) {
                if (this.classList.contains('system-link')) return;
                App.State.touchDraggedItem = this;
                this.style.opacity = '0.5';
                this.style.transform = 'scale(1.1)';
            },
            handleTouchMove(e) {
                if (!App.State.touchDraggedItem) return;
                e.preventDefault();
                const touch = e.touches;
                App.State.touchDraggedItem.style.display = 'none';
                const overElement = document.elementFromPoint(touch.clientX, touch.clientY);
                App.State.touchDraggedItem.style.display = '';
                document.querySelectorAll('.quick-access-link.drag-over').forEach(el => el.classList.remove('drag-over'));
                const targetLink = overElement ? overElement.closest('.quick-access-link:not(.system-link)') : null;
                if (targetLink && targetLink !== App.State.touchDraggedItem) {
                    targetLink.classList.add('drag-over');
                }
            },
            handleTouchEnd(e) {
                const item = App.State.touchDraggedItem;
                if (!item) return;
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
                const touch = e.changedTouches;
                item.style.display = 'none';
                const overElement = document.elementFromPoint(touch.clientX, touch.clientY);
                item.style.display = '';
                const targetLink = overElement ? overElement.closest('.quick-access-link:not(.system-link)') : null;
                if (targetLink && targetLink !== item) {
                    this.reorderLinks(item.dataset.url, targetLink.dataset.url);
                }
                document.querySelectorAll('.quick-access-link.drag-over').forEach(el => el.classList.remove('drag-over'));
                App.State.touchDraggedItem = null;
            },
            reorderLinks(fromUrl, toUrl) {
                const links = this.getLinks();
                const fromIndex = links.findIndex(l => l.url === fromUrl);
                const toIndex = links.findIndex(l => l.url === toUrl);
                if (fromIndex !== -1 && toIndex !== -1) {
                    const [movedItem] = links.splice(fromIndex, 1);
                    links.splice(toIndex, 0, movedItem);
                    this.saveLinks(links);
                    this.loadLinks();
                }
            }
        },

        /**
         * 初始化所有事件监听器
         */
        initEventListeners() {
            const { DOM } = this;
            // 搜索
            DOM.searchButton.addEventListener('click', () => this.performSearch());
            DOM.searchInput.addEventListener('keypress', e => e.key === 'Enter' && this.performSearch());

            // 模态框
            DOM.closeSettingsModal.addEventListener('click', () => DOM.settingsModal.style.display = 'none');
            DOM.closeQuickAccessModal.addEventListener('click', () => DOM.quickAccessModal.style.display = 'none');
            DOM.cancelQuickAccessButton.addEventListener('click', () => DOM.quickAccessModal.style.display = 'none');
            window.addEventListener('click', e => {
                if (e.target === DOM.settingsModal) DOM.settingsModal.style.display = 'none';
                if (e.target === DOM.quickAccessModal) DOM.quickAccessModal.style.display = 'none';
                this.UI.hideContextMenu();
            });

            // 设置
            DOM.searchEngineSelect.addEventListener('change', e => localStorage.setItem('searchEngine', e.target.value));
            DOM.searchOpenTypeSelect.addEventListener('change', e => localStorage.setItem('searchOpenType', e.target.value));
            DOM.bgImageSelect.addEventListener('change', () => {
                localStorage.setItem('bgImageType', DOM.bgImageSelect.value);
                if (DOM.bgImageSelect.value === 'custom') {
                    DOM.bgFileInput.click();
                } else {
                    this.Settings.loadBackground();
                }
            });
            DOM.bgFileInput.addEventListener('change', e => {
                const file = e.target.files;
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = e => {
                        localStorage.setItem('bgImage', e.target.result);
                        this.Settings.loadBackground();
                    };
                    reader.readAsDataURL(file);
                }
            });

            // 时间设置
            DOM.showTimeCheckbox.addEventListener('change', () => {
                localStorage.setItem('showTime', DOM.showTimeCheckbox.checked);
                this.UI.toggleTimeSubSettings();
                this.UI.updateTimeDisplay();
            });
            DOM.showSecondsCheckbox.addEventListener('change', () => {
                localStorage.setItem('showSeconds', DOM.showSecondsCheckbox.checked);
                this.UI.updateTimeDisplay();
            });
            DOM.timeFormatSelect.addEventListener('change', () => {
                localStorage.setItem('timeFormat', DOM.timeFormatSelect.value);
                this.UI.toggleTimeSubSettings();
                this.UI.updateTimeDisplay();
            });
            DOM.showAmpmSelect.addEventListener('change', () => {
                localStorage.setItem('showAmpm', DOM.showAmpmSelect.value);
                this.UI.updateTimeDisplay();
            });
            DOM.timeColorSelect.addEventListener('change', () => {
                localStorage.setItem('timeColor', DOM.timeColorSelect.value);
                this.UI.updateTimeDisplay();
            });
            DOM.timeWeightSelect.addEventListener('change', () => {
                localStorage.setItem('timeWeight', DOM.timeWeightSelect.value);
                this.UI.updateTimeDisplay();
            });

            // 深色模式
            DOM.darkModeToggle.addEventListener('change', () => {
                localStorage.setItem('darkMode', DOM.darkModeToggle.checked);
                this.UI.toggleDarkModeSubSettings();
                this.UI.applyDarkMode();
            });
            DOM.darkModeTypeSelect.addEventListener('change', () => {
                localStorage.setItem('darkModeType', DOM.darkModeTypeSelect.value);
                this.UI.applyDarkMode();
            });
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.UI.applyDarkMode());

            // 快速访问
            DOM.saveQuickAccessButton.addEventListener('click', () => this.QuickAccess.saveLink());
            DOM.quickAccessUrlInput.addEventListener('keypress', e => e.key === 'Enter' && this.QuickAccess.saveLink());
            DOM.showQuickAccessCheckbox.addEventListener('change', () => {
                localStorage.setItem('showQuickAccess', DOM.showQuickAccessCheckbox.checked);
                this.QuickAccess.toggleSubSettings();
            });
            DOM.quickAccessOpenTypeSelect.addEventListener('change', e => localStorage.setItem('quickAccessOpenType', e.target.value));
            DOM.showQuickAccessTitleCheckbox.addEventListener('change', () => {
                localStorage.setItem('showQuickAccessTitle', DOM.showQuickAccessTitleCheckbox.checked);
                this.QuickAccess.toggleSubSettings();
                this.QuickAccess.applyTitleSettings();
            });
            DOM.quickAccessTitleColorSelect.addEventListener('change', () => {
                localStorage.setItem('quickAccessTitleColor', DOM.quickAccessTitleColorSelect.value);
                this.QuickAccess.applyTitleSettings();
            });
            DOM.floatingSettingsButton.addEventListener('click', () => DOM.settingsModal.style.display = 'block');
        },

        /**
         * 应用程序初始化
         */
        init() {
            this.Settings.load();
            this.QuickAccess.init();
            this.initEventListeners();
            setInterval(this.UI.updateTimeDisplay, 1000);
        }
    };

    // --- 启动应用程序 ---
    App.init();
});
