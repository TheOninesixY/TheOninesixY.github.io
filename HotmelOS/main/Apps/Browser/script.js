class Browser {
    constructor() {
        this.tabs = [];
        this.activeTabId = null;
        this.tabCounter = 0;
        
        this.init();
    }
    
    init() {
                // 创建默认标签页
                this.createTab('https://oninesixy.pages.dev/Tools/QingTab');
                
                // 绑定事件
                this.bindEvents();
            }
    
    bindEvents() {
        // 导航按钮事件
        document.getElementById('backBtn').addEventListener('click', () => this.goBack());
        document.getElementById('forwardBtn').addEventListener('click', () => this.goForward());
        document.getElementById('refreshBtn').addEventListener('click', () => this.refresh());
        document.getElementById('homeBtn').addEventListener('click', () => this.goHome());
        
        // 地址栏事件
        document.getElementById('goBtn').addEventListener('click', () => this.navigate());
        document.getElementById('urlInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.navigate();
            }
        });
        
        // 新标签页按钮事件
        document.getElementById('newTabBtn').addEventListener('click', () => this.createTab());
    }
    
    createTab(url = 'https://oninesixy.pages.dev/Tools/QingTab') {
        const tabId = ++this.tabCounter;
        
        // 创建标签元素
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        tabElement.dataset.tabId = tabId;
        tabElement.innerHTML = `
            <span class="tab-title">加载中...</span>
            <span class="tab-close"><span class="material-symbols-outlined">close</span></span>
        `;
        
        // 添加到标签栏
        document.querySelector('.tab-bar').insertBefore(tabElement, document.getElementById('newTabBtn'));
        
        // 创建iframe容器
        const iframeContainer = document.createElement('div');
        iframeContainer.className = 'iframe-container';
        iframeContainer.dataset.tabId = tabId;
        iframeContainer.innerHTML = `
            <div class="loading">加载中...</div>
            <iframe id="iframe-${tabId}" src="${url}"></iframe>
        `;
        
        // 添加到内容区域
        document.getElementById('contentArea').appendChild(iframeContainer);
        
        // 获取iframe元素
        const iframe = iframeContainer.querySelector('iframe');
        
        // 监听iframe加载事件
        iframe.addEventListener('load', () => {
            this.updateTabTitle(tabId, iframe.contentDocument?.title || url);
            this.updateUrlInput(iframe.src);
            iframeContainer.querySelector('.loading').style.display = 'none';
        });
        
        // 监听iframe错误事件
        iframe.addEventListener('error', () => {
            this.updateTabTitle(tabId, '加载失败');
        });
        
        // 标签点击事件
        tabElement.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tab-close')) {
                this.switchTab(tabId);
            }
        });
        
        // 关闭标签事件
        tabElement.querySelector('.tab-close').addEventListener('click', () => {
            this.closeTab(tabId);
        });
        
        // 添加到标签列表
        this.tabs.push({
            id: tabId,
            url: url,
            element: tabElement,
            iframe: iframe,
            container: iframeContainer
        });
        
        // 切换到新标签
        this.switchTab(tabId);
    }
    
    switchTab(tabId) {
        // 移除当前活动标签
        if (this.activeTabId !== null) {
            const currentTab = this.tabs.find(tab => tab.id === this.activeTabId);
            if (currentTab) {
                currentTab.element.classList.remove('active');
                currentTab.container.classList.remove('active');
            }
        }
        
        // 设置新活动标签
        this.activeTabId = tabId;
        const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
        if (activeTab) {
            activeTab.element.classList.add('active');
            activeTab.container.classList.add('active');
            this.updateUrlInput(activeTab.iframe.src);
        }
    }
    
    closeTab(tabId) {
        const tabIndex = this.tabs.findIndex(tab => tab.id === tabId);
        if (tabIndex === -1) return;
        
        const tab = this.tabs[tabIndex];
        
        // 移除DOM元素
        tab.element.remove();
        tab.container.remove();
        
        // 从列表中移除
        this.tabs.splice(tabIndex, 1);
        
        // 如果关闭的是活动标签，切换到其他标签
        if (this.activeTabId === tabId) {
            if (this.tabs.length > 0) {
                const newActiveTab = this.tabs[Math.max(0, tabIndex - 1)];
                this.switchTab(newActiveTab.id);
            } else {
                // 如果没有标签了，创建一个新的
                this.createTab();
            }
        }
    }
    
    navigate() {
        const url = document.getElementById('urlInput').value;
        if (!url) return;
        
        const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
        if (activeTab) {
            const formattedUrl = this.formatUrl(url);
            activeTab.iframe.src = formattedUrl;
            activeTab.url = formattedUrl;
            activeTab.container.querySelector('.loading').style.display = 'block';
        }
    }
    
    formatUrl(url) {
        // 简单的URL格式化
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://') && !url.endsWith('.html')) {
            return 'https://' + url;
        }
        return url;
    }
    
    goBack() {
        const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
        if (activeTab && activeTab.iframe.contentWindow.history.length > 1) {
            activeTab.iframe.contentWindow.history.back();
        }
    }
    
    goForward() {
        const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
        if (activeTab) {
            activeTab.iframe.contentWindow.history.forward();
        }
    }
    
    refresh() {
        const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
        if (activeTab) {
            activeTab.iframe.contentWindow.location.reload();
            activeTab.container.querySelector('.loading').style.display = 'block';
        }
    }
    
    goHome() {
        const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
        if (activeTab) {
            activeTab.iframe.src = 'https://oninesixy.pages.dev/Tools/QingTab';
            activeTab.url = 'https://oninesixy.pages.dev/Tools/QingTab';
            activeTab.container.querySelector('.loading').style.display = 'block';
        }
    }
    
    updateTabTitle(tabId, title) {
        const tab = this.tabs.find(tab => tab.id === tabId);
        if (tab) {
            tab.element.querySelector('.tab-title').textContent = title;
        }
    }
    
    updateUrlInput(url) {
        document.getElementById('urlInput').value = url;
    }
}

// 初始化浏览器
window.addEventListener('DOMContentLoaded', () => {
    new Browser();
});