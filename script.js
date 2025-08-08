// Mengambil elemen canvas dan score dari HTML
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Ukuran setiap kotak dalam grid game
const gridSize = 20;
let tileCount = canvas.width / gridSize;

// Inisialisasi variabel game
let snake = [{ x: 10, y: 10 }]; // Ular dimulai di tengah
let food = {};
let score = 0;
let dx = 0; // Arah pergerakan horizontal (velocity)
let dy = 0; // Arah pergerakan vertikal
let changingDirection = false; // Mencegah ular berbalik arah instan

// Memulai game
main();
generateFood();

// Event listener untuk mengontrol ular dengan keyboard
document.addEventListener('keydown', changeDirection);

/**
 * Fungsi utama game (Game Loop)
 * Dijalankan berulang kali untuk memperbarui dan menggambar game.
 */
function main() {
    // Jika game over, hentikan loop
    if (didGameEnd()) {
        alert("GAME OVER! Coba lagi.");
        // Reset game
        document.location.reload();
        return;
    }

    changingDirection = false;
    setTimeout(function onTick() {
        clearCanvas();
        drawFood();
        advanceSnake();
        drawSnake();

        // Panggil kembali fungsi main untuk loop berikutnya
        main();
    }, 100); // Kecepatan game (100ms = 10 frame per detik)
}

/** Membersihkan canvas sebelum menggambar frame baru */
function clearCanvas() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/** Menggambar makanan di canvas */
function drawFood() {
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'darkred';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

/** Menggerakkan ular dan memeriksa apakah makan */
function advanceSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head); // Tambahkan kepala baru ke depan

    // Cek apakah ular memakan makanan
    if (head.x === food.x && head.y === food.y) {
        // Tambah skor
        score += 10;
        scoreElement.textContent = score;
        // Buat makanan baru
        generateFood();
    } else {
        // Jika tidak makan, hapus ekor ular
        snake.pop();
    }
}

/** Menggambar seluruh bagian tubuh ular */
function drawSnake() {
    snake.forEach(part => {
        ctx.fillStyle = 'lightgreen';
        ctx.strokeStyle = 'darkgreen';
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
    });
}

/** Membuat posisi acak untuk makanan */
function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    // Pastikan makanan tidak muncul di atas ular
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) {
            generateFood();
        }
    });
}

/** Mengubah arah ular berdasarkan input keyboard */
function changeDirection(event) {
    if (changingDirection) return;
    changingDirection = true;

    const keyPressed = event.key;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === 0;

    // Arah panah keyboard
    if (keyPressed === 'ArrowLeft' && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === 'ArrowUp' && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === 'ArrowRight' && !goingLeft && dx !==-1) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === 'ArrowDown' && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

/** Memeriksa kondisi game over */
function didGameEnd() {
    // Cek tabrakan dengan diri sendiri
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    // Cek tabrakan dengan dinding
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > tileCount - 1;
    const hitToptWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > tileCount - 1;

    return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall;
}
