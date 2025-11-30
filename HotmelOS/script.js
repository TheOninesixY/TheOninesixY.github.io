document.addEventListener('DOMContentLoaded', () => {
    const timeElement = document.getElementById('lockscreen-time');
    const loginButton = document.getElementById('login-button');

    function updateTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}`;
    }

    loginButton.addEventListener('click', () => {
        const elem = document.documentElement;
        const lockscreen = document.getElementById('lockscreen');
        const desktopContainer = document.getElementById('desktop-container');

        const requestFullScreen = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen;

        const loadDesktop = () => {
            lockscreen.style.display = 'none';
            desktopContainer.style.display = 'block';
            const iframe = document.createElement('iframe');
            iframe.src = 'main/index.html';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.overflow = 'hidden'; // Hide scrollbars
            iframe.setAttribute('scrolling', 'no'); // For older browsers
            desktopContainer.appendChild(iframe);
        };

        if (requestFullScreen) {
            requestFullScreen.call(elem).then(() => {
                loadDesktop();
            }).catch(err => {
                console.error('无法进入全屏模式:', err);
                // 即使无法进入全屏，也加载桌面
                loadDesktop();
            });
        } else {
            // 如果浏览器不支持全屏API，直接加载桌面
            loadDesktop();
        }
    });

    setInterval(updateTime, 1000);
    updateTime();

    // 监听来自 iframe 的消息
    window.addEventListener('message', (event) => {
        if (event.data === 'shutdown') {
            const lockscreen = document.getElementById('lockscreen');
            const desktopContainer = document.getElementById('desktop-container');

            // 隐藏桌面并清空内容
            desktopContainer.style.display = 'none';
            desktopContainer.innerHTML = '';

            // 显示锁屏
            lockscreen.style.display = 'flex';

            // 退出全屏
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }
    });
});