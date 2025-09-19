function copyCode(button) {
    // 获取父级code元素
    const codeElement = button.parentElement;
    // 获取代码文本（排除按钮的文本）
    const code = codeElement.firstChild.textContent;
    // 复制到剪贴板
    navigator.clipboard.writeText(code).then(function() {
        // 临时更改按钮文本
        const originalText = button.textContent;
        button.textContent = '已复制!';
        setTimeout(function() {
            button.textContent = originalText;
        }, 2000);
    }).catch(function(error) {
        console.error('复制失败:', error);
        button.textContent = '复制失败';
        setTimeout(function() {
            button.textContent = '复制';
        }, 2000);
    });
}