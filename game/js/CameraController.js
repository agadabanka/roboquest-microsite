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
        this.lockCharacterYawToCamera = options.lockCharacterYawToCamera !== false; // default true
        
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
            // Pointer lock mode: rotate continuously by movement deltas
            if (this.isPointerLocked) {
                const deltaX = event.movementX || 0;
                const deltaY = event.movementY || 0;
                this.targetHorizontalAngle -= deltaX * this.mouseSensitivity;
                this.targetVerticalAngle -= deltaY * this.mouseSensitivity;
                // Clamp pitch
                this.targetVerticalAngle = Math.max(this.minVerticalAngle, Math.min(this.maxVerticalAngle, this.targetVerticalAngle));
                
                // Optionally rotate character yaw with camera
                if (this.lockCharacterYawToCamera && this.target && this.target.mesh) {
                    const lerpAngle = (a, b, t) => {
                        let delta = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
                        return a + delta * t;
                    };
                    const targetYaw = this.targetHorizontalAngle;
                    this.target.mesh.rotation.y = lerpAngle(this.target.mesh.rotation.y, targetYaw, 0.25);
                }
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
        
        // Get target position
        const targetPosition = this.target.mesh ? this.target.mesh.position : this.target.position;
        
        // Smooth angles towards targets
        const wrap = (a) => {
            // keep within -PI..PI for numerical stability
            if (a > Math.PI) a -= Math.PI * 2;
            if (a < -Math.PI) a += Math.PI * 2;
            return a;
        };
        this.horizontalAngle = wrap(this.horizontalAngle + (this.targetHorizontalAngle - this.horizontalAngle) * this.rotationSmoothness);
        this.verticalAngle = this.verticalAngle + (this.targetVerticalAngle - this.verticalAngle) * this.rotationSmoothness;
        
        // Calculate desired camera position based on smoothed angles
        const cosPitch = Math.cos(this.verticalAngle);
        const desiredX = targetPosition.x + Math.sin(this.horizontalAngle) * this.distance * cosPitch;
        const desiredY = targetPosition.y + this.height + Math.sin(this.verticalAngle) * this.distance;
        const desiredZ = targetPosition.z + Math.cos(this.horizontalAngle) * this.distance * cosPitch;
        
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
