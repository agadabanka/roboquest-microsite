/*
ROBOQUEST 3D GAME ENGINE
Three.js + Cannon.js foundation for Astro Bot-style platformer
*/

class GameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null; // Physics world
        this.clock = new THREE.Clock();
        
        // Game state
        this.isLoaded = false;
        this.isPaused = false;
        
        // Input handling
        this.keys = {};
        this.mouse = { x: 0, y: 0, clicked: false };
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createRenderer();
        this.createCamera();
        this.createPhysicsWorld();
        this.setupLighting();
        this.setupEventListeners();
        this.hideLoading();
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        
        // Sky gradient background (Astro Bot style)
        const skyColor = new THREE.Color(0x87CEEB); // Sky blue
        const groundColor = new THREE.Color(0x9370DB); // Purple
        this.scene.background = skyColor;
        
        // Add atmospheric fog for depth
        this.scene.fog = new THREE.Fog(skyColor, 100, 1000);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('gameCanvas'),
            antialias: true,
            alpha: false
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Enable shadows for realistic lighting
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Color space and tone mapping for vibrant colors
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }
    
    createCamera() {
        // Third-person camera setup (Astro Bot style)
        this.camera = new THREE.PerspectiveCamera(
            75, // FOV
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near
            1000 // Far
        );
        
        // Initial camera position (behind and above the player)
        this.camera.position.set(0, 8, 10);
        this.camera.lookAt(0, 2, 0);
    }
    
    createPhysicsWorld() {
        // Cannon.js physics world
        this.world = new CANNON.World();
        this.world.gravity.set(0, -30, 0); // Strong gravity for responsive platforming
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;
        
        // Contact materials for different surfaces
        const defaultMaterial = new CANNON.Material('default');
        const playerMaterial = new CANNON.Material('player');
        
        const defaultContactMaterial = new CANNON.ContactMaterial(
            defaultMaterial,
            playerMaterial,
            {
                friction: 0.8,
                restitution: 0.0 // No bouncing
            }
        );
        
        this.world.addContactMaterial(defaultContactMaterial);
    }
    
    setupLighting() {
        // Ambient light for overall scene brightness
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun) - Astro Bot style bright lighting
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        
        // Shadow camera setup for better shadow quality
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        
        this.scene.add(directionalLight);
        
        // Hemisphere light for softer fill lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x9370DB, 0.4);
        this.scene.add(hemisphereLight);
    }
    
    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        // Mouse input for camera control
        document.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        document.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Left click
                this.mouse.clicked = true;
            }
        });
        
        document.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                this.mouse.clicked = false;
            }
        });
        
        // Window resize handling
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Prevent context menu on right-click
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }
    
    hideLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            setTimeout(() => {
                loadingElement.style.opacity = '0';
                setTimeout(() => {
                    loadingElement.style.display = 'none';
                    this.isLoaded = true;
                }, 500);
            }, 1000);
        }
    }
    
    // Main game loop
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.isLoaded || this.isPaused) return;
        
        const deltaTime = this.clock.getDelta();
        
        // Update physics world
        this.world.step(deltaTime);
        
        // Update game objects (will be called by game logic)
        if (window.gameLogic) {
            window.gameLogic.update(deltaTime);
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
    
    // Utility methods for game objects
    createMaterial(color, options = {}) {
        return new THREE.MeshLambertMaterial({
            color: color,
            ...options
        });
    }
    
    createGeometry(type, ...params) {
        switch(type) {
            case 'box':
                return new THREE.BoxGeometry(...params);
            case 'sphere':
                return new THREE.SphereGeometry(...params);
            case 'cylinder':
                return new THREE.CylinderGeometry(...params);
            case 'plane':
                return new THREE.PlaneGeometry(...params);
            default:
                return new THREE.BoxGeometry(1, 1, 1);
        }
    }
    
    addToScene(object3D, physicsBody = null) {
        this.scene.add(object3D);
        if (physicsBody) {
            this.world.add(physicsBody);
        }
    }
    
    removeFromScene(object3D, physicsBody = null) {
        this.scene.remove(object3D);
        if (physicsBody) {
            this.world.remove(physicsBody);
        }
    }
    
    // Input helpers
    isKeyPressed(keyCode) {
        return !!this.keys[keyCode];
    }
    
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }
    
    isMouseClicked() {
        return this.mouse.clicked;
    }
    
    // Camera utilities
    setCameraPosition(x, y, z) {
        this.camera.position.set(x, y, z);
    }
    
    setCameraTarget(x, y, z) {
        this.camera.lookAt(x, y, z);
    }
    
    // Debug helpers
    addAxesHelper(size = 5) {
        const axesHelper = new THREE.AxesHelper(size);
        this.scene.add(axesHelper);
    }
    
    addGridHelper(size = 100, divisions = 50) {
        const gridHelper = new THREE.GridHelper(size, divisions);
        this.scene.add(gridHelper);
    }
    
    // Game state management
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
    }
    
    restart() {
        // Clear scene and reset game state
        while(this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
        
        while(this.world.bodies.length > 0) {
            this.world.remove(this.world.bodies[0]);
        }
        
        // Reinitialize lighting and world
        this.setupLighting();
        
        // Reset game logic
        if (window.gameLogic) {
            window.gameLogic.restart();
        }
    }
}

// Global game engine instance
window.gameEngine = new GameEngine();