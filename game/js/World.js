/*
ROBOQUEST 3D WORLD
Colorful, vibrant world generation inspired by Astro Bot
*/

class World {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.scene = gameEngine.scene;
        this.world = gameEngine.world;
        
        // World objects
        this.platforms = [];
        this.collectibles = [];
        this.decorations = [];
        
        // Materials library
        this.materials = this.createMaterials();
        
        this.generateWorld();
    }
    
    createMaterials() {
        console.log('🎨 TEXTURE STEP 2: Creating textured platform materials...');
        
        const textureLoader = new THREE.TextureLoader();
        
        return {
            // Platform materials with textures (Astro Bot style)
            platform: this.createTexturedPlatformMaterial(textureLoader, 0x50E3C2, 'cyan'),
            platformAlt: this.createTexturedPlatformMaterial(textureLoader, 0xF5A623, 'orange'),
            platformSpecial: this.createTexturedPlatformMaterial(textureLoader, 0xFF6B9D, 'pink'),
            
            // Collectible materials
            coin: new THREE.MeshLambertMaterial({ 
                color: 0xFFD700,
                emissive: 0x332200
            }),
            
            gem: new THREE.MeshLambertMaterial({ 
                color: 0x9932CC,
                emissive: 0x1f0a29,
                transparent: true,
                opacity: 0.9
            }),
            
            // Environment materials
            ground: new THREE.MeshLambertMaterial({ 
                color: 0x98FB98, // Light green ground
                emissive: 0x0f1f0f
            }),
            
            wall: new THREE.MeshLambertMaterial({ 
                color: 0x6495ED, // Cornflower blue walls
                emissive: 0x0d1529
            }),
            
            decoration: new THREE.MeshLambertMaterial({ 
                color: 0xDDA0DD, // Plum decorations
                emissive: 0x1f141f
            })
        };
    }
    
    generateWorld() {
        this.createGround();
        this.createStartingArea();
        this.createFloatingPlatforms();
        this.createCollectibles();
        this.createDecorations();
        this.createBoundaries();
    }
    
    createGround() {
        console.log('🎨 TEXTURE STEP 1: Creating textured ground...');
        
        // Create textured ground material
        const textureLoader = new THREE.TextureLoader();
        
        // Load grass texture from web (free texture). If it fails, continue without map.
        let grassTexture = null;
        try {
            grassTexture = textureLoader.load(
                'https://threejs.org/examples/textures/terrain/grasslight-big.jpg',
                () => console.log('✅ Grass texture loaded successfully'),
                undefined,
                (error) => {
                    console.warn('⚠️ Grass texture failed, using color-only material');
                }
            );
        } catch (e) {
            console.warn('⚠️ Grass texture load threw synchronously, proceeding without it');
        }
        
        // Configure texture for tiling
        if (grassTexture && grassTexture.wrapS !== undefined) {
            grassTexture.wrapS = THREE.RepeatWrapping;
            grassTexture.wrapT = THREE.RepeatWrapping;
            grassTexture.repeat.set(20, 20); // Tile 20x20 times for detail
        }
        
        // Create textured material
        const groundMaterialParams = { color: 0x90EE90 };
        if (grassTexture) groundMaterialParams.map = grassTexture;
        const groundMaterial = new THREE.MeshLambertMaterial(groundMaterialParams);
        
        // Main ground plane with texture
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.position.y = 0;
        groundMesh.receiveShadow = true;
        
        this.scene.add(groundMesh);
        
        console.log('🌍 Textured ground plane created and added to scene');
        console.log('📍 Ground position:', groundMesh.position);
        
        // Physics ground (re-enabled with working Cannon.js v0.6.2)
        console.log('🌍 STEP 3: Creating physics ground...');
        try {
            const groundShape = new CANNON.Box(new CANNON.Vec3(100, 0.1, 100));
            const groundBody = new CANNON.Body({ mass: 0 });
            groundBody.addShape(groundShape);
            groundBody.position.set(0, 0, 0);
            this.world.add(groundBody);
            console.log('✅ Physics ground created successfully');
        } catch (e) {
            console.error('❌ Physics ground creation failed:', e);
        }
    }
    
    createStartingArea() {
        // Starting platform (safe spawn area)
        this.createPlatform(0, 1, 0, 8, 1, 8, this.materials.platform);
        
        // Tutorial platforms leading away from start
        this.createPlatform(10, 2, 0, 4, 1, 4, this.materials.platformAlt);
        this.createPlatform(18, 3, 2, 4, 1, 4, this.materials.platform);
        this.createPlatform(25, 4, -3, 4, 1, 4, this.materials.platformSpecial);
    }
    
    createFloatingPlatforms() {
        // Create a series of floating platforms (Astro Bot style)
        const platformConfigs = [
            // Position (x, y, z), Size (w, h, d), Material
            { pos: [35, 6, 0], size: [3, 1, 3], material: 'platform' },
            { pos: [42, 8, 5], size: [3, 1, 3], material: 'platformAlt' },
            { pos: [48, 10, -2], size: [3, 1, 3], material: 'platform' },
            { pos: [55, 12, 3], size: [4, 1, 4], material: 'platformSpecial' },
            { pos: [65, 8, -5], size: [3, 1, 6], material: 'platform' },
            { pos: [75, 6, 2], size: [3, 1, 3], material: 'platformAlt' },
            { pos: [85, 10, -3], size: [5, 1, 5], material: 'platformSpecial' },
            
            // Side platforms for exploration
            { pos: [15, 8, 15], size: [3, 1, 3], material: 'platform' },
            { pos: [20, 12, 20], size: [2, 1, 2], material: 'platformAlt' },
            { pos: [8, 6, -12], size: [4, 1, 4], material: 'platform' },
            { pos: [30, 15, -15], size: [3, 1, 3], material: 'platformSpecial' },
        ];
        
        platformConfigs.forEach(config => {
            this.createPlatform(
                ...config.pos,
                ...config.size,
                this.materials[config.material]
            );
        });
        
        // Moving platforms (animated)
        this.createMovingPlatform(45, 15, 10, 4, 1, 4);
        this.createMovingPlatform(70, 18, -8, 3, 1, 3);
    }
    
    createPlatform(x, y, z, width, height, depth, material) {
        // Visual mesh
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        this.scene.add(mesh);
        
        // Physics body (re-enabled systematically - Step 4)
        console.log('🏗️ STEP 4: Creating platform physics at', x, y, z);
        let physicsBody = null;
        try {
            const shape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2));
            physicsBody = new CANNON.Body({ mass: 0 }); // Static platforms
            physicsBody.addShape(shape);
            physicsBody.position.set(x, y, z);
            this.world.add(physicsBody);
            console.log('✅ Platform physics created successfully');
        } catch (e) {
            console.error('❌ Platform physics creation failed:', e);
        }
        
        this.platforms.push({ mesh, body: physicsBody });
        
        return { mesh, body: null };
    }
    
    createMovingPlatform(x, y, z, width, height, depth) {
        const platform = this.createPlatform(x, y, z, width, height, depth, this.materials.platformSpecial);
        
        // Add moving animation
        platform.originalPosition = new THREE.Vector3(x, y, z);
        platform.moveDirection = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            0,
            (Math.random() - 0.5) * 2
        ).normalize();
        platform.moveSpeed = 2;
        platform.moveDistance = 5;
        platform.moveTime = 0;
        platform.isMoving = true;
        
        return platform;
    }
    
    createCollectibles() {
        // Coins scattered throughout the level
        const coinPositions = [
            [5, 3, 2], [15, 4, 0], [25, 6, -1],
            [40, 9, 3], [50, 11, -1], [60, 9, 0],
            [80, 11, -2], [20, 10, 18], [12, 8, -10]
        ];
        
        coinPositions.forEach(pos => {
            this.createCoin(...pos);
        });
        
        // Special gems (worth more points)
        const gemPositions = [
            [30, 16, -12], [65, 20, -8], [85, 15, 2]
        ];
        
        gemPositions.forEach(pos => {
            this.createGem(...pos);
        });
    }
    
    createCoin(x, y, z) {
        // Visual coin (spinning golden disk)
        const geometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 12);
        const mesh = new THREE.Mesh(geometry, this.materials.coin);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        
        // Spinning animation
        mesh.rotation.x = Math.PI / 2;
        mesh.userData = { 
            type: 'coin', 
            value: 1,
            spinSpeed: 3,
            bobSpeed: 2,
            bobAmount: 0.3,
            originalY: y
        };
        
        this.scene.add(mesh);
        
        // Physics body (trigger) - disabled for initial testing
        // const shape = new CANNON.Cylinder(0.8, 0.8, 0.2, 8);
        // const body = new CANNON.Body({ mass: 0, isTrigger: true });
        // body.addShape(shape);
        // body.position.set(x, y, z);
        // this.world.add(body);
        
        this.collectibles.push({ mesh, body: null });
    }
    
    createGem(x, y, z) {
        // Visual gem (floating crystal)
        const geometry = new THREE.OctahedronGeometry(1);
        const mesh = new THREE.Mesh(geometry, this.materials.gem);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        
        mesh.userData = { 
            type: 'gem', 
            value: 5,
            spinSpeed: 1,
            bobSpeed: 1.5,
            bobAmount: 0.5,
            originalY: y
        };
        
        this.scene.add(mesh);
        
        // Physics body (trigger) - disabled for initial testing
        // const shape = new CANNON.Sphere(1);
        // const body = new CANNON.Body({ mass: 0, isTrigger: true });
        // body.addShape(shape);
        // body.position.set(x, y, z);
        // this.world.add(body);
        
        this.collectibles.push({ mesh, body: null });
    }
    
    createDecorations() {
        // Floating trees/mushrooms (visual only, no collision)
        const decorationPositions = [
            [25, 2, 15], [45, 3, -20], [70, 5, 25],
            [-20, 2, 10], [-15, 4, -15], [90, 3, 10]
        ];
        
        decorationPositions.forEach(pos => {
            this.createTree(...pos);
        });
        
        // Add more trees for richer forest environment
        const extraTreePositions = [
            [35, 2, 20], [55, 3, -25], [-35, 2, 18], 
            [-25, 4, -22], [50, 5, 30], [-40, 3, -30],
            [60, 2, 15], [-50, 4, 25], [40, 3, -35],
            [25, 2, 35], [-30, 3, 30], [65, 4, -15]
        ];
        
        extraTreePositions.forEach(pos => {
            this.createTree(...pos);
        });
        
        console.log('🌳 Created additional trees for richer forest environment');
        
        // Floating clouds (background elements)
        for (let i = 0; i < 10; i++) {
            this.createCloud(
                (Math.random() - 0.5) * 200,
                Math.random() * 30 + 20,
                (Math.random() - 0.5) * 200
            );
        }
    }
    
    createTree(x, y, z) {
        console.log('🌳 Creating believable tree: trunk + branches + canopies...');
        const treeGroup = new THREE.Group();
        const textureLoader = new THREE.TextureLoader();
        
        // AI-Generated bark texture for all tree parts
        const barkTexture = textureLoader.load(
            './textures/gemini_bark.png',
            () => console.log('✅ AI bark texture loaded for tree'),
            undefined,
            () => console.warn('⚠️ Using brown fallback for bark')
        );
        barkTexture.wrapS = THREE.RepeatWrapping;
        barkTexture.wrapT = THREE.RepeatWrapping;
        barkTexture.repeat.set(1, 2);
        
        const barkMaterial = new THREE.MeshLambertMaterial({ 
            map: barkTexture,
            color: 0x8B4513 
        });
        
        // MAIN TRUNK (properly grounded)
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 4, 8);
        const trunkMesh = new THREE.Mesh(trunkGeometry, barkMaterial);
        trunkMesh.position.set(0, 2, 0); // Base at y=0 when tree at ground level
        trunkMesh.castShadow = true;
        treeGroup.add(trunkMesh);
        
        // BRANCH 1 (extends from trunk)
        const branch1Geometry = new THREE.CylinderGeometry(0.2, 0.35, 2.5, 6);
        const branch1Mesh = new THREE.Mesh(branch1Geometry, barkMaterial);
        branch1Mesh.position.set(-1.5, 3.5, 0.8);
        branch1Mesh.rotation.z = Math.PI / 5; // Realistic branch angle
        branch1Mesh.castShadow = true;
        treeGroup.add(branch1Mesh);
        
        // BRANCH 2 (other side for balance)
        const branch2Geometry = new THREE.CylinderGeometry(0.15, 0.28, 2, 6);
        const branch2Mesh = new THREE.Mesh(branch2Geometry, barkMaterial);
        branch2Mesh.position.set(1.2, 4, -0.6);
        branch2Mesh.rotation.z = -Math.PI / 6; // Angled the other way
        branch2Mesh.castShadow = true;
        treeGroup.add(branch2Mesh);
        
        // SINGLE LEAF TEXTURE (small tiled - the good one)
        const leafTexture = textureLoader.load(
            './textures/leaves_variation_1_20250915_124330.png',
            () => console.log('✅ Small tiled leaf texture loaded'),
            undefined,
            () => {
                console.warn('⚠️ Using green fallback for leaves');
            }
        );
        leafTexture.wrapS = THREE.RepeatWrapping;
        leafTexture.wrapT = THREE.RepeatWrapping;
        leafTexture.repeat.set(4, 4); // More tiling for detail
        
        const leafMaterial = new THREE.MeshLambertMaterial({ 
            map: leafTexture,
            color: 0x32CD32,
            emissive: 0x0a1f0a
        });
        
        // MAIN CANOPY (on trunk)
        const mainCanopy = new THREE.SphereGeometry(2.4, 12, 8);
        const mainCanopyMesh = new THREE.Mesh(mainCanopy, leafMaterial);
        mainCanopyMesh.position.set(0, 5.8, 0);
        mainCanopyMesh.castShadow = true;
        mainCanopyMesh.receiveShadow = true;
        treeGroup.add(mainCanopyMesh);
        
        // BRANCH 1 CANOPY (smaller, at end of branch)
        const branch1Canopy = new THREE.SphereGeometry(1.3, 10, 6);
        const branch1CanopyMesh = new THREE.Mesh(branch1Canopy, leafMaterial);
        branch1CanopyMesh.position.set(-2.3, 4.5, 1.2);
        branch1CanopyMesh.castShadow = true;
        branch1CanopyMesh.receiveShadow = true;
        treeGroup.add(branch1CanopyMesh);
        
        // BRANCH 2 CANOPY (smallest, at end of second branch)
        const branch2Canopy = new THREE.SphereGeometry(1.1, 8, 6);
        const branch2CanopyMesh = new THREE.Mesh(branch2Canopy, leafMaterial);
        branch2CanopyMesh.position.set(1.8, 4.8, -0.9);
        branch2CanopyMesh.castShadow = true;
        branch2CanopyMesh.receiveShadow = true;
        treeGroup.add(branch2CanopyMesh);
        
        // Position entire tree on ground
        treeGroup.position.set(x, 0, z); // Grounded properly
        this.scene.add(treeGroup);
        this.decorations.push(treeGroup);
        
        console.log('✅ Believable tree created: 1 trunk + 2 branches + 3 canopies with consistent AI leaf texture');
    }
    
    createCloud(x, y, z) {
        const cloudGroup = new THREE.Group();
        
        // Multiple spheres to create cloud shape
        for (let i = 0; i < 4; i++) {
            const cloudGeometry = new THREE.SphereGeometry(
                Math.random() * 2 + 1,
                8, 8
            );
            const cloudMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xffffff,
                transparent: true,
                opacity: 0.8
            });
            const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloudPart.position.set(
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 6
            );
            cloudGroup.add(cloudPart);
        }
        
        cloudGroup.position.set(x, y, z);
        cloudGroup.userData = {
            driftSpeed: Math.random() * 0.5 + 0.2,
            bobSpeed: Math.random() * 0.5 + 0.5,
            bobAmount: Math.random() * 1 + 0.5
        };
        
        this.scene.add(cloudGroup);
        this.decorations.push(cloudGroup);
    }
    
    createBoundaries() {
        // Invisible walls to prevent player from falling off the world
        const wallHeight = 20;
        const wallThickness = 1;
        const worldSize = 150;
        
        const boundaries = [
            { pos: [0, wallHeight/2, worldSize/2], size: [worldSize, wallHeight, wallThickness] },
            { pos: [0, wallHeight/2, -worldSize/2], size: [worldSize, wallHeight, wallThickness] },
            { pos: [worldSize/2, wallHeight/2, 0], size: [wallThickness, wallHeight, worldSize] },
            { pos: [-worldSize/2, wallHeight/2, 0], size: [wallThickness, wallHeight, worldSize] }
        ];
        
        // Physics boundaries disabled for initial testing
        // boundaries.forEach(boundary => {
        //     const shape = new CANNON.Box(new CANNON.Vec3(...boundary.size.map(s => s/2)));
        //     const body = new CANNON.Body({ mass: 0 });
        //     body.addShape(shape);
        //     body.position.set(...boundary.pos);
        //     this.world.add(body);
        // });
    }
    
    update(deltaTime) {
        // Animate collectibles
        this.collectibles.forEach(collectible => {
            const mesh = collectible.mesh;
            const userData = mesh.userData;
            
            if (userData) {
                // Spinning animation
                mesh.rotation.y += userData.spinSpeed * deltaTime;
                
                // Bobbing animation
                mesh.position.y = userData.originalY + 
                    Math.sin(Date.now() * 0.001 * userData.bobSpeed) * userData.bobAmount;
                
                // Sync physics body position (only if physics body exists)
                if (collectible.body) {
                    collectible.body.position.copy(mesh.position);
                }
            }
        });
        
        // Animate moving platforms
        this.platforms.forEach(platform => {
            if (platform.isMoving) {
                platform.moveTime += deltaTime;
                
                const offset = new THREE.Vector3()
                    .copy(platform.moveDirection)
                    .multiplyScalar(Math.sin(platform.moveTime * platform.moveSpeed) * platform.moveDistance);
                
                const newPosition = new THREE.Vector3()
                    .copy(platform.originalPosition)
                    .add(offset);
                
                platform.mesh.position.copy(newPosition);
                if (platform.body) {
                    platform.body.position.copy(newPosition);
                }
            }
        });
        
        // Animate decorations
        this.decorations.forEach(decoration => {
            const userData = decoration.userData;
            if (userData) {
                // Floating/drifting animation for clouds
                if (userData.driftSpeed) {
                    decoration.position.x += userData.driftSpeed * deltaTime;
                    decoration.position.y += Math.sin(Date.now() * 0.001 * userData.bobSpeed) * userData.bobAmount * deltaTime;
                    
                    // Reset position if drifted too far
                    if (decoration.position.x > 120) {
                        decoration.position.x = -120;
                    }
                }
            }
        });
    }
    
    // Utility method to create platforms with physics
    createColoredPlatform(x, y, z, width, height, depth, color) {
        const material = new THREE.MeshLambertMaterial({ 
            color: color,
            emissive: new THREE.Color(color).multiplyScalar(0.1)
        });
        
        return this.createPlatform(x, y, z, width, height, depth, material);
    }
    
    // Check collectible collisions with player
    checkCollectibleCollisions(playerPosition, collectRadius = 2) {
        const collected = [];
        
        this.collectibles.forEach((collectible, index) => {
            const distance = playerPosition.distanceTo(collectible.mesh.position);
            
            if (distance < collectRadius) {
                // Collect the item
                this.scene.remove(collectible.mesh);
                this.world.remove(collectible.body);
                collected.push({
                    type: collectible.mesh.userData.type,
                    value: collectible.mesh.userData.value,
                    index: index
                });
            }
        });
        
        // Remove collected items from array (in reverse order to maintain indices)
        collected.reverse().forEach(item => {
            this.collectibles.splice(item.index, 1);
        });
        
        return collected;
    }
    
    // Procedural texture creation for fallbacks
    createProceduralGrassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Create grass-like texture
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, '#90EE90');
        gradient.addColorStop(0.5, '#228B22');
        gradient.addColorStop(1, '#006400');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        // Add grass blade details
        ctx.strokeStyle = '#32CD32';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const height = Math.random() * 20 + 10;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.random() * 4 - 2, y - height);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 20);
        
        console.log('🎨 Created procedural grass texture');
        return new THREE.MeshLambertMaterial({ map: texture });
    }
    
    // Create textured platform materials
    createTexturedPlatformMaterial(textureLoader, baseColor, colorName) {
        // Try to load platform texture from web
        const platformTexture = textureLoader.load(
            'https://threejs.org/examples/textures/brick_diffuse.jpg',
            () => console.log(`✅ Platform texture loaded for ${colorName} platform`),
            undefined,
            (error) => {
                console.warn(`⚠️ Platform texture failed for ${colorName}, using procedural`);
                return this.createProceduralPlatformTexture(baseColor);
            }
        );
        
        // Configure texture
        platformTexture.wrapS = THREE.RepeatWrapping;
        platformTexture.wrapT = THREE.RepeatWrapping;
        platformTexture.repeat.set(2, 2); // Smaller tiling for platform detail
        
        return new THREE.MeshLambertMaterial({
            map: platformTexture,
            color: baseColor, // Tint the texture with platform color
            emissive: new THREE.Color(baseColor).multiplyScalar(0.1)
        });
    }
    
    // Procedural platform texture as fallback
    createProceduralPlatformTexture(baseColor) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Create brick-like pattern
        ctx.fillStyle = `#${baseColor.toString(16).padStart(6, '0')}`;
        ctx.fillRect(0, 0, 128, 128);
        
        // Add brick lines
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        
        for (let y = 0; y < 128; y += 32) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(128, y);
            ctx.stroke();
        }
        
        for (let x = 0; x < 128; x += 64) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 128);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        console.log(`🎨 Created procedural platform texture for color ${baseColor}`);
        return new THREE.MeshLambertMaterial({ map: texture });
    }
    
    // Procedural bark texture
    createProceduralBarkTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Brown bark base
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add bark texture lines
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        
        for (let i = 0; i < 20; i++) {
            const y = Math.random() * 256;
            const wobble = Math.random() * 20 - 10;
            
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(256, y + wobble);
            ctx.stroke();
        }
        
        // Add vertical grain
        ctx.strokeStyle = '#A0522D';
        ctx.lineWidth = 1;
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 256;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + Math.random() * 10 - 5, 256);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        console.log('🎨 Created procedural bark texture');
        return new THREE.MeshLambertMaterial({ map: texture, color: 0x8B4513 });
    }
    
    // Procedural foliage texture
    createProceduralFoliageTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Green foliage base
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, '#90EE90');
        gradient.addColorStop(0.5, '#32CD32');
        gradient.addColorStop(1, '#228B22');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        // Add leaf-like details
        ctx.fillStyle = '#228B22';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 8 + 2;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        console.log('🎨 Created procedural foliage texture');
        return new THREE.MeshLambertMaterial({ map: texture, color: 0x32CD32 });
    }
    
    // Dynamic world generation (for future expansion)
    generatePlatformSequence(startX, startY, startZ, count, spacing = 8) {
        for (let i = 0; i < count; i++) {
            const x = startX + i * spacing;
            const y = startY + Math.sin(i * 0.5) * 3; // Wavy height pattern
            const z = startZ + (Math.random() - 0.5) * 6;
            
            const materialType = ['platform', 'platformAlt', 'platformSpecial'][i % 3];
            this.createPlatform(x, y, z, 4, 1, 4, this.materials[materialType]);
            
            // Add collectibles on some platforms
            if (Math.random() > 0.6) {
                this.createCoin(x, y + 2, z);
            }
        }
    }
    
    // Level completion check
    isLevelComplete() {
        return this.collectibles.length === 0;
    }
    
    // Reset world for new game
    reset() {
        // Remove all dynamic objects
        this.collectibles.forEach(collectible => {
            this.scene.remove(collectible.mesh);
            this.world.remove(collectible.body);
        });
        
        this.collectibles = [];
        
        // Regenerate collectibles
        this.createCollectibles();
    }
    
    // Get world info for debugging
    getDebugInfo() {
        return {
            platforms: this.platforms.length,
            collectibles: this.collectibles.length,
            decorations: this.decorations.length
        };
    }
}

// Export for global access
window.World = World;
