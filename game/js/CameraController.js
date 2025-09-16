/*
ROBOQUEST 3RD PERSON CAMERA CONTROLLER
Professional follow camera with mouse controls
*/

class CameraController {
    constructor(camera, target, options = {}) {
        this.camera = camera;
        this.target = target; // Player object to follow
        
        // Camera settings
        this.distance = options.distance || 10; // Distance behind player
        this.height = options.height || 6; // Height above player
        this.mouseSensitivity = options.mouseSensitivity || 0.0012; // Lower = slower
        this.smoothness = options.smoothness || 0.08; // Camera position smoothing
        this.rotationSmoothness = options.rotationSmoothness || 0.15; // Angle smoothing
        this.maxYawSpeed = options.maxYawSpeed || 0.06;   // rad per frame cap
        this.maxPitchSpeed = options.maxPitchSpeed || 0.04; // rad per frame cap
        this.lockCharacterYawToCamera = options.lockCharacterYawToCamera !== false; // default true
        this.followBehindTarget = options.followBehindTarget !== false; // default true: keep camera behind character
        
        // Mouse control state
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.previousMouseX = 0;
        this.previousMouseY = 0;
        this.isPointerLocked = false;
        
        // Camera rotation
        this.horizontalAngle = 0; // Current yaw
        this.verticalAngle = 0.25; // Current pitch
        this.targetHorizontalAngle = 0; // Target yaw for smoothing
        this.targetVerticalAngle = 0.25; // Target pitch for smoothing
        // Tighter TPS pitch limits (approx -35° to +25°)
        this.minVerticalAngle = options.minPitch ?? -0.6;
        this.maxVerticalAngle = options.maxPitch ?? 0.45;
        
        // Camera pivot point
        this.pivot = new THREE.Object3D();
        
        this.setupEventListeners();

        // Optional: use OrbitControls when available for robust orbit behavior
        const canvas = document.getElementById('gameCanvas');
        if (typeof THREE !== 'undefined' && THREE.OrbitControls) {
            this.orbit = new THREE.OrbitControls(this.camera, canvas || document.body);
            this.orbit.enablePan = false;
            this.orbit.enableDamping = true;
            this.orbit.dampingFactor = 0.1;
            this.orbit.rotateSpeed = 0.4; // tune as needed
            this.orbit.minDistance = this.distance;
            this.orbit.maxDistance = this.distance;
            // Map pitch clamp to OrbitControls polar angles
            this.orbit.minPolarAngle = Math.PI / 2 - this.maxVerticalAngle;
            this.orbit.maxPolarAngle = Math.PI / 2 - this.minVerticalAngle;
            this.useOrbit = true;
            console.log('🎛️ OrbitControls active');
        } else {
            this.useOrbit = false;
        }

        console.log('📷 3rd Person Camera Controller initialized');
    }
    
    setupEventListeners() {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.addEventListener('click', () => {
                if (!this.isPointerLocked && canvas.requestPointerLock) {
                    canvas.requestPointerLock();
                }
            });
        }
        
        document.addEventListener('pointerlockchange', () => {
            const locked = document.pointerLockElement === canvas;
            this.isPointerLocked = locked;
            if (!locked) {
                document.body.style.cursor = 'default';
            } else {
                document.body.style.cursor = 'none';
            }
        });

        // Mouse down/up events
        document.addEventListener('mousedown', (event) => {
            // Support left OR right click to orbit (tests use left click)
            if (event.button === 0 || event.button === 2) {
                this.isMouseDown = true;
                this.previousMouseX = event.clientX;
                this.previousMouseY = event.clientY;
                document.body.style.cursor = 'grabbing';
            }
        });
        
        document.addEventListener('mouseup', (event) => {
            if (event.button === 0 || event.button === 2) {
                this.isMouseDown = false;
                document.body.style.cursor = 'default';
            }
        });
        
        // Mouse move for camera rotation
        document.addEventListener('mousemove', (event) => {
            if (this.useOrbit) return; // OrbitControls handles rotation
            // Pointer lock mode: rotate continuously by movement deltas
            if (this.isPointerLocked) {
                const deltaX = event.movementX || 0;
                const deltaY = event.movementY || 0;
                this.targetHorizontalAngle -= deltaX * this.mouseSensitivity;
                this.targetVerticalAngle -= deltaY * this.mouseSensitivity;
                // Clamp pitch
                this.targetVerticalAngle = Math.max(this.minVerticalAngle, Math.min(this.maxVerticalAngle, this.targetVerticalAngle));
                // Normalize yaw target to [-PI, PI]
                if (this.targetHorizontalAngle > Math.PI) this.targetHorizontalAngle -= Math.PI * 2;
                if (this.targetHorizontalAngle < -Math.PI) this.targetHorizontalAngle += Math.PI * 2;
                
                // Character yaw rotation handled in Player to avoid double-writes
                return;
            }
            
            // Drag to orbit mode
            if (this.isMouseDown) {
                const deltaX = event.clientX - this.previousMouseX;
                const deltaY = event.clientY - this.previousMouseY;
                
                // Update camera rotation
                this.targetHorizontalAngle -= deltaX * this.mouseSensitivity;
                this.targetVerticalAngle -= deltaY * this.mouseSensitivity;
                
                // Clamp vertical angle
                this.targetVerticalAngle = Math.max(this.minVerticalAngle, 
                    Math.min(this.maxVerticalAngle, this.targetVerticalAngle));
                // Normalize yaw target to [-PI, PI]
                if (this.targetHorizontalAngle > Math.PI) this.targetHorizontalAngle -= Math.PI * 2;
                if (this.targetHorizontalAngle < -Math.PI) this.targetHorizontalAngle += Math.PI * 2;
                
                this.previousMouseX = event.clientX;
                this.previousMouseY = event.clientY;
                
                console.log('🖱️ Camera rotation:', {
                    horizontal: this.targetHorizontalAngle,
                    vertical: this.targetVerticalAngle
                });
            }
        });
        
        // Mouse wheel for zoom
        document.addEventListener('wheel', (event) => {
            this.distance += event.deltaY * 0.01;
            this.distance = Math.max(5, Math.min(20, this.distance)); // Clamp zoom
            
            console.log('🔍 Camera zoom:', this.distance);
        });
        
        console.log('✅ Camera mouse controls initialized');
    }
    
    update(deltaTime) {
        if (!this.target) return;
        
        // OrbitControls path
        if (this.useOrbit && this.orbit) {
            // Keep target at player position
            const targetPosition = this.target.mesh ? this.target.mesh.position : this.target.position;
            this.orbit.target.copy(targetPosition);
            this.orbit.update();

            // Have the character face away from the camera (TPS style)
            if (this.lockCharacterYawToCamera && this.target && this.target.mesh) {
                const forward = new THREE.Vector3();
                this.camera.getWorldDirection(forward); // from camera into world (towards player)
                forward.y = 0; forward.normalize();
                const faceDir = forward.clone().multiplyScalar(-1); // away from camera
                const desiredYaw = Math.atan2(faceDir.x, faceDir.z);
                const lerpAngle = (a, b, t) => {
                    let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
                    return a + d * t;
                };
                this.target.mesh.rotation.y = lerpAngle(this.target.mesh.rotation.y, desiredYaw, 0.25);
            }

            // Debug telemetry
            try {
                const camPos = this.camera.position;
                const playerYaw = this.target && this.target.mesh ? this.target.mesh.rotation.y : 0;
                window.__camDebug = {
                    yaw: null,
                    pitch: null,
                    targetYaw: null,
                    targetPitch: null,
                    playerYaw: playerYaw,
                    followBehind: true,
                    pointerLocked: false,
                    pos: { x: camPos.x, y: camPos.y, z: camPos.z },
                    target: { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z }
                };
            } catch (e) {}
            return;
        }

        // Get target position
        const targetPosition = this.target.mesh ? this.target.mesh.position : this.target.position;
        
        // Smooth angles towards targets with shortest-path and speed caps to prevent oscillation
        const shortestDelta = (a, b) => {
            let d = b - a;
            d = (d + Math.PI) % (Math.PI * 2) - Math.PI; // wrap to [-PI, PI]
            return d;
        };
        // Yaw update
        const yawDelta = shortestDelta(this.horizontalAngle, this.targetHorizontalAngle);
        const clampedYawDelta = Math.max(-this.maxYawSpeed, Math.min(this.maxYawSpeed, yawDelta));
        this.horizontalAngle += clampedYawDelta;
        // Pitch update
        let pitchDelta = this.targetVerticalAngle - this.verticalAngle;
        const clampedPitchDelta = Math.max(-this.maxPitchSpeed, Math.min(this.maxPitchSpeed, pitchDelta));
        this.verticalAngle += clampedPitchDelta;
        // Enforce pitch clamp post-update
        this.verticalAngle = Math.max(this.minVerticalAngle, Math.min(this.maxVerticalAngle, this.verticalAngle));
        
        // Calculate desired camera position
        const cosPitch = Math.cos(this.verticalAngle);
        // If follow-behind mode is on, hard-lock camera yaw to character's yaw (stay behind the jetpack)
        let yawForCamera = this.horizontalAngle;
        if (this.followBehindTarget && this.target && this.target.mesh) {
            const pyaw = this.target.mesh.rotation.y;
            this.targetHorizontalAngle = pyaw; // keep targets aligned
            this.horizontalAngle = pyaw;       // hard lock yaw for stability
            yawForCamera = pyaw;
        }
        const desiredX = targetPosition.x + Math.sin(yawForCamera) * this.distance * cosPitch;
        const desiredY = targetPosition.y + this.height + Math.sin(this.verticalAngle) * this.distance;
        const desiredZ = targetPosition.z + Math.cos(yawForCamera) * this.distance * cosPitch;
        
        const desiredPosition = new THREE.Vector3(desiredX, desiredY, desiredZ);
        
        // Smooth camera movement (lerp)
        this.camera.position.lerp(desiredPosition, this.smoothness);
        
        // Always look at the target
        const lookTarget = new THREE.Vector3(
            targetPosition.x,
            targetPosition.y + this.height / 2,
            targetPosition.z
        );
        this.camera.lookAt(lookTarget);

        // Debug telemetry for automated tests
        try {
            const camPos = this.camera.position;
            const playerYaw = this.target && this.target.mesh ? this.target.mesh.rotation.y : 0;
            window.__camDebug = {
                yaw: this.horizontalAngle,
                pitch: this.verticalAngle,
                targetYaw: this.targetHorizontalAngle,
                targetPitch: this.targetVerticalAngle,
                playerYaw: playerYaw,
                followBehind: !!this.followBehindTarget,
                pointerLocked: !!this.isPointerLocked,
                pos: { x: camPos.x, y: camPos.y, z: camPos.z },
                target: { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z }
            };
        } catch (e) { /* ignore */ }
    }
    
    // Get camera forward direction for movement
    getCameraForward() {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        direction.y = 0; // Remove vertical component for ground movement
        direction.normalize();
        return direction;
    }
    
    // Get camera right direction for movement
    getCameraRight() {
        const forward = this.getCameraForward();
        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
        right.normalize();
        return right;
    }
    
    // Reset camera to default position
    resetCamera() {
        this.horizontalAngle = 0;
        this.verticalAngle = 0.3;
        this.distance = 10;
        console.log('🔄 Camera reset to default position');
    }
    
    // Set camera target
    setTarget(newTarget) {
        this.target = newTarget;
        console.log('🎯 Camera target updated');
    }
    
    // Camera info for debugging
    getDebugInfo() {
        return {
            distance: this.distance,
            horizontalAngle: this.horizontalAngle,
            verticalAngle: this.verticalAngle,
            position: this.camera.position,
            isMouseDown: this.isMouseDown
        };
    }
}

// Export for global access
window.CameraController = CameraController;
