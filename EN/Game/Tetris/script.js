// 游戏常量
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    'cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'
];

// 方块形状定义
const SHAPES = [
    [[1, 1, 1, 1]],                 // I
    [[1, 1, 1], [0, 1, 0]],        // T
    [[1, 1, 1], [1, 0, 0]],        // L
    [[1, 1, 1], [0, 0, 1]],        // J
    [[1, 1], [1, 1]],              // O
    [[1, 1, 0], [0, 1, 1]],        // Z
    [[0, 1, 1], [1, 1, 0]]         // S
];

// 游戏状态
let canvas, ctx;
let nextCanvas, nextCtx;
let grid;
let score = 0;
let level = 1;
let lines = 0;
let gameLoop;
let currentPiece;
let nextPiece;
let gameOver = false;
let isPaused = false;

// 初始化游戏
function init() {
    // 设置主游戏画布
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;

    // 设置下一个方块预览画布
    nextCanvas = document.getElementById('nextCanvas');
    nextCtx = nextCanvas.getContext('2d');
    nextCanvas.width = 4 * BLOCK_SIZE;
    nextCanvas.height = 4 * BLOCK_SIZE;

    // 初始化游戏网格
    grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    
    // 生成第一个方块
    currentPiece = getNewPiece();
    nextPiece = getNewPiece();
    
    // 添加事件监听
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);

    // 初始绘制
    draw();
}

// 生成新方块
function getNewPiece() {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const color = COLORS[shapeIndex];
    const shape = SHAPES[shapeIndex];
    
    return {
        shape,
        color,
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0
    };
}

// 绘制游戏状态
function draw() {
    // 清空主画布
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制已固定的方块
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (grid[row][col]) {
                drawBlock(ctx, col, row, grid[row][col]);
            }
        }
    }

    // 绘制当前方块
    if (currentPiece) {
        currentPiece.shape.forEach((row, i) => {
            row.forEach((value, j) => {
                if (value) {
                    drawBlock(ctx, currentPiece.x + j, currentPiece.y + i, currentPiece.color);
                }
            });
        });
    }

    // 清空预览画布并绘制下一个方块
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (nextPiece) {
        const offsetX = (4 - nextPiece.shape[0].length) / 2;
        const offsetY = (4 - nextPiece.shape.length) / 2;
        nextPiece.shape.forEach((row, i) => {
            row.forEach((value, j) => {
                if (value) {
                    drawBlock(nextCtx, offsetX + j, offsetY + i, nextPiece.color);
                }
            });
        });
    }
}

// 绘制单个方块
function drawBlock(context, x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
    context.strokeStyle = '#fff';
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
}

// 移动方块
function movePiece(dx, dy) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    if (hasCollision()) {
        currentPiece.x -= dx;
        currentPiece.y -= dy;
        return false;
    }
    draw();
    return true;
}

// 旋转方块
function rotatePiece() {
    const oldShape = currentPiece.shape;
    currentPiece.shape = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[row.length - 1 - i])
    );
    if (hasCollision()) {
        currentPiece.shape = oldShape;
    } else {
        draw();
    }
}

// 检查碰撞
function hasCollision() {
    return currentPiece.shape.some((row, i) => {
        return row.some((value, j) => {
            if (!value) return false;
            const x = currentPiece.x + j;
            const y = currentPiece.y + i;
            return x < 0 || x >= COLS || y >= ROWS || (y >= 0 && grid[y][x]);
        });
    });
}

// 固定方块
function lockPiece() {
    currentPiece.shape.forEach((row, i) => {
        row.forEach((value, j) => {
            if (value) {
                const y = currentPiece.y + i;
                const x = currentPiece.x + j;
                if (y >= 0) {
                    grid[y][x] = currentPiece.color;
                }
            }
        });
    });
}

// 消除完整行
function clearLines() {
    let linesCleared = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (grid[row].every(cell => cell !== 0)) {
            grid.splice(row, 1);
            grid.unshift(Array(COLS).fill(0));
            linesCleared++;
            row++;
        }
    }
    if (linesCleared > 0) {
        lines += linesCleared;
        score += linesCleared * 100 * level;
        level = Math.floor(lines / 10) + 1;
        updateScore();
    }
}

// 更新分数显示
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

// 游戏主循环
function gameStep() {
    if (!movePiece(0, 1)) {
        lockPiece();
        clearLines();
        currentPiece = nextPiece;
        nextPiece = getNewPiece();
        if (hasCollision()) {
            gameOver = true;
            alert('游戏结束！最终得分：' + score);
            clearInterval(gameLoop);
            return;
        }
    }
    draw();
}

// 处理键盘输入
function handleKeyPress(event) {
    if (gameOver || isPaused) return;

    switch(event.keyCode) {
        case 37: // 左箭头
            movePiece(-1, 0);
            break;
        case 39: // 右箭头
            movePiece(1, 0);
            break;
        case 40: // 下箭头
            movePiece(0, 1);
            break;
        case 38: // 上箭头
            rotatePiece();
            break;
        case 32: // 空格
            while(movePiece(0, 1)) {}
            break;
    }
}

// 开始游戏
function startGame() {
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    // 重置游戏状态
    grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    score = 0;
    level = 1;
    lines = 0;
    gameOver = false;
    isPaused = false;
    updateScore();
    
    currentPiece = getNewPiece();
    nextPiece = getNewPiece();
    draw();
    
    gameLoop = setInterval(() => {
        if (!isPaused) {
            gameStep();
        }
    }, 1000 / level);
}

// 切换暂停状态
function togglePause() {
    if (!gameOver) {
        isPaused = !isPaused;
        document.getElementById('pauseBtn').textContent = isPaused ? '继续' : '暂停';
    }
}

// 当页面加载完成时初始化游戏
window.addEventListener('load', init);
