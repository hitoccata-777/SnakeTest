document.addEventListener('DOMContentLoaded', () => {
    // 获取Canvas元素和上下文
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // 游戏配置
    const gridSize = 20; // 网格大小
    const tileCount = canvas.width / gridSize; // 网格数量
    let speed = 7; // 游戏速度（默认值）
    
    // 蛇的初始位置和速度
    let snake = [
        {x: 10, y: 10}
    ];
    let velocityX = 0;
    let velocityY = 0;
    
    // 食物位置
    let foodX;
    let foodY;
    
    // 游戏状态
    let gameRunning = false;
    let gamePaused = false;
    let gameOver = false;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    
    // 获取DOM元素
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const finalScoreElement = document.getElementById('finalScore');
    const gameOverElement = document.getElementById('gameOver');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const restartButton = document.getElementById('restartButton');
    const speedRange = document.getElementById('speedRange');
    const speedValue = document.getElementById('speedValue');
    
    // 更新高分显示
    highScoreElement.textContent = highScore;
    
    // 生成随机食物位置
    function placeFood() {
        // 生成随机坐标
        foodX = Math.floor(Math.random() * tileCount);
        foodY = Math.floor(Math.random() * tileCount);
        
        // 确保食物不会出现在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === foodX && snake[i].y === foodY) {
                placeFood(); // 如果食物出现在蛇身上，重新生成
                return;
            }
        }
    }
    
    // 游戏主循环
    function gameLoop() {
        if (gameOver) return;
        if (gamePaused) return;
        
        setTimeout(() => {
            if (gameRunning) {
                requestAnimationFrame(gameLoop);
                updateGame();
                drawGame();
            }
        }, 1000 / speed);
    }
    
    // 更新游戏状态
    function updateGame() {
        // 移动蛇头
        let headX = snake[0].x + velocityX;
        let headY = snake[0].y + velocityY;
        
        // 检查是否撞墙
        if (headX < 0 || headY < 0 || headX >= tileCount || headY >= tileCount) {
            endGame();
            return;
        }
        
        // 检查是否撞到自己
        for (let i = 1; i < snake.length; i++) {
            if (headX === snake[i].x && headY === snake[i].y) {
                endGame();
                return;
            }
        }
        
        // 添加新的蛇头
        snake.unshift({x: headX, y: headY});
        
        // 检查是否吃到食物
        if (headX === foodX && headY === foodY) {
            // 增加分数
            score += 10;
            scoreElement.textContent = score;
            
            // 更新最高分
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // 生成新的食物
            placeFood();
            
            // 每得100分增加速度
            if (score % 100 === 0) {
                speed += 1;
            }
        } else {
            // 如果没有吃到食物，移除蛇尾
            snake.pop();
        }
    }
    
    // 绘制游戏
    function drawGame() {
        // 清空画布
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制食物
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize - 2, gridSize - 2);
        
        // 绘制蛇
        for (let i = 0; i < snake.length; i++) {
            // 蛇头使用不同颜色
            if (i === 0) {
                ctx.fillStyle = '#39ff14'; // 亮绿色蛇头
            } else {
                // 蛇身体渐变色
                const greenValue = 255 - (i * 10) % 100;
                ctx.fillStyle = `rgb(0, ${greenValue}, 0)`;
            }
            ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
            
            // 绘制蛇眼睛（只在蛇头上）
            if (i === 0) {
                ctx.fillStyle = '#000';
                // 根据移动方向确定眼睛位置
                if (velocityX === 1) { // 向右
                    ctx.fillRect((snake[i].x * gridSize) + gridSize - 7, (snake[i].y * gridSize) + 5, 4, 4);
                    ctx.fillRect((snake[i].x * gridSize) + gridSize - 7, (snake[i].y * gridSize) + gridSize - 9, 4, 4);
                } else if (velocityX === -1) { // 向左
                    ctx.fillRect((snake[i].x * gridSize) + 3, (snake[i].y * gridSize) + 5, 4, 4);
                    ctx.fillRect((snake[i].x * gridSize) + 3, (snake[i].y * gridSize) + gridSize - 9, 4, 4);
                } else if (velocityY === -1) { // 向上
                    ctx.fillRect((snake[i].x * gridSize) + 5, (snake[i].y * gridSize) + 3, 4, 4);
                    ctx.fillRect((snake[i].x * gridSize) + gridSize - 9, (snake[i].y * gridSize) + 3, 4, 4);
                } else if (velocityY === 1) { // 向下
                    ctx.fillRect((snake[i].x * gridSize) + 5, (snake[i].y * gridSize) + gridSize - 7, 4, 4);
                    ctx.fillRect((snake[i].x * gridSize) + gridSize - 9, (snake[i].y * gridSize) + gridSize - 7, 4, 4);
                } else { // 初始状态（未移动）
                    ctx.fillRect((snake[i].x * gridSize) + gridSize - 7, (snake[i].y * gridSize) + 5, 4, 4);
                    ctx.fillRect((snake[i].x * gridSize) + gridSize - 7, (snake[i].y * gridSize) + gridSize - 9, 4, 4);
                }
            }
        }
        
        // 绘制网格线（可选）
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < tileCount; i++) {
            // 垂直线
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            
            // 水平线
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }
    }
    
    // 游戏结束
    function endGame() {
        gameRunning = false;
        gameOver = true;
        finalScoreElement.textContent = score;
        gameOverElement.style.display = 'flex';
    }
    
    // 重置游戏
    function resetGame() {
        snake = [{x: 10, y: 10}];
        velocityX = 0;
        velocityY = 0;
        score = 0;
        speed = parseInt(speedRange.value);
        speedValue.textContent = speed;
        scoreElement.textContent = '0';
        gameOver = false;
        gameOverElement.style.display = 'none';
        placeFood();
    }
    
    // 开始游戏
    function startGame() {
        if (!gameRunning && !gamePaused) {
            resetGame();
            gameRunning = true;
            gameLoop();
            startButton.textContent = '重新开始';
        } else if (gameRunning && !gamePaused) {
            resetGame();
            gameLoop();
        }
    }
    
    // 暂停/继续游戏
    function togglePause() {
        if (!gameRunning || gameOver) return;
        
        gamePaused = !gamePaused;
        pauseButton.textContent = gamePaused ? '继续' : '暂停';
        
        if (!gamePaused) {
            gameLoop();
        }
    }
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        // 防止按键导致页面滚动
        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
        
        // 如果游戏未开始或已结束，不响应方向键
        if (!gameRunning || gameOver) return;
        
        // 根据按键改变蛇的移动方向
        switch(e.key) {
            case 'ArrowUp':
                if (velocityY !== 1) { // 防止直接反向移动
                    velocityX = 0;
                    velocityY = -1;
                }
                break;
            case 'ArrowDown':
                if (velocityY !== -1) {
                    velocityX = 0;
                    velocityY = 1;
                }
                break;
            case 'ArrowLeft':
                if (velocityX !== 1) {
                    velocityX = -1;
                    velocityY = 0;
                }
                break;
            case 'ArrowRight':
                if (velocityX !== -1) {
                    velocityX = 1;
                    velocityY = 0;
                }
                break;
            case ' ': // 空格键暂停/继续
                togglePause();
                break;
        }
    });
    
    // 触摸屏控制（适用于移动设备）
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, false);
    
    canvas.addEventListener('touchmove', (e) => {
        if (!gameRunning || gameOver) return;
        e.preventDefault();
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        // 确定滑动方向
        if (Math.abs(dx) > Math.abs(dy)) {
            // 水平滑动
            if (dx > 0 && velocityX !== -1) { // 向右滑动
                velocityX = 1;
                velocityY = 0;
            } else if (dx < 0 && velocityX !== 1) { // 向左滑动
                velocityX = -1;
                velocityY = 0;
            }
        } else {
            // 垂直滑动
            if (dy > 0 && velocityY !== -1) { // 向下滑动
                velocityX = 0;
                velocityY = 1;
            } else if (dy < 0 && velocityY !== 1) { // 向上滑动
                velocityX = 0;
                velocityY = -1;
            }
        }
        
        // 更新起始点，使滑动更流畅
        touchStartX = touchEndX;
        touchStartY = touchEndY;
    }, false);
    
    // 按钮事件监听
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);
    restartButton.addEventListener('click', () => {
        resetGame();
        gameRunning = true;
        gameLoop();
        startButton.textContent = '重新开始';
        pauseButton.textContent = '暂停';
        gamePaused = false;
    });
    
    // 速度调整
    speedRange.addEventListener('input', () => {
        const newSpeed = parseInt(speedRange.value);
        speedValue.textContent = newSpeed;
        if (gameRunning && !gamePaused) {
            speed = newSpeed;
        }
    });
    
    // 初始化食物位置
    placeFood();
    
    // 初始绘制游戏
    drawGame();
});