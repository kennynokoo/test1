// Get a reference to the canvas element
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;

// Define the player object
const player = {
    x: 50,
    y: canvas.height - 100, // Initial y position
    width: 30,
    height: 50,
    color: 'blue',
    velocityX: 0,
    velocityY: 0,
    speed: 3,          // Adjusted speed for better control
    jumpStrength: 12,  // Adjusted jump strength
    isJumping: false,
    gravity: 0.5       // Adjusted gravity
};

// Object to store key states
const keys = {
    left: false,
    right: false,
    up: false // Or spacebar for jump
};

// Event Listeners for keyboard input
window.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'ArrowUp':
        case ' ': // Spacebar for jump
            keys.up = true;
            break;
    }
});

window.addEventListener('keyup', function(event) {
    switch (event.key) {
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
        case 'ArrowUp':
        case ' ': // Spacebar for jump
            keys.up = false;
            break;
    }
});

// Define an array for platforms
const platforms = [
    // Platform 1
    { x: 100, y: canvas.height - 150, width: 150, height: 20, color: 'green' },
    // Platform 2
    { x: 300, y: canvas.height - 250, width: 200, height: 20, color: 'green' },
    // Platform 3 (a bit higher and smaller)
    { x: 550, y: canvas.height - 350, width: 100, height: 20, color: 'orange' },
    // A wider ground platform (optional, as we already have a canvas bottom boundary)
    // { x: 0, y: canvas.height - 50, width: canvas.width, height: 50, color: 'darkgray' }
];

// Collision detection helper function (AABB - Axis-Aligned Bounding Box)
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Function to update player state based on input and physics
function updatePlayer() {
    // Horizontal movement input
    if (keys.left) {
        player.velocityX = -player.speed;
    } else if (keys.right) {
        player.velocityX = player.speed;
    } else {
        player.velocityX = 0;
    }

    // Jumping input
    if (keys.up && !player.isJumping) {
        player.velocityY = -player.jumpStrength;
        player.isJumping = true;
    }

    // Apply gravity (before y-axis collision checks)
    player.velocityY += player.gravity;

    // Update horizontal position first
    player.x += player.velocityX;

    // Horizontal collision with platforms
    platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            // Collision from the left (player moving right)
            if (player.velocityX > 0 && player.x + player.width > platform.x && player.x < platform.x) {
                player.x = platform.x - player.width;
                player.velocityX = 0; 
            }
            // Collision from the right (player moving left)
            else if (player.velocityX < 0 && player.x < platform.x + platform.width && player.x + player.width > platform.x + platform.width) {
                player.x = platform.x + platform.width;
                player.velocityX = 0;
            }
        }
    });


    // Update vertical position
    player.y += player.velocityY;

    // Vertical collision with platforms
    let onPlatform = false;
    platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            // Player is moving downwards and lands on top of the platform
            if (player.velocityY > 0 && (player.y + player.height - player.velocityY) <= platform.y) { 
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
                onPlatform = true;
            }
            // Player is moving upwards and hits the bottom of a platform
            else if (player.velocityY < 0 && player.y >= platform.y + platform.height - player.velocityY) { 
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
        }
    });

    // Screen boundaries and floor
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
    // Bottom boundary (floor) - only if not on a platform
    if (!onPlatform && player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }
    // Top boundary
    if (player.y < 0) {
        player.y = 0;
        player.velocityY = 0;
    }
}


// Function to draw the player
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Function to draw the platforms
function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

// Main update function
function update() {
    updatePlayer();
    // updatePlatforms(); // No updates needed for static platforms yet
}

// Game loop function
function gameLoop() {
    // 1. Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Update game state
    update(); 

    // 3. Draw game elements
    drawPlayer();
    drawPlatforms(); // Draw the platforms

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);

console.log("Player-platform collision detection implemented.");
