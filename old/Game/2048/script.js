document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const scoreDisplay = document.getElementById('score');
    const gameOverDisplay = document.getElementById('gameOver');
    const finalScoreDisplay = document.getElementById('finalScore');
    const restartButton = document.getElementById('restart');
    const width = 4;
    let squares = [];
    let score = 0;
    let previousState = null;
    let previousScore = 0;
    let canUndo = false;

    // 创建棋盘
    function createBoard() {
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div');
            square.classList.add('cell');
            const content = document.createElement('span');
            content.textContent = '';
            square.appendChild(content);
            grid.appendChild(square);
            squares.push(content);
        }
        generateNewNumber();
        generateNewNumber();
    }

    // 随机生成新数字
    function generateNewNumber() {
        let randomNumber = Math.floor(Math.random() * squares.length);
        if (squares[randomNumber].textContent === '') {
            const newValue = Math.random() > 0.5 ? '4' : '2';
            squares[randomNumber].textContent = newValue;
            const cell = squares[randomNumber].parentElement;
            cell.className = 'cell';
            cell.classList.add(`tile-${newValue}`, 'new-tile');
            setTimeout(() => {
                cell.classList.remove('new-tile');
            }, 200);
            checkForGameOver();
        } else {
            generateNewNumber();
        }
    }

    // 移动数字 - 向右
    function moveRight() {
        for (let i = 0; i < 16; i++) {
            if (i % 4 === 0) {
                let totalOne = squares[i].textContent;
                let totalTwo = squares[i + 1].textContent;
                let totalThree = squares[i + 2].textContent;
                let totalFour = squares[i + 3].textContent;
                let row = [parseInt(totalOne) || 0, parseInt(totalTwo) || 0, parseInt(totalThree) || 0, parseInt(totalFour) || 0];

                let filteredRow = row.filter(num => num);
                let missing = 4 - filteredRow.length;
                let zeros = Array(missing).fill(0);
                let newRow = zeros.concat(filteredRow);

                squares[i].textContent = newRow[0] || '';
                squares[i + 1].textContent = newRow[1] || '';
                squares[i + 2].textContent = newRow[2] || '';
                squares[i + 3].textContent = newRow[3] || '';
            }
        }
        updateTileColors();
    }

    // 移动数字 - 向左
    function moveLeft() {
        for (let i = 0; i < 16; i++) {
            if (i % 4 === 0) {
                let totalOne = squares[i].textContent;
                let totalTwo = squares[i + 1].textContent;
                let totalThree = squares[i + 2].textContent;
                let totalFour = squares[i + 3].textContent;
                let row = [parseInt(totalOne) || 0, parseInt(totalTwo) || 0, parseInt(totalThree) || 0, parseInt(totalFour) || 0];

                let filteredRow = row.filter(num => num);
                let missing = 4 - filteredRow.length;
                let zeros = Array(missing).fill(0);
                let newRow = filteredRow.concat(zeros);

                squares[i].textContent = newRow[0] || '';
                squares[i + 1].textContent = newRow[1] || '';
                squares[i + 2].textContent = newRow[2] || '';
                squares[i + 3].textContent = newRow[3] || '';
            }
        }
        updateTileColors();
    }

    // 移动数字 - 向下
    function moveDown() {
        for (let i = 0; i < 4; i++) {
            let totalOne = squares[i].textContent;
            let totalTwo = squares[i + width].textContent;
            let totalThree = squares[i + width * 2].textContent;
            let totalFour = squares[i + width * 3].textContent;
            let column = [parseInt(totalOne) || 0, parseInt(totalTwo) || 0, parseInt(totalThree) || 0, parseInt(totalFour) || 0];

            let filteredColumn = column.filter(num => num);
            let missing = 4 - filteredColumn.length;
            let zeros = Array(missing).fill(0);
            let newColumn = zeros.concat(filteredColumn);

            squares[i].textContent = newColumn[0] || '';
            squares[i + width].textContent = newColumn[1] || '';
            squares[i + width * 2].textContent = newColumn[2] || '';
            squares[i + width * 3].textContent = newColumn[3] || '';
        }
        updateTileColors();
    }

    // 移动数字 - 向上
    function moveUp() {
        for (let i = 0; i < 4; i++) {
            let totalOne = squares[i].textContent;
            let totalTwo = squares[i + width].textContent;
            let totalThree = squares[i + width * 2].textContent;
            let totalFour = squares[i + width * 3].textContent;
            let column = [parseInt(totalOne) || 0, parseInt(totalTwo) || 0, parseInt(totalThree) || 0, parseInt(totalFour) || 0];

            let filteredColumn = column.filter(num => num);
            let missing = 4 - filteredColumn.length;
            let zeros = Array(missing).fill(0);
            let newColumn = filteredColumn.concat(zeros);

            squares[i].textContent = newColumn[0] || '';
            squares[i + width].textContent = newColumn[1] || '';
            squares[i + width * 2].textContent = newColumn[2] || '';
            squares[i + width * 3].textContent = newColumn[3] || '';
        }
        updateTileColors();
    }

    // 合并数字 - 向右
    function mergeRight() {
        let merged = false;
        for (let i = 14; i >= 0; i--) {
            if (i % 4 === 3) continue;

            if (squares[i].textContent === squares[i + 1].textContent && squares[i].textContent !== '') {
                let combinedTotal = parseInt(squares[i].textContent) + parseInt(squares[i + 1].textContent);
                squares[i].textContent = '';
                squares[i + 1].textContent = combinedTotal;
                const cell = squares[i + 1].parentElement;
                cell.classList.add('merge');
                setTimeout(() => {
                    cell.classList.remove('merge');
                }, 200);
                score += combinedTotal;
                scoreDisplay.textContent = score;
                merged = true;
            }
        }
        updateTileColors();
        return merged;
    }

    // 合并数字 - 向左
    function mergeLeft() {
        let merged = false;
        for (let i = 1; i < 16; i++) {
            if (i % 4 === 0) continue;

            if (squares[i].textContent === squares[i - 1].textContent && squares[i].textContent !== '') {
                let combinedTotal = parseInt(squares[i].textContent) + parseInt(squares[i - 1].textContent);
                squares[i].textContent = '';
                squares[i - 1].textContent = combinedTotal;
                const cell = squares[i - 1].parentElement;
                cell.classList.add('merge');
                setTimeout(() => {
                    cell.classList.remove('merge');
                }, 200);
                score += combinedTotal;
                scoreDisplay.textContent = score;
                merged = true;
            }
        }
        updateTileColors();
        return merged;
    }

    // 合并数字 - 向下
    function mergeDown() {
        let merged = false;
        for (let i = 11; i >= 0; i--) {
            if (squares[i].textContent === squares[i + width].textContent && squares[i].textContent !== '') {
                let combinedTotal = parseInt(squares[i].textContent) + parseInt(squares[i + width].textContent);
                squares[i].textContent = '';
                squares[i + width].textContent = combinedTotal;
                const cell = squares[i + width].parentElement;
                cell.classList.add('merge');
                setTimeout(() => {
                    cell.classList.remove('merge');
                }, 200);
                score += combinedTotal;
                scoreDisplay.textContent = score;
                merged = true;
            }
        }
        updateTileColors();
        return merged;
    }

    // 合并数字 - 向上
    function mergeUp() {
        let merged = false;
        for (let i = 4; i < 16; i++) {
            if (squares[i].textContent === squares[i - width].textContent && squares[i].textContent !== '') {
                let combinedTotal = parseInt(squares[i].textContent) + parseInt(squares[i - width].textContent);
                squares[i].textContent = '';
                squares[i - width].textContent = combinedTotal;
                const cell = squares[i - width].parentElement;
                cell.classList.add('merge');
                setTimeout(() => {
                    cell.classList.remove('merge');
                }, 200);
                score += combinedTotal;
                scoreDisplay.textContent = score;
                merged = true;
            }
        }
        updateTileColors();
        return merged;
    }

    // 更新方块颜色
    function updateTileColors() {
        squares.forEach(square => {
            const cell = square.parentElement;
            cell.className = 'cell';
            if (square.textContent !== '') {
                cell.classList.add(`tile-${square.textContent}`);
            }
        });
    }

    // 保存当前状态
    function saveState() {
        previousState = squares.map(square => square.textContent);
        previousScore = score;
        canUndo = true;
    }

    // 撤回到上一步
    function undo() {
        if (!canUndo || !previousState) return;
        
        squares.forEach((square, index) => {
            square.textContent = previousState[index];
            square.className = 'cell';
            if (square.textContent !== '') {
                square.classList.add(`tile-${square.textContent}`);
            }
        });
        
        score = previousScore;
        scoreDisplay.textContent = score;
        canUndo = false;
    }

    // 控制移动
    function control(e) {
        if (e.keyCode === 82) { // R键
            restartGame();
        } else if (e.keyCode === 90) { // Z键
            undo();
        } else if (e.keyCode === 39) {
            keyRight();
        } else if (e.keyCode === 37) {
            keyLeft();
        } else if (e.keyCode === 40) {
            keyDown();
        } else if (e.keyCode === 38) {
            keyUp();
        }
    }

    let isAnimating = false;

    // 向右移动
    function keyRight() {
        if (isAnimating) return;
        isAnimating = true;
        saveState();
        moveRight();
        const merged = mergeRight();
        moveRight();
        setTimeout(() => {
            generateNewNumber();
            isAnimating = false;
        }, merged ? 200 : 100);
    }

    // 向左移动
    function keyLeft() {
        if (isAnimating) return;
        isAnimating = true;
        saveState();
        moveLeft();
        const merged = mergeLeft();
        moveLeft();
        setTimeout(() => {
            generateNewNumber();
            isAnimating = false;
        }, merged ? 200 : 100);
    }

    // 向下移动
    function keyDown() {
        if (isAnimating) return;
        isAnimating = true;
        saveState();
        moveDown();
        const merged = mergeDown();
        moveDown();
        setTimeout(() => {
            generateNewNumber();
            isAnimating = false;
        }, merged ? 200 : 100);
    }

    // 向上移动
    function keyUp() {
        if (isAnimating) return;
        isAnimating = true;
        saveState();
        moveUp();
        const merged = mergeUp();
        moveUp();
        setTimeout(() => {
            generateNewNumber();
            isAnimating = false;
        }, merged ? 200 : 100);
    }

    // 检查游戏是否结束
    function checkForGameOver() {
        let isGameOver = true;

        // 检查是否还有空方块
        for (let i = 0; i < squares.length; i++) {
            if (squares[i].textContent === '') {
                isGameOver = false;
                break;
            }
        }

        // 检查是否还有可合并的方块
        if (isGameOver) {
            for (let i = 0; i < squares.length; i++) {
                // 检查右侧
                if (i % 4 !== 3 && squares[i].textContent === squares[i + 1].textContent) {
                    isGameOver = false;
                    break;
                }
                // 检查下方
                if (i < 12 && squares[i].textContent === squares[i + width].textContent) {
                    isGameOver = false;
                    break;
                }
            }
        }

        // 游戏结束
        if (isGameOver) {
            setTimeout(() => {
                gameOverDisplay.style.display = 'flex';
                finalScoreDisplay.textContent = score;
            }, 500);
            document.removeEventListener('keyup', control);
        }
    }

    // 重新开始游戏
    function restartGame() {
        // 清空棋盘
        squares.forEach(square => {
            square.textContent = '';
            square.className = 'cell';
        });

        // 重置分数和状态
        score = 0;
        scoreDisplay.textContent = score;
        previousState = null;
        previousScore = 0;
        canUndo = false;

        // 隐藏游戏结束界面
        gameOverDisplay.style.display = 'none';

        // 生成新数字
        generateNewNumber();
        generateNewNumber();

        // 重新添加事件监听
        document.addEventListener('keyup', control);
    }

    // 触摸处理
    let touchStartX = 0;
    let touchStartY = 0;
    let lastTapTime = 0;
    let hasMoved = false;
    
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        hasMoved = false;
        
        // 检测双击重新开始
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;
        if (tapLength < 300 && tapLength > 0 && !hasMoved) {
            e.preventDefault();
            restartGame();
        }
        lastTapTime = currentTime;
    }
    
    function handleTouchMove(e) {
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        const minSwipeDistance = 30;
        
        if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
            e.preventDefault();
            hasMoved = true;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) {
                    keyRight();
                } else {
                    keyLeft();
                }
            } else {
                if (deltaY > 0) {
                    keyDown();
                } else {
                    keyUp();
                }
            }
            
            touchStartX = 0;
            touchStartY = 0;
        }
    }
    
    // 初始化游戏
    createBoard();
    document.addEventListener('keyup', control);
    restartButton.addEventListener('click', restartGame);
    
    // 添加触摸事件监听
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
});