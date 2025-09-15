/*
ROBOQUEST 3RD PERSON CAMERA CONTROLLER
Professional follow camera with mouse controls
*/

class CameraController {
    constructor(camera, target) {
        this.camera = camera;
        this.target = target; // Player object to follow
        
        // Camera settings
        this.distance = 10; // Distance behind player
        this.height = 6; // Height above player
        this.rotationSpeed = 0.002; // Mouse sensitivity
        this.smoothness = 0.05; // Camera smoothing factor
        
        // Mouse control state
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.previousMouseX = 0;
        this.previousMouseY = 0;
        
        // Camera rotation
        this.horizontalAngle = 0; // Yaw around player
        this.verticalAngle = 0.3; // Pitch angle
        this.minVerticalAngle = -Math.PI / 3; // Look down limit
        this.maxVerticalAngle = Math.PI / 3; // Look up limit
        
        // Camera pivot point
        this.pivot = new THREE.Object3D();
        
        this.setupEventListeners();
        
        console.log('📷 3rd Person Camera Controller initialized');
    }
    
    setupEventListeners() {
        // Mouse down/up events
        document.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Left click
                this.isMouseDown = true;
                this.previousMouseX = event.clientX;
                this.previousMouseY = event.clientY;
                document.body.style.cursor = 'grabbing';
            }
        });
        
        document.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                this.isMouseDown = false;
                document.body.style.cursor = 'default';
            }
        });
        
        // Mouse move for camera rotation
        document.addEventListener('mousemove', (event) => {
            if (this.isMouseDown) {
                const deltaX = event.clientX - this.previousMouseX;
                const deltaY = event.clientY - this.previousMouseY;
                
                // Update camera rotation
                this.horizontalAngle -= deltaX * this.rotationSpeed;
                this.verticalAngle -= deltaY * this.rotationSpeed;
                
                // Clamp vertical angle
                this.verticalAngle = Math.max(this.minVerticalAngle, 
                    Math.min(this.maxVerticalAngle, this.verticalAngle));
                
                this.previousMouseX = event.clientX;
                this.previousMouseY = event.clientY;
                
                console.log('🖱️ Camera rotation:', {
                    horizontal: this.horizontalAngle,
                    vertical: this.verticalAngle
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
        
        // Calculate desired camera position based on rotation
        const desiredX = targetPosition.x + 
            Math.sin(this.horizontalAngle) * this.distance * Math.cos(this.verticalAngle);
        const desiredY = targetPosition.y + this.height + 
            Math.sin(this.verticalAngle) * this.distance;
        const desiredZ = targetPosition.z + 
            Math.cos(this.horizontalAngle) * this.distance * Math.cos(this.verticalAngle);
        
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