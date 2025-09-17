/*
ROBOQUEST PLAYER CHARACTER
Astro Bot-inspired robot with platforming mechanics
*/

class Player {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.scene = gameEngine.scene;
        this.world = gameEngine.world;
        
        // Player properties
        this.position = new THREE.Vector3(0, 5, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.isGrounded = false;
        this.canDoubleJump = false;
        this.hasUsedDoubleJump = false;
        
        // Player stats
        this.health = 3;
        this.coins = 0;
        this.lives = 3;
        
        // Movement parameters (TPS-style, 10x faster)
        this.moveSpeed = 100; // 10x boost for much faster traversal
        this.jumpForce = 16;  // Stronger jump to keep feel after speed boost
        this.hoverForce = 6;  // Softer hover assist
        this.accelLerp = 0.6; // Faster acceleration to reach target speed quickly
        this.turnLerp = 0.25; // Snappier turning
        this.maxHoverTime = 1.0; // 1 second hover like Astro Bot
        this.currentHoverTime = 0;
        this.isHovering = false;
        
        // Create visual and physics representation
        this.createPlayerMesh();
        this.createPhysicsBody(); // Re-enabled for Step 5: Player physics
        this.setupAnimations();
    }
    
    createPlayerMesh() {
        // Create robot character (Astro Bot inspired but unique)
        const robotGroup = new THREE.Group();
        
        // Main body (white robot like Astro Bot) - using CylinderGeometry for r128 compatibility
        const bodyGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
            emissive: 0x111111
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;
        robotGroup.add(body);
        
        // Head (slightly larger, cute proportions)
        const headGeometry = new THREE.SphereGeometry(0.6, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
            emissive: 0x111111
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.2, 0);
        head.castShadow = true;
        robotGroup.add(head);
        
        // Visor (cyan like Astro Bot)
        const visorGeometry = new THREE.SphereGeometry(0.4, 16, 8, 0, Math.PI);
        const visorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x50E3C2,
            emissive: 0x25716a,
            transparent: true,
            opacity: 0.8
        });
        const visor = new THREE.Mesh(visorGeometry, visorMaterial);
        visor.position.set(0, 1.2, 0.3);
        visor.rotation.x = Math.PI * 0.1;
        robotGroup.add(visor);
        
        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.8, 8);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.7, 0.5, 0);
        leftArm.castShadow = true;
        robotGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.7, 0.5, 0);
        rightArm.castShadow = true;
        robotGroup.add(rightArm);
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.3, -0.8, 0);
        leftLeg.castShadow = true;
        robotGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.3, -0.8, 0);
        rightLeg.castShadow = true;
        robotGroup.add(rightLeg);
        
        // Jetpack (for hover ability)
        const jetpackGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.3);
        const jetpackMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4A90E2,
            emissive: 0x223456
        });
        const jetpack = new THREE.Mesh(jetpackGeometry, jetpackMaterial);
        jetpack.position.set(0, 0.2, -0.6);
        jetpack.castShadow = true;
        robotGroup.add(jetpack);
        
        // Store references for animations
        this.mesh = robotGroup;
        this.head = head;
        this.visor = visor;
        this.jetpack = jetpack;
        this.arms = [leftArm, rightArm];
        this.legs = [leftLeg, rightLeg];
        
        // Add to scene
        this.scene.add(this.mesh);

        console.log('🤖 Robot character created and added to scene');
        console.log('📍 Robot position:', this.mesh.position);

        // Create hover effect particles (will be activated during hover)
        this.createHoverEffects();

        // Create direction indicator (TPS aim/heading helper)
        this.createDirectionIndicator();
    }
    
    createPhysicsBody() {
        console.log('🤖 STEP 5: Creating player physics body...');
        try {
            // Physics body (capsule shape for smooth movement)
            const playerShape = new CANNON.Cylinder(0.8, 0.8, 2.0, 8);
            this.physicsBody = new CANNON.Body({ mass: 1 });
            this.physicsBody.addShape(playerShape);
            this.physicsBody.position.set(0, 5, 0);
            this.physicsBody.material = new CANNON.Material('player');
        
            // Prevent rotation (player stays upright)
            this.physicsBody.fixedRotation = true;
            this.physicsBody.updateMassProperties();
            
            this.world.add(this.physicsBody);
            console.log('✅ Player physics body created and added to world');
        } catch (e) {
            console.error('❌ Player physics creation failed:', e);
        }
        
        // Ground detection
        this.physicsBody.addEventListener('collide', (event) => {
            const contact = event.contact;
            const other = event.body === this.physicsBody ? event.target : event.body;
            
            // Check if collision is from below (landing on something)
            if (contact.ni.y > 0.5) {
                this.isGrounded = true;
                this.hasUsedDoubleJump = false;
                this.canDoubleJump = true;
            }
        });
    }
    
    createHoverEffects() {
        // Particle system for jetpack effects
        const particleCount = 50;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 2;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x50E3C2,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        this.hoverParticles = new THREE.Points(particles, particleMaterial);
        this.hoverParticles.visible = false;
        this.scene.add(this.hoverParticles);
    }
    
    setupAnimations() {
        // Animation state
        this.animationState = 'idle';
        this.animationTime = 0;
        
        // Animation parameters
        this.animations = {
            idle: { bobAmount: 0.05, bobSpeed: 2 },
            walking: { bobAmount: 0.15, bobSpeed: 6, armSwing: 0.3 },
            jumping: { stretch: 0.1 },
            hovering: { glow: true, jetpackPulse: true }
        };
    }

    createDirectionIndicator() {
        const dir = new THREE.Vector3(0, 0, 1);
        const origin = new THREE.Vector3(0, 1.2, 0);
        const length = 3;
        const color = 0x50E3C2; // cyan
        this.directionHelper = new THREE.ArrowHelper(dir, origin, length, color, 0.6, 0.4);
        // Attach to scene so we can position in world each frame
        this.scene.add(this.directionHelper);
    }

    updateDirectionIndicator(worldDir) {
        if (!this.directionHelper) return;
        const dir = worldDir.clone();
        dir.y = 0;
        if (dir.lengthSq() < 1e-4) {
            // Default to character forward if no input
            const forward = new THREE.Vector3(0, 0, 1).applyEuler(this.mesh.rotation);
            dir.copy(forward);
        }
        dir.normalize();
        this.directionHelper.setDirection(dir);
        this.directionHelper.position.copy(this.mesh.position);
        this.directionHelper.position.y += 1.2;
        this.directionHelper.setLength(3, 0.6, 0.4);
        this.directionHelper.visible = true;
    }
    
    update(deltaTime) {
        this.handleInput(deltaTime);
        this.updatePhysics(deltaTime); // Re-enabled with physics-free version
        this.updateAnimations(deltaTime);
        // Camera is now handled by CameraController in GameLogic
        // this.updateCamera(deltaTime);
        this.updateHUD();
        
        // Sync visual mesh with physics body (Step 6: Physics movement)
        if (this.physicsBody) {
            // Debug the sync issue
            if (Math.random() < 0.01) {
                console.log('🔄 Syncing positions:', {
                    physicsPosX: this.physicsBody.position.x,
                    physicsPosZ: this.physicsBody.position.z,
                    meshPosX: this.mesh.position.x,
                    meshPosZ: this.mesh.position.z
                });
            }
            
            this.mesh.position.copy(this.physicsBody.position);
            this.mesh.quaternion.copy(this.physicsBody.quaternion);
            
            // Force immediate sync verification
            if (Math.abs(this.physicsBody.position.x - this.mesh.position.x) > 0.1) {
                console.warn('⚠️ Position sync mismatch detected!');
            }
        }
    }
    
    handleInput(deltaTime) {
        // Physics-based movement aligned to camera (WASD relative to camera)
        const force = new CANNON.Vec3();
        let isMoving = false;
        
        // Aim direction from camera (XZ)
        const aimDir = new THREE.Vector3();
        this.gameEngine.camera.getWorldDirection(aimDir);
        aimDir.y = 0;
        if (aimDir.lengthSq() > 0) aimDir.normalize();
        
        // Accumulate input (no A/D strafing per request)
        let forward = false;
        let backward = false;
        
        // Debug input every 60 frames (1 second) to avoid spam
        if (Math.floor(Date.now() / 1000) % 2 === 0 && Math.random() < 0.02) {
            console.log('🎮 Input check - Keys pressed:', {
                W: this.gameEngine.isKeyPressed('KeyW'),
                A: this.gameEngine.isKeyPressed('KeyA'), 
                S: this.gameEngine.isKeyPressed('KeyS'),
                D: this.gameEngine.isKeyPressed('KeyD'),
                Space: this.gameEngine.isKeyPressed('Space')
            });
        }
        
        // Physics-based movement (Step 6: Final movement system)
        if (this.gameEngine.isKeyPressed('KeyW') || this.gameEngine.isKeyPressed('ArrowUp')) {
            forward = true; isMoving = true;
        }
        if (this.gameEngine.isKeyPressed('KeyS') || this.gameEngine.isKeyPressed('ArrowDown')) {
            backward = true; isMoving = true;
        }
        
        // Build movement vector in world space from aim direction
        const moveDirThree = new THREE.Vector3();
        if (isMoving && aimDir.lengthSq() > 0) {
            moveDirThree.copy(aimDir);
            if (backward && !forward) moveDirThree.multiplyScalar(-1);
        }
        
        // Apply movement to physics body with damping when idle
        if (this.physicsBody) {
            if (isMoving) {
                // Desired velocity in xz plane
                const desiredVX = moveDirThree.x * this.moveSpeed;
                const desiredVZ = moveDirThree.z * this.moveSpeed;
                
                // Smooth velocity towards desired for fluid feel
                this.physicsBody.velocity.x = THREE.MathUtils.lerp(
                    this.physicsBody.velocity.x, desiredVX, this.accelLerp
                );
                this.physicsBody.velocity.z = THREE.MathUtils.lerp(
                    this.physicsBody.velocity.z, desiredVZ, this.accelLerp
                );
                
                // Small assisting force helps overcome friction hiccups
                this.physicsBody.force.x += desiredVX * 0.5;
                this.physicsBody.force.z += desiredVZ * 0.5;
                this.animationState = 'walking';
            } else {
                // Apply gentle damping to stop sliding
                this.physicsBody.velocity.x *= 0.90;
                this.physicsBody.velocity.z *= 0.90;
                this.animationState = 'idle';
            }

            // More frequent debugging
            if (Math.random() < 0.05) {
                console.log('🚀 Movement Debug:', {
                    aimDir: {x: aimDir.x.toFixed(2), z: aimDir.z.toFixed(2)},
                    moveDir: {x: moveDirThree.x.toFixed(2), z: moveDirThree.z.toFixed(2)},
                    desiredVelocity: this.physicsBody ? {x: this.physicsBody.velocity.x.toFixed(2), z: this.physicsBody.velocity.z.toFixed(2)} : null,
                    actualVelocity: {x: this.physicsBody.velocity.x, z: this.physicsBody.velocity.z},
                    physicsPos: {x: this.physicsBody.position.x, z: this.physicsBody.position.z},
                    meshPos: {x: this.mesh.position.x, z: this.mesh.position.z}
                });
            }
        }

        // TPS-style facing: Egloff rig rotates the character. Avoid double-rotating here if Egloff is active.
        const cam = this.gameEngine.camera;
        let targetYaw = null;
        const camController = window.gameLogic && window.gameLogic.cameraController;
        const isEgloff = camController && camController.constructor && camController.constructor.name === 'EgloffCameraRig';
        if (!isEgloff) {
            if (cam && camController && (camController.isPointerLocked || camController.isMouseDown)) {
                const camForward = aimDir; // already computed
                targetYaw = Math.atan2(camForward.x, camForward.z);
            } else if (isMoving && moveDirThree.lengthSq() > 0) {
                targetYaw = Math.atan2(moveDirThree.x, moveDirThree.z);
            }
            if (targetYaw !== null) {
                const lerpAngle = (a, b, t) => {
                    let delta = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
                    return a + delta * t;
                };
                this.mesh.rotation.y = lerpAngle(this.mesh.rotation.y, targetYaw, this.turnLerp);
            }
        }

        // Update direction indicator: prefer movement dir, else camera forward while aiming
        // Direction indicator: show motion if moving, else aim
        const indicatorDir = (isMoving && moveDirThree.lengthSq() > 0) ? moveDirThree : aimDir.clone();
        this.updateDirectionIndicator(indicatorDir);
        
        // Debug telemetry for automated tests
        try {
            window.__playerDebug = {
                yaw: this.mesh.rotation.y,
                pos: { x: this.mesh.position.x, y: this.mesh.position.y, z: this.mesh.position.z },
                isMoving: !!isMoving,
                desiredDir: { x: indicatorDir.x, y: indicatorDir.y, z: indicatorDir.z }
            };
        } catch (e) { /* ignore */ }
        
        // Jumping (Space key)
        if (this.gameEngine.isKeyPressed('Space')) {
            if (this.isGrounded) {
                this.jump();
            } else if (this.canDoubleJump && !this.hasUsedDoubleJump) {
                this.doubleJump();
            }
        }
        
        // Hover/Jetpack (Mouse click or hold Space)
        if (this.gameEngine.isMouseClicked() || this.gameEngine.isKeyPressed('Space')) {
            if (!this.isGrounded && this.currentHoverTime < this.maxHoverTime) {
                this.hover(deltaTime);
            }
        } else {
            this.stopHover();
        }
        
        // Simple boundary checking (physics-free)
        const maxDistance = 50;
        this.mesh.position.x = Math.max(-maxDistance, Math.min(maxDistance, this.mesh.position.x));
        this.mesh.position.z = Math.max(-maxDistance, Math.min(maxDistance, this.mesh.position.z));
    }
    
    jump() {
        this.physicsBody.velocity.y = this.jumpForce;
        this.isGrounded = false;
        this.animationState = 'jumping';
        console.log('🤖 Jump!');
    }
    
    doubleJump() {
        this.physicsBody.velocity.y = this.jumpForce * 0.8;
        this.hasUsedDoubleJump = true;
        this.canDoubleJump = false;
        this.animationState = 'jumping';
        console.log('🚀 Double Jump!');
    }
    
    hover(deltaTime) {
        if (this.currentHoverTime < this.maxHoverTime) {
            this.physicsBody.force.y += this.hoverForce;
            this.currentHoverTime += deltaTime;
            this.isHovering = true;
            this.animationState = 'hovering';
            
            // Show hover particles
            this.hoverParticles.visible = true;
            this.hoverParticles.position.copy(this.mesh.position);
            this.hoverParticles.position.y -= 1;
            
            // Animate particles
            const positions = this.hoverParticles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= deltaTime * 5; // Fall down
                if (positions[i + 1] < -2) {
                    positions[i + 1] = 0;
                    positions[i] = (Math.random() - 0.5) * 2;
                    positions[i + 2] = (Math.random() - 0.5) * 2;
                }
            }
            this.hoverParticles.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    stopHover() {
        if (this.isHovering) {
            this.isHovering = false;
            this.hoverParticles.visible = false;
        }
    }
    
    updatePhysics(deltaTime) {
        // Physics-free version - just basic state management
        this.isGrounded = true; // Always grounded for now
        
        // Hover time recovery
        if (this.currentHoverTime > 0) {
            this.currentHoverTime = Math.max(0, this.currentHoverTime - deltaTime * 2);
        }
        
        // Keep player at reasonable height
        if (this.mesh.position.y < 2) {
            this.mesh.position.y = 2;
        }
    }
    
    updateAnimations(deltaTime) {
        this.animationTime += deltaTime;
        
        const currentAnim = this.animations[this.animationState];
        
        switch(this.animationState) {
            case 'idle':
                // Gentle bobbing
                this.head.position.y = 1.2 + Math.sin(this.animationTime * currentAnim.bobSpeed) * currentAnim.bobAmount;
                this.visor.rotation.x = Math.PI * 0.1 + Math.sin(this.animationTime * 3) * 0.02;
                break;
                
            case 'walking':
                // Walking animation with arm swing
                const walkBob = Math.sin(this.animationTime * currentAnim.bobSpeed) * currentAnim.bobAmount;
                this.head.position.y = 1.2 + walkBob;
                
                // Arm swinging
                this.arms[0].rotation.x = Math.sin(this.animationTime * currentAnim.bobSpeed) * currentAnim.armSwing;
                this.arms[1].rotation.x = -Math.sin(this.animationTime * currentAnim.bobSpeed) * currentAnim.armSwing;
                
                // Leg movement
                this.legs[0].rotation.x = -Math.sin(this.animationTime * currentAnim.bobSpeed) * currentAnim.armSwing;
                this.legs[1].rotation.x = Math.sin(this.animationTime * currentAnim.bobSpeed) * currentAnim.armSwing;
                break;
                
            case 'jumping':
                // Slight stretch effect
                this.mesh.scale.y = 1 + Math.max(0, this.physicsBody.velocity.y * 0.01);
                this.arms[0].rotation.x = -0.5;
                this.arms[1].rotation.x = -0.5;
                break;
                
            case 'hovering':
                // Jetpack glow and pulsing effect
                this.jetpack.material.emissive.setHex(0x225566);
                this.jetpack.scale.setScalar(1 + Math.sin(this.animationTime * 10) * 0.1);
                
                // Gentle hover bob
                this.head.position.y = 1.2 + Math.sin(this.animationTime * 8) * 0.08;
                break;
        }
        
        // Reset scale if not jumping
        if (this.animationState !== 'jumping') {
            this.mesh.scale.y = 1;
        }
        
        // Reset jetpack effects if not hovering
        if (this.animationState !== 'hovering') {
            this.jetpack.material.emissive.setHex(0x223456);
            this.jetpack.scale.setScalar(1);
        }
    }
    
    updateCamera(deltaTime) {
        // Third-person camera following with mouse control (Astro Bot style)
        const mouse = this.gameEngine.getMousePosition();
        
        // Base camera offset
        let cameraDistance = 8;
        let cameraHeight = 6;
        
        // Mouse control for camera orbit (right-click drag)
        if (this.gameEngine.isMouseClicked()) {
            // Orbit camera around player based on mouse position
            const mouseInfluence = 3;
            const horizontalAngle = mouse.x * mouseInfluence;
            const verticalAngle = mouse.y * mouseInfluence;
            
            // Calculate camera position with mouse orbit
            const playerPos = this.mesh.position;
            this.gameEngine.camera.position.set(
                playerPos.x + Math.sin(horizontalAngle) * cameraDistance,
                playerPos.y + cameraHeight + verticalAngle,
                playerPos.z + Math.cos(horizontalAngle) * cameraDistance
            );
            
            this.gameEngine.camera.lookAt(playerPos.x, playerPos.y + 2, playerPos.z);
            
            if (Math.random() < 0.01) {
                console.log('🖱️ Mouse camera control active:', {mouse, horizontalAngle, verticalAngle});
            }
        } else {
            // Standard follow camera when not using mouse
            const idealCameraPosition = new THREE.Vector3();
            const idealCameraTarget = new THREE.Vector3();
            
            // Camera position behind and above the player
            idealCameraPosition.copy(this.mesh.position);
            idealCameraPosition.y += cameraHeight;
            idealCameraPosition.z += cameraDistance;
            
            // Camera target slightly ahead of the player
            idealCameraTarget.copy(this.mesh.position);
            idealCameraTarget.y += 2;
            
            // Smooth camera following with lerp
            this.gameEngine.camera.position.lerp(idealCameraPosition, deltaTime * 3);
            
            // Look at the player position
            this.gameEngine.camera.lookAt(idealCameraTarget);
        }
    }
    
    updateHUD() {
        // Update UI elements
        const scoreElement = document.getElementById('score');
        const livesElement = document.getElementById('lives');
        
        if (scoreElement) scoreElement.textContent = `Coins: ${this.coins}`;
        if (livesElement) livesElement.textContent = `Lives: ${this.lives}`;
    }
    
    // Collectibles and interactions
    collectCoin() {
        this.coins++;
        console.log('🪙 Coin collected! Total:', this.coins);
        
        // Play collection effect (visual feedback)
        this.playCollectionEffect();
    }
    
    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            this.loseLife();
        }
        
        // Invincibility frames and visual feedback
        this.playDamageEffect();
    }
    
    loseLife() {
        this.lives--;
        this.health = 3; // Reset health
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.respawn();
        }
    }
    
    respawn() {
        // Reset position and physics
        this.physicsBody.position.set(0, 5, 0);
        this.physicsBody.velocity.set(0, 0, 0);
        this.physicsBody.force.set(0, 0, 0);
        
        // Reset states
        this.currentHoverTime = 0;
        this.isHovering = false;
        this.hasUsedDoubleJump = false;
        
        console.log('🔄 Respawned!');
    }
    
    gameOver() {
        console.log('💀 Game Over!');
        // Handle game over logic
    }
    
    playCollectionEffect() {
        // Create a small burst of particles
        const burstGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const burstMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFD700,
            transparent: true,
            opacity: 1
        });
        
        for (let i = 0; i < 5; i++) {
            const particle = new THREE.Mesh(burstGeometry, burstMaterial.clone());
            particle.position.copy(this.mesh.position);
            particle.position.y += 1;
            
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                Math.random() * 3 + 2,
                (Math.random() - 0.5) * 5
            );
            
            this.scene.add(particle);
            
            // Animate particle
            const animateParticle = () => {
                particle.position.add(velocity.clone().multiplyScalar(0.016));
                velocity.y -= 0.2; // Gravity
                particle.material.opacity -= 0.02;
                
                if (particle.material.opacity > 0) {
                    requestAnimationFrame(animateParticle);
                } else {
                    this.scene.remove(particle);
                }
            };
            
            setTimeout(() => animateParticle(), i * 50);
        }
    }
    
    playDamageEffect() {
        // Flash red effect
        this.mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                const originalColor = child.material.color.clone();
                child.material.color.setHex(0xff4444);
                
                setTimeout(() => {
                    child.material.color.copy(originalColor);
                }, 200);
            }
        });
    }
    
    // Getters for game logic
    getPosition() {
        return this.mesh.position.clone();
    }
    
    getPhysicsPosition() {
        return this.physicsBody.position;
    }
    
    isAlive() {
        return this.lives > 0;
    }
    
    // Debug info
    getDebugInfo() {
        return {
            position: this.mesh.position,
            velocity: this.physicsBody.velocity,
            isGrounded: this.isGrounded,
            health: this.health,
            coins: this.coins,
            hoverTime: this.currentHoverTime
        };
    }
}

// Export for global access
window.Player = Player;
