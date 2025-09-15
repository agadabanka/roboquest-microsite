/*
ROBOQUEST MAIN GAME INITIALIZATION
Brings together all game systems
*/

// Global game state
let gameLogic = null;
let isGameInitialized = false;

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🤖 Starting RoboQuest...');
    
    // Wait a moment for CDN libraries to load
    setTimeout(() => {
        if (typeof THREE === 'undefined') {
            console.error('❌ Three.js or Cannon.js not loaded!');
            console.log('🔄 Retrying library check...');
            
            // Retry after a longer delay
            setTimeout(() => {
                if (typeof THREE === 'undefined') {
                    console.error('❌ Final attempt failed - libraries not available');
                    document.getElementById('loading').innerHTML = '<div class="loading-spinner"></div><div>Failed to load 3D libraries. Please refresh.</div>';
                    return;
                }
                initializeGame();
            }, 2000);
            return;
        }
        
        console.log('✅ Libraries loaded successfully');
        initializeGame();
    }, 1000);
});

function initializeGame() {
    try {
        // Create game engine (already created globally)
        if (!window.gameEngine) {
            console.error('❌ Game engine not initialized!');
            return;
        }
        
        console.log('🎮 Game engine ready');
        
        // Initialize game logic
        gameLogic = new GameLogic(window.gameEngine);
        window.gameLogic = gameLogic; // Make available to engine
        
        // Set up additional event listeners
        setupGameControls();
        
        // Start the game loop
        window.gameEngine.animate();
        
        // Mobile optimizations
        gameLogic.optimizeForMobile();
        
        isGameInitialized = true;
        
        console.log('✅ RoboQuest initialized successfully!');
        console.log('🎯 Collect all coins and gems to complete the level!');
        
        // Performance monitoring
        monitorPerformance();
        
    } catch (error) {
        console.error('❌ Game initialization failed:', error);
        showErrorMessage('Failed to initialize game. Please refresh the page.');
    }
}

function setupGameControls() {
    // Additional keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (!gameLogic) return;
        
        switch(event.code) {
            case 'KeyR':
                if (gameLogic.gameState === 'gameOver' || gameLogic.gameState === 'levelComplete') {
                    gameLogic.restart();
                }
                break;
                
            case 'KeyP':
                if (gameLogic.gameState === 'playing') {
                    gameLogic.pause();
                } else if (gameLogic.gameState === 'paused') {
                    gameLogic.resume();
                }
                break;
                
            case 'KeyF':
                gameLogic.toggleDebugMode();
                break;
                
            case 'KeyM':
                // Mute/unmute toggle (for future audio)
                console.log('🔇 Audio toggle (not implemented yet)');
                break;
                
            case 'Escape':
                // Return to main site
                if (confirm('Return to RoboQuest website?')) {
                    window.location.href = '../index.html';
                }
                break;
        }
    });
    
    // Mouse controls for camera (future enhancement)
    let isMouseDown = false;
    let mouseLastX = 0;
    let mouseLastY = 0;
    
    document.addEventListener('mousedown', function(event) {
        if (event.button === 2) { // Right click for camera control
            isMouseDown = true;
            mouseLastX = event.clientX;
            mouseLastY = event.clientY;
        }
    });
    
    document.addEventListener('mouseup', function(event) {
        if (event.button === 2) {
            isMouseDown = false;
        }
    });
    
    document.addEventListener('mousemove', function(event) {
        if (isMouseDown && gameLogic) {
            const deltaX = event.clientX - mouseLastX;
            const deltaY = event.clientY - mouseLastY;
            
            // Rotate camera around player (future feature)
            // For now, just log the input
            // console.log('Camera input:', deltaX, deltaY);
            
            mouseLastX = event.clientX;
            mouseLastY = event.clientY;
        }
    });
    
    // Touch controls for mobile (basic)
    setupTouchControls();
    
    // Window focus/blur handling
    window.addEventListener('blur', function() {
        if (gameLogic) gameLogic.onWindowBlur();
    });
    
    window.addEventListener('focus', function() {
        if (gameLogic) gameLogic.onWindowFocus();
    });
}

function setupTouchControls() {
    // Basic touch support for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', function(event) {
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', function(event) {
        event.preventDefault(); // Prevent scrolling
        
        const touch = event.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        
        // Simple touch-to-move mapping
        // Left side of screen = movement, right side = jump/hover
        if (touch.clientX < window.innerWidth / 2) {
            // Movement control
            if (Math.abs(deltaX) > 20 || Math.abs(deltaY) > 20) {
                // Simulate keyboard input based on touch direction
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    window.gameEngine.keys[deltaX > 0 ? 'KeyD' : 'KeyA'] = true;
                } else {
                    window.gameEngine.keys[deltaY < 0 ? 'KeyW' : 'KeyS'] = true;
                }
            }
        } else {
            // Jump/hover control
            window.gameEngine.keys['Space'] = true;
        }
    }, { passive: false });
    
    document.addEventListener('touchend', function(event) {
        // Clear all touch-simulated keys
        ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].forEach(key => {
            window.gameEngine.keys[key] = false;
        });
    }, { passive: true });
}

function monitorPerformance() {
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsDisplay = null;
    
    function updateFPS() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime >= lastTime + 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            
            if (!fpsDisplay) {
                fpsDisplay = document.createElement('div');
                fpsDisplay.style.cssText = `
                    position: absolute;
                    top: 20px;
                    right: 120px;
                    color: white;
                    font-size: 14px;
                    background: rgba(0,0,0,0.3);
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-family: monospace;
                `;
                document.getElementById('gameUI').appendChild(fpsDisplay);
            }
            
            fpsDisplay.textContent = `FPS: ${fps}`;
            
            // Log performance warnings
            if (fps < 30) {
                console.warn('⚠️ Low FPS detected:', fps);
            }
            
            frameCount = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(updateFPS);
    }
    
    updateFPS();
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        z-index: 1000;
    `;
    errorDiv.innerHTML = `
        <h3>Error</h3>
        <p>${message}</p>
        <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 15px;">Retry</button>
    `;
    
    document.body.appendChild(errorDiv);
}

// Game state management
function pauseGame() {
    if (gameLogic) gameLogic.pause();
}

function resumeGame() {
    if (gameLogic) gameLogic.resume();
}

function restartGame() {
    if (gameLogic) gameLogic.restart();
}

// Export functions for external access
window.RoboQuestGame = {
    pause: pauseGame,
    resume: resumeGame,
    restart: restartGame,
    isInitialized: () => isGameInitialized,
    getGameLogic: () => gameLogic,
    getPerformanceStats: () => gameLogic ? gameLogic.getPerformanceStats() : null
};

// Development helpers
window.RoboQuestDebug = {
    enableDebug: () => gameLogic?.enableDebugMode(),
    getPlayerInfo: () => gameLogic?.player?.getDebugInfo(),
    getWorldInfo: () => gameLogic?.worldManager?.getDebugInfo(),
    generateLevel: (level) => gameLogic?.loadLevel(level)
};

// Analytics and tracking (integrate with microsite analytics)
function trackGameEvent(action, label, value) {
    // Integrate with existing microsite analytics
    if (window.RoboQuest && window.RoboQuest.trackEvent) {
        window.RoboQuest.trackEvent('Game', action, label, value);
    }
    
    console.log('📊 Game event:', { action, label, value });
}

// Track important game events
document.addEventListener('DOMContentLoaded', function() {
    // Track game loads
    trackGameEvent('game_loaded', 'web_version', 1);
    
    // Track when player completes tutorial
    setTimeout(() => {
        if (gameLogic && gameLogic.player && gameLogic.player.coins > 0) {
            trackGameEvent('tutorial_progress', 'first_coin', gameLogic.player.coins);
        }
    }, 30000); // Check after 30 seconds
});

// Global error handling
window.addEventListener('error', function(event) {
    console.error('🚨 Game error:', event.error);
    trackGameEvent('error', event.error.message, 1);
});

// Console welcome message
console.log(`
🤖 Welcome to RoboQuest!
==========================================
🎮 3D Platformer built with Three.js
🚀 Astro Bot-inspired mechanics
📱 Web-first, mobile-ready
==========================================
Controls:
  WASD / Arrow Keys - Move
  Space - Jump / Hover
  Mouse - Camera (right-click drag)
  R - Restart
  P - Pause
  F - Debug mode
  ESC - Return to website
==========================================
Have fun exploring! 🎯
`);

// Prevent context menu on game canvas
document.getElementById('gameCanvas').addEventListener('contextmenu', function(e) {
    e.preventDefault();
});