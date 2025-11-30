document.addEventListener('DOMContentLoaded', () => {
    const appNameInput = document.getElementById('app-name');
    const appUrlInput = document.getElementById('app-url');
    const addButton = document.getElementById('add-app-button');

    addButton.addEventListener('click', () => {
        const name = appNameInput.value.trim();
        const url = appUrlInput.value.trim();

        if (!name || !url) {
            alert('应用名称和 URL 不能为空！');
            return;
        }

        // 从 localStorage 获取当前数据
        let appData = JSON.parse(localStorage.getItem('hotmelOS_appData'));

        // 创建新的应用对象
        const newApp = {
            id: name.toLowerCase().replace(/\s+/g, ''), // 基于名称创建简单ID
            type: 'item',
            name: name,
            action: 'createWindow',
            url: url,
            deleted: false
        };

        // 将新应用添加到开始菜单列表的末尾
        appData.startMenuItems.push(newApp);

        // 将更新后的数据存回 localStorage
        localStorage.setItem('hotmelOS_appData', JSON.stringify(appData));

        alert(`应用 "${name}" 已成功添加！`);
        appNameInput.value = '';
        appUrlInput.value = '';
    });
});