// 加载设置
function loadSettings() {
    // 加载搜索引擎设置
    const savedEngine = localStorage.getItem('searchEngine') || 'google';
    document.querySelector(`input[name="search-engine"][value="${savedEngine}"]`).checked = true;

    // 加载搜索打开方式设置
    const savedTarget = localStorage.getItem('searchTarget') || 'current';
    document.querySelector(`input[name="search-target"][value="${savedTarget}"]`).checked = true;

    // 加载壁纸设置
    const savedWallpaper = localStorage.getItem('wallpaper');
    if (savedWallpaper) {
        document.body.style.backgroundImage = `url(${savedWallpaper})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    }

    // 加载主题色设置
    const savedThemeColor = localStorage.getItem('themeColor') || 'blue';
    document.querySelector(`input[name="theme-color"][value="${savedThemeColor}"]`).checked = true;
    applyThemeColor(savedThemeColor);
}

// 保存搜索打开方式设置
function saveSearchTarget() {
    const selectedTarget = document.querySelector('input[name="search-target"]:checked').value;
    localStorage.setItem('searchTarget', selectedTarget);
}

// 保存搜索引擎设置
function saveSearchEngine() {
    const selectedEngine = document.querySelector('input[name="search-engine"]:checked').value;
    localStorage.setItem('searchEngine', selectedEngine);
}

// 保存壁纸设置
function saveWallpaper(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const wallpaperUrl = e.target.result;
            localStorage.setItem('wallpaper', wallpaperUrl);
            document.body.style.backgroundImage = `url(${wallpaperUrl})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
        };
        reader.readAsDataURL(file);
    }
}

// 重置壁纸
function resetWallpaper() {
    localStorage.removeItem('wallpaper');
    document.body.style.backgroundImage = '';
    document.getElementById('wallpaper-upload').value = '';
}

// 主题色配置
const themeColors = {
    purple: {
        primary: '#6200ee',
        primaryVariant: '#3700b3',
        secondary: '#03dac6',
        secondaryVariant: '#018786',
        background: '#ffffff',
        surface: '#ffffff',
        error: '#b00020',
        onPrimary: '#ffffff',
        onSecondary: '#000000',
        onBackground: '#000000',
        onSurface: '#000000',
        onError: '#ffffff'
    },
    blue: {
        primary: '#2196f3',
        primaryVariant: '#0d47a1',
        secondary: '#ff4081',
        secondaryVariant: '#c2185b',
        background: '#ffffff',
        surface: '#ffffff',
        error: '#b00020',
        onPrimary: '#ffffff',
        onSecondary: '#ffffff',
        onBackground: '#000000',
        onSurface: '#000000',
        onError: '#ffffff'
    },
    green: {
        primary: '#4caf50',
        primaryVariant: '#388e3c',
        secondary: '#ffeb3b',
        secondaryVariant: '#fbc02d',
        background: '#ffffff',
        surface: '#ffffff',
        error: '#b00020',
        onPrimary: '#ffffff',
        onSecondary: '#000000',
        onBackground: '#000000',
        onSurface: '#000000',
        onError: '#ffffff'
    },
    red: {
        primary: '#f44336',
        primaryVariant: '#d32f2f',
        secondary: '#4caf50',
        secondaryVariant: '#388e3c',
        background: '#ffffff',
        surface: '#ffffff',
        error: '#b00020',
        onPrimary: '#ffffff',
        onSecondary: '#ffffff',
        onBackground: '#000000',
        onSurface: '#000000',
        onError: '#ffffff'
    }
};

// 应用主题色
function applyThemeColor(colorName) {
    const colors = themeColors[colorName];
    if (!colors) return;

    document.documentElement.style.setProperty('--primary-color', colors.primary);
    // 更新RGB格式的主色调变量
    document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(colors.primary));
    document.documentElement.style.setProperty('--primary-variant', colors.primaryVariant);
    document.documentElement.style.setProperty('--secondary-color', colors.secondary);
    document.documentElement.style.setProperty('--secondary-variant', colors.secondaryVariant);
    document.documentElement.style.setProperty('--background-color', colors.background);
    document.documentElement.style.setProperty('--surface-color', colors.surface);
    document.documentElement.style.setProperty('--error-color', colors.error);
    document.documentElement.style.setProperty('--on-primary', colors.onPrimary);
    document.documentElement.style.setProperty('--on-secondary', colors.onSecondary);
    document.documentElement.style.setProperty('--on-background', colors.onBackground);
    document.documentElement.style.setProperty('--on-surface', colors.onSurface);
    document.documentElement.style.setProperty('--on-error', colors.onError);

    // 额外的主题色变量
    document.documentElement.style.setProperty('--sidebar-background', colors.background);
    document.documentElement.style.setProperty('--card-background', colors.surface);
    document.documentElement.style.setProperty('--hover-background', `rgba(${hexToRgb(colors.primary)}, 0.04)`);
    document.documentElement.style.setProperty('--active-background', `rgba(${hexToRgb(colors.primary)}, 0.1)`);
}

// 十六进制转RGB
function hexToRgb(hex) {
    // 移除#号
    hex = hex.replace('#', '');

    // 解析RGB值
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
}

// 保存主题色设置
function saveThemeColor() {
    const selectedColor = document.querySelector('input[name="theme-color"]:checked').value;
    localStorage.setItem('themeColor', selectedColor);
    applyThemeColor(selectedColor);
}

// 切换设置面板
function toggleSettingsPanel() {
    document.getElementById('settings-panel').classList.toggle('active');
}

// 切换设置部分
function switchSettingsSection(targetId) {
    // 隐藏所有部分
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('active');
    });

    // 显示目标部分
    document.getElementById(targetId).classList.add('active');

    // 更新导航链接状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-target') === targetId) {
            link.classList.add('active');
        }
    });
}

// 搜索引擎分组切换
document.getElementById('domestic-group-title').addEventListener('click', function() {
    this.classList.toggle('active');
    const options = document.getElementById('domestic-group-options');
    options.style.display = options.style.display === 'none' ? 'block' : 'none';
});

// 切换标题/时间显示
  function toggleTitleTime() {
      const selectedStyle = document.querySelector('input[name="display-style"]:checked').value;
      const showTime = selectedStyle === 'time';
      localStorage.setItem('showTime', showTime);
      
      // 显示或隐藏时钟样式设置
      document.getElementById('clock-style-settings').style.display = showTime ? 'block' : 'none';
      
      updateTitleDisplay();
  }

  // 更新标题显示
  function updateTitleDisplay() {
      const pageTitle = document.getElementById('page-title');
      if (!pageTitle) return;
      
      const showTime = localStorage.getItem('showTime') === 'true';
      if (showTime) {
          const now = new Date();
          const clockStyle = localStorage.getItem('clockStyle') || '24h';
          
          let hours = now.getHours();
          
          if (clockStyle === '12h') {
              hours = hours % 12 || 12; // 将0转换为12
          }
          
          const hoursStr = hours.toString().padStart(2, '0');
          const minutes = now.getMinutes().toString().padStart(2, '0');
          
          pageTitle.textContent = `${hoursStr}:${minutes}`;
      } else {
          pageTitle.textContent = 'AiroTab';
      }
  }

  // 搜索函数
  function search() {
    const query = document.getElementById('search-input').value.trim();
    if (query) {
        const engine = document.querySelector('input[name="search-engine"]:checked').value;
        const target = document.querySelector('input[name="search-target"]:checked').value;
        const targetWindow = target === 'current' ? '_self' : '_blank';
        let url;
        switch(engine) {
            case 'google':
                url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                break;
            case 'duckduckgo':
                url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
                break;
            case 'bing':
                url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                break;
            case 'baidu':
                url = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
                break;
            case 'sogou':
                url = `https://www.sogou.com/web?query=${encodeURIComponent(query)}`;
                break;
            case '360':
                url = `https://www.so.com/s?q=${encodeURIComponent(query)}`;
                break;
            case 'yandex':
                url = `https://yandex.com/search/?text=${encodeURIComponent(query)}`;
                break;
            case 'naver':
                url = `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
                break;
            default:
                url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
        window.open(url, targetWindow);
    }
}

// 添加事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 加载设置
      loadSettings();
    
    // 设置标题样式切换
    const displayStyleRadios = document.querySelectorAll('input[name="display-style"]');
    const savedShowTime = localStorage.getItem('showTime') === 'true';
    document.getElementById(savedShowTime ? 'time-style' : 'title-style').checked = true;
    displayStyleRadios.forEach(radio => {
        radio.addEventListener('change', toggleTitleTime);
    });
    
    // 设置时钟样式切换
    const clockStyleRadios = document.querySelectorAll('input[name="clock-style"]');
    const savedClockStyle = localStorage.getItem('clockStyle') || '24h';
    document.getElementById(`${savedClockStyle}-style`).checked = true;
    clockStyleRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            localStorage.setItem('clockStyle', this.value);
            if (localStorage.getItem('showTime') === 'true') {
                updateTitleDisplay();
            }
        });
    });
    
    // 初始显示或隐藏时钟样式设置
    document.getElementById('clock-style-settings').style.display = savedShowTime ? 'block' : 'none';
    
    // 初始更新标题显示
    updateTitleDisplay();
    
    // 每分钟更新时间
    setInterval(function() {
        if (localStorage.getItem('showTime') === 'true') {
            updateTitleDisplay();
        }
    }, 60000);



    // 设置面板切换
    document.getElementById('settings-icon').addEventListener('click', toggleSettingsPanel);
    document.getElementById('close-btn').addEventListener('click', toggleSettingsPanel);

    // 导航链接切换
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            switchSettingsSection(targetId);
        });
    });

    // 搜索引擎设置
    const engineRadios = document.querySelectorAll('input[name="search-engine"]');
    engineRadios.forEach(radio => {
        radio.addEventListener('change', saveSearchEngine);
    });

    // 搜索打开方式设置
    const targetRadios = document.querySelectorAll('input[name="search-target"]');
    targetRadios.forEach(radio => {
        radio.addEventListener('change', saveSearchTarget);
    });

    // 壁纸设置
    document.getElementById('wallpaper-upload').addEventListener('change', saveWallpaper);
    document.getElementById('reset-wallpaper').addEventListener('click', resetWallpaper);

    // 主题色设置
    const colorRadios = document.querySelectorAll('input[name="theme-color"]');
    colorRadios.forEach(radio => {
        radio.addEventListener('change', saveThemeColor);
    });

    // 搜索功能
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            search();
        }
    });

    document.getElementById('search-btn').addEventListener('click', function(e) {
        e.preventDefault();
        search();
    });

    // 处理表单提交
    document.getElementById('search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        search();
    });
});