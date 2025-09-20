document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const settingsButton = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const closeModal = document.querySelector('.close');
    const searchEngineSelect = document.getElementById('search-engine');
    const changeBgButton = document.getElementById('change-bg');
    const bgFileInput = document.getElementById('bg-file-input');
    const currentBgSpan = document.getElementById('current-bg');

    // Load saved search engine preference
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
    settingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });

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

    // Today's Bing wallpaper functionality
    const todayBingWallpaperButton = document.getElementById('todaybingwallpaper');
    todayBingWallpaperButton.addEventListener('click', () => {
        const bingWallpaperUrl = 'https://bing.img.run/uhd.php';
        document.body.style.backgroundImage = `url(${bingWallpaperUrl})`;
        localStorage.setItem('bgImage', bingWallpaperUrl);
        currentBgSpan.textContent = '必应壁纸';
    });
});