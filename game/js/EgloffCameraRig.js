/*
Egloff-style TPS Camera Rig
- Yaw pivot (Y) + Pitch pivot (X) + Camera offset
- Pointer lock mouse look with smoothing and pitch clamp
- Keeps camera behind the character and rotates the character to face aim
*/

class EgloffCameraRig {
  constructor(camera, target, options = {}) {
    this.camera = camera;
    this.target = target; // expects Player with mesh
    this.scene = options.scene || null;

    this.height = options.height ?? 1.6; // eye height offset
    this.distance = options.distance ?? 6.0; // camera boom length
    this.minPitch = options.minPitch ?? -0.45; // ~-26°
    this.maxPitch = options.maxPitch ?? 0.35;  // ~+20°
    this.yawSmooth = options.yawSmooth ?? 0.18;
    this.pitchSmooth = options.pitchSmooth ?? 0.18;
    this.charTurnLerp = options.charTurnLerp ?? 0.6; // faster character facing
    this.mouseSensitivity = options.mouseSensitivity ?? 0.00125;
    this.enableFreeYawOnMouseMove = options.enableFreeYawOnMouseMove ?? true; // rotate yaw while mouse moves over canvas

    // Rig hierarchy
    this.yawPivot = new THREE.Object3D();
    this.pitchPivot = new THREE.Object3D();
    this.yawPivot.add(this.pitchPivot);
    this.pitchPivot.add(this.camera);
    // Attach rig to scene so transforms propagate
    if (this.scene && this.scene.add) {
      this.scene.add(this.yawPivot);
    } else {
      // Attempt to find scene via target's parents
      let parent = this.target && this.target.mesh ? this.target.mesh.parent : null;
      while (parent && !parent.isScene) parent = parent.parent;
      if (parent && parent.add) parent.add(this.yawPivot);
    }

    // Place camera behind pitch pivot
    this.camera.position.set(0, 0, -this.distance);

    // Angles
    this.yaw = 0; this.pitch = 0;
    this.yawTarget = 0; this.pitchTarget = 0.15;

    // Input state
    this.pointerLocked = false;
    this._bindPointerLock();
  }

  _bindPointerLock() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    canvas.addEventListener('click', () => {
      if (!this.pointerLocked && canvas.requestPointerLock) canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = (document.pointerLockElement === canvas);
      document.body.style.cursor = this.pointerLocked ? 'none' : 'default';
    });

    // Pointer lock look
    document.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked) return;
      const dx = e.movementX || 0;
      const dy = e.movementY || 0;
      this.yawTarget -= dx * this.mouseSensitivity;
      this.pitchTarget -= dy * this.mouseSensitivity;
      // clamp pitch
      this.pitchTarget = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitchTarget));
      // normalize yaw to [-PI..PI]
      if (this.yawTarget > Math.PI) this.yawTarget -= Math.PI * 2;
      if (this.yawTarget < -Math.PI) this.yawTarget += Math.PI * 2;
    });

    // Drag-to-look fallback when not pointer locked
    let isMouseDown = false;
    let lastX = 0, lastY = 0;
    document.addEventListener('mousedown', (e) => {
      if (e.button === 0) { isMouseDown = true; lastX = e.clientX; lastY = e.clientY; }
    });
    document.addEventListener('mouseup', (e) => { if (e.button === 0) isMouseDown = false; });
    document.addEventListener('mousemove', (e) => {
      if (this.pointerLocked) return;
      // If dragging: adjust yaw+pitch. If free mouse move enabled: adjust yaw only.
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      if (isMouseDown) {
        this.yawTarget -= dx * this.mouseSensitivity;
        this.pitchTarget -= dy * this.mouseSensitivity;
        this.pitchTarget = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitchTarget));
      } else if (this.enableFreeYawOnMouseMove) {
        // Turn-in-place yaw when mouse moves over canvas (no pitch change)
        this.yawTarget -= dx * (this.mouseSensitivity * 0.6);
      }
      if (this.yawTarget > Math.PI) this.yawTarget -= Math.PI * 2;
      if (this.yawTarget < -Math.PI) this.yawTarget += Math.PI * 2;
    });
  }

  _lerpAngle(a, b, t) {
    let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
    return a + d * t;
  }

  getYaw() { return this.yaw; }

  update(delta) {
    if (!this.target || !this.target.mesh) return;

    // Smooth angles
    this.yaw = this._lerpAngle(this.yaw, this.yawTarget, this.yawSmooth);
    this.pitch = THREE.MathUtils.lerp(this.pitch, this.pitchTarget, this.pitchSmooth);

    // Position rig at player
    const p = this.target.mesh.position;
    this.yawPivot.position.set(p.x, p.y + this.height, p.z);
    this.yawPivot.rotation.set(0, this.yaw, 0);
    this.pitchPivot.rotation.set(this.pitch, 0, 0);

    // Compute camera world position from rig
    // Camera already offset at (0,0,distance) under pitch pivot; just ensure lookAt
    const lookTarget = new THREE.Vector3(p.x, p.y + this.height, p.z);
    this.camera.lookAt(lookTarget);

    // Rotate character to face aim
    const aimYaw = this.yaw; // face where the camera is aiming (on XZ)
    const newYaw = this._lerpAngle(this.target.mesh.rotation.y, aimYaw, this.charTurnLerp);
    this.target.mesh.rotation.y = newYaw;

    // Telemetry for tests
    try {
      const camPos = this.camera.getWorldPosition(new THREE.Vector3());
      window.__camDebug = {
        yaw: this.yaw,
        pitch: this.pitch,
        playerYaw: this.target.mesh.rotation.y,
        pos: { x: camPos.x, y: camPos.y, z: camPos.z },
        target: { x: p.x, y: p.y + this.height, z: p.z }
      };
    } catch (e) {}
  }
}

window.EgloffCameraRig = EgloffCameraRig;
