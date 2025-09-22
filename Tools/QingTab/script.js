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

    // Initial load of time settings and start updating time
    loadTimeSettings();
    setInterval(updateTimeDisplay, 1000);
});
