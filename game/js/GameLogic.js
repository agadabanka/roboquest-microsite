/*
ROBOQUEST GAME LOGIC
Core gameplay systems and mechanics
*/

class GameLogic {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.scene = gameEngine.scene;
        this.world = gameEngine.world;
        
        // Game objects
        this.player = null;
        this.worldManager = null;
        this.cameraController = null;
        
        // Game state
        this.gameState = 'playing'; // playing, paused, gameOver, levelComplete
        this.level = 1;
        this.score = 0;
        this.time = 0;
        
        // Audio context (for future sound effects)
        this.audioContext = null;
        
        this.init();
    }
    
    init() {
        // Create world first
        this.worldManager = new World(this.gameEngine);
        
        // Create player
        this.player = new Player(this.gameEngine);
        
        // Create camera controller (A/B by query: ?controller=egloff)
        const params = new URLSearchParams(window.location.search);
        const controller = params.get('controller');
        if (controller === 'egloff' && window.EgloffCameraRig) {
            this.cameraController = new EgloffCameraRig(this.gameEngine.camera, this.player, {
                height: 1.6, distance: 6.0
            });
            console.log('📷 Egloff camera rig created');
        } else {
            this.cameraController = new CameraController(this.gameEngine.camera, this.player);
            console.log('📷 3rd person camera controller created');
        }
        
        // Initialize audio (basic web audio for effects)
        this.initAudio();
        
        console.log('🎮 RoboQuest game initialized!');
        console.log('🤖 Use WASD/Arrow keys to move, Space to jump, Mouse to hover');
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Audio context not available');
        }
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.time += deltaTime;
        
        // Update game objects
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Update camera controller
        if (this.cameraController) {
            this.cameraController.update(deltaTime);
        }
        
        if (this.worldManager) {
            this.worldManager.update(deltaTime);
        }
        
        // Game logic checks
        this.checkCollectibles();
        this.checkGameState();
        this.checkPlayerBounds();
    }
    
    checkCollectibles() {
        if (!this.player || !this.worldManager) return;
        
        const playerPos = this.player.getPosition();
        const collected = this.worldManager.checkCollectibleCollisions(playerPos);
        
        collected.forEach(item => {
            this.collectItem(item);
        });
    }
    
    collectItem(item) {
        switch(item.type) {
            case 'coin':
                this.player.collectCoin();
                this.score += item.value * 100;
                this.playSound('collect');
                break;
                
            case 'gem':
                this.player.coins += item.value;
                this.score += item.value * 500;
                this.playSound('gem');
                break;
        }
        
        // Update HUD immediately
        this.updateHUD();
    }
    
    checkGameState() {
        // Check level completion
        if (this.worldManager && this.worldManager.isLevelComplete()) {
            this.completeLevel();
        }
        
        // Check game over conditions
        if (this.player && !this.player.isAlive()) {
            this.gameOver();
        }
    }
    
    checkPlayerBounds() {
        if (!this.player) return;
        
        const playerY = this.player.getPosition().y;
        
        // If player falls too far, respawn
        if (playerY < -20) {
            this.player.takeDamage();
            if (this.player.isAlive()) {
                this.player.respawn();
                this.playSound('damage');
            }
        }
    }
    
    completeLevel() {
        this.gameState = 'levelComplete';
        console.log('🎉 Level Complete!');
        
        // Show completion message
        this.showMessage('Level Complete!', 'Press R to restart or continue exploring');
        
        // Play completion sound
        this.playSound('victory');
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        console.log('💀 Game Over!');
        
        this.showMessage('Game Over!', 'Press R to restart your adventure');
        this.playSound('gameOver');
    }
    
    restart() {
        // Reset game state
        this.gameState = 'playing';
        this.score = 0;
        this.time = 0;
        this.level = 1;
        
        // Reset player
        if (this.player) {
            this.player.lives = 3;
            this.player.health = 3;
            this.player.coins = 0;
            this.player.respawn();
        }
        
        // Reset world
        if (this.worldManager) {
            this.worldManager.reset();
        }
        
        this.hideMessage();
        this.updateHUD();
        
        console.log('🔄 Game restarted!');
    }
    
    pause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.gameEngine.pause();
            this.showMessage('Paused', 'Press P to resume');
        }
    }
    
    resume() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.gameEngine.resume();
            this.hideMessage();
        }
    }
    
    // UI Management
    updateHUD() {
        const scoreElement = document.getElementById('score');
        const livesElement = document.getElementById('lives');
        
        if (scoreElement && this.player) {
            scoreElement.textContent = `Coins: ${this.player.coins}`;
        }
        
        if (livesElement && this.player) {
            livesElement.textContent = `Lives: ${this.player.lives}`;
        }
    }
    
    showMessage(title, subtitle = '') {
        // Create or update message overlay
        let messageDiv = document.getElementById('gameMessage');
        
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'gameMessage';
            messageDiv.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                font-family: 'Fredoka One', cursive;
                z-index: 200;
                backdrop-filter: blur(10px);
                border: 2px solid #50E3C2;
            `;
            document.getElementById('gameUI').appendChild(messageDiv);
        }
        
        messageDiv.innerHTML = `
            <h2 style="margin: 0 0 10px 0; font-size: 2rem; color: #50E3C2;">${title}</h2>
            <p style="margin: 0; font-size: 1rem; opacity: 0.9;">${subtitle}</p>
        `;
        
        messageDiv.style.display = 'block';
    }
    
    hideMessage() {
        const messageDiv = document.getElementById('gameMessage');
        if (messageDiv) {
            messageDiv.style.display = 'none';
        }
    }
    
    // Basic sound effects using Web Audio API
    playSound(type) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Different sounds for different actions
        switch(type) {
            case 'collect':
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                break;
                
            case 'gem':
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                break;
                
            case 'jump':
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                break;
                
            case 'damage':
                oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                break;
                
            case 'victory':
                // Victory fanfare
                [440, 554, 659, 880].forEach((freq, index) => {
                    setTimeout(() => {
                        const osc = this.audioContext.createOscillator();
                        const gain = this.audioContext.createGain();
                        osc.connect(gain);
                        gain.connect(this.audioContext.destination);
                        
                        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                        
                        osc.start();
                        osc.stop(this.audioContext.currentTime + 0.3);
                    }, index * 100);
                });
                return; // Don't execute default oscillator code
                
            default:
                oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        }
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    // Additional input handling for game-specific controls
    handleSpecialInput() {
        // Handle restart (R key)
        if (this.gameEngine.isKeyPressed('KeyR')) {
            if (this.gameState === 'gameOver' || this.gameState === 'levelComplete') {
                this.restart();
            }
        }
        
        // Handle pause (P key)
        if (this.gameEngine.isKeyPressed('KeyP')) {
            if (this.gameState === 'playing') {
                this.pause();
            } else if (this.gameState === 'paused') {
                this.resume();
            }
        }
        
        // Handle debug mode (F key)
        if (this.gameEngine.isKeyPressed('KeyF')) {
            this.toggleDebugMode();
        }
    }
    
    toggleDebugMode() {
        // Toggle wireframe mode and debug info
        this.scene.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.wireframe = !child.material.wireframe;
            }
        });
        
        console.log('🔧 Debug mode toggled');
        console.log('Player:', this.player?.getDebugInfo());
        console.log('World:', this.worldManager?.getDebugInfo());
    }
    
    // Game progression and scoring
    calculateScore() {
        const timeBonus = Math.max(0, 300 - Math.floor(this.time));
        const coinBonus = this.player ? this.player.coins * 100 : 0;
        const healthBonus = this.player ? this.player.health * 50 : 0;
        
        return this.score + timeBonus + coinBonus + healthBonus;
    }
    
    // Level management (for future expansion)
    loadLevel(levelNumber) {
        this.level = levelNumber;
        
        // Clear current world
        if (this.worldManager) {
            this.worldManager.reset();
        }
        
        // Generate level-specific content
        switch(levelNumber) {
            case 1:
                // Tutorial level (current level)
                break;
            case 2:
                // Add more challenging platforms
                this.worldManager.generatePlatformSequence(100, 5, 0, 10);
                break;
            default:
                // Procedurally generated content
                this.generateProceduralLevel(levelNumber);
        }
    }
    
    generateProceduralLevel(level) {
        // Simple procedural generation based on level number
        const platformCount = 5 + level * 2;
        const startX = level * 50;
        
        this.worldManager.generatePlatformSequence(startX, 5, 0, platformCount);
        
        console.log(`🏗️ Generated level ${level} with ${platformCount} platforms`);
    }
    
    // Performance monitoring
    getPerformanceStats() {
        return {
            fps: this.gameEngine.clock.getFPS ? this.gameEngine.clock.getFPS() : 60,
            deltaTime: this.gameEngine.clock.getDelta(),
            objects: this.scene.children.length,
            physicsObjects: this.world.bodies.length
        };
    }
    
    // Save/Load (localStorage for web)
    saveGame() {
        const saveData = {
            level: this.level,
            score: this.score,
            playerCoins: this.player ? this.player.coins : 0,
            timestamp: Date.now()
        };
        
        localStorage.setItem('roboquest_save', JSON.stringify(saveData));
        console.log('💾 Game saved!');
    }
    
    loadGame() {
        const saveData = localStorage.getItem('roboquest_save');
        
        if (saveData) {
            const data = JSON.parse(saveData);
            this.level = data.level;
            this.score = data.score;
            
            if (this.player) {
                this.player.coins = data.playerCoins;
            }
            
            console.log('📂 Game loaded!');
            return true;
        }
        
        return false;
    }
    
    // Mobile-specific optimizations
    optimizeForMobile() {
        // Reduce shadow quality on mobile
        if (window.innerWidth < 768) {
            this.gameEngine.renderer.shadowMap.enabled = false;
            
            // Reduce particle counts
            if (this.player && this.player.hoverParticles) {
                this.player.hoverParticles.geometry.attributes.position.count *= 0.5;
            }
            
            console.log('📱 Mobile optimizations applied');
        }
    }
    
    // Debug helpers
    enableDebugMode() {
        // Add debug helpers to scene
        this.gameEngine.addAxesHelper(10);
        this.gameEngine.addGridHelper(100, 50);
        
        // Enable wireframe mode
        this.scene.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.wireframe = true;
            }
        });
        
        console.log('🔧 Debug mode enabled');
    }
    
    // Event handlers for external controls
    onWindowBlur() {
        // Auto-pause when window loses focus
        if (this.gameState === 'playing') {
            this.pause();
        }
    }
    
    onWindowFocus() {
        // Auto-resume when window gains focus (optional)
        // if (this.gameState === 'paused') {
        //     this.resume();
        // }
    }
    
    // Cleanup
    destroy() {
        // Clean up resources
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        // Remove event listeners
        window.removeEventListener('blur', this.onWindowBlur.bind(this));
        window.removeEventListener('focus', this.onWindowFocus.bind(this));
    }
}

// Export for global access
window.GameLogic = GameLogic;
