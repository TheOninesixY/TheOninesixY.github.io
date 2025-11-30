// 保存当前选中的壁纸
let selectedWallpaper = '';
let currentBingWallpaperUrl = '';

// 获取必应每日壁纸
async function getBingWallpaper() {
    try {
        // 使用必应每日壁纸API
        const bingApiUrl = 'https://bing.img.run/uhd.php';
        
        // 由于是直接返回图片，我们可以直接使用这个URL
        currentBingWallpaperUrl = bingApiUrl;
        
        // 更新必应壁纸图片
        const bingWallpaperImg = document.getElementById('bingWallpaper');
        bingWallpaperImg.src = currentBingWallpaperUrl;
        
        // 更新bingWallpaperItem的data-wallpaper属性
        const bingWallpaperItem = document.getElementById('bingWallpaperItem');
        bingWallpaperItem.dataset.wallpaper = currentBingWallpaperUrl;
        
        console.log('必应每日壁纸已加载');
    } catch (error) {
        console.error('获取必应壁纸失败:', error);
    }
}

// 壁纸项点击事件
document.querySelectorAll('.wallpaper-item').forEach(item => {
    item.addEventListener('click', () => {
        // 移除所有选中状态
        document.querySelectorAll('.wallpaper-item').forEach(i => i.classList.remove('selected'));
        // 添加当前选中状态
        item.classList.add('selected');
        // 获取壁纸URL
        selectedWallpaper = item.dataset.wallpaper;
        // 更新预览
        updatePreview(selectedWallpaper);
        // 应用壁纸
        applyWallpaper(selectedWallpaper);
    });
});

// 自定义壁纸处理
document.getElementById('customWallpaper').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            selectedWallpaper = event.target.result;
            updatePreview(selectedWallpaper);
        };
        reader.readAsDataURL(file);
    }
});

// 应用自定义壁纸按钮
document.getElementById('applyCustom').addEventListener('click', () => {
    if (selectedWallpaper) {
        applyWallpaper(selectedWallpaper);
        alert('自定义壁纸已应用！');
    } else {
        alert('请先选择一张图片！');
    }
});

// 刷新必应壁纸按钮
document.getElementById('refreshBingWallpaper').addEventListener('click', async () => {
    const refreshButton = document.getElementById('refreshBingWallpaper');
    refreshButton.textContent = '刷新中...';
    refreshButton.disabled = true;
    
    await getBingWallpaper();
    
    refreshButton.textContent = '刷新必应壁纸';
    refreshButton.disabled = false;
    
    // 如果当前选中的是必应壁纸，更新预览和应用
    const bingWallpaperItem = document.getElementById('bingWallpaperItem');
    if (bingWallpaperItem.classList.contains('selected')) {
        selectedWallpaper = currentBingWallpaperUrl;
        updatePreview(selectedWallpaper);
        applyWallpaper(selectedWallpaper);
    }
});

// 更新预览
function updatePreview(wallpaperUrl) {
    const previewImage = document.getElementById('previewImage');
    previewImage.src = wallpaperUrl;
    previewImage.style.display = 'block';
}

// 应用壁纸
function applyWallpaper(wallpaperUrl) {
    // 向父窗口发送消息，设置壁纸
    window.parent.postMessage({
        type: 'setWallpaper',
        url: wallpaperUrl
    }, '*');
}

// 初始化：加载上次保存的壁纸和必应壁纸
async function init() {
    // 加载必应每日壁纸
    await getBingWallpaper();
    
    // 加载上次保存的壁纸
    const savedWallpaper = localStorage.getItem('hotmelos_wallpaper');
    if (savedWallpaper) {
        selectedWallpaper = savedWallpaper;
        updatePreview(savedWallpaper);
    }
    
    // 加载上次保存的任务栏居中设置
    const savedCenter = localStorage.getItem('hotmelos_taskbar_center');
    const centerTaskbarCheckbox = document.getElementById('centerTaskbar');
    if (centerTaskbarCheckbox) {
        centerTaskbarCheckbox.checked = savedCenter === 'true';
        
        // 添加事件监听器
        centerTaskbarCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            // 向父窗口发送消息，设置任务栏居中
            window.parent.postMessage({
                type: 'setTaskbarCenter',
                center: isChecked
            }, '*');
        });
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);