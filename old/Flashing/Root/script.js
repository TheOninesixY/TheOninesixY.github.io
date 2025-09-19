document.addEventListener('DOMContentLoaded', () => {
            const copyButtons = document.querySelectorAll('.copy-button');

            copyButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const codeBlock = button.nextElementSibling; // Get the <code> element next to the button
                    if (codeBlock && codeBlock.tagName === 'CODE') {
                        const textToCopy = codeBlock.innerText;
                        navigator.clipboard.writeText(textToCopy).then(() => {
                            const originalText = button.textContent;
                            button.textContent = '已复制！';
                            setTimeout(() => {
                                button.textContent = originalText;
                            }, 2000);
                        }).catch(err => {
                            console.error('复制失败: ', err);
                            alert('复制失败，请手动复制。');
                        });
                    }
                });
            });
        });