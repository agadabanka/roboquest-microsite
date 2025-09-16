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

    this.height = options.height ?? 1.6; // eye height offset
    this.distance = options.distance ?? 6.0; // camera boom length
    this.minPitch = options.minPitch ?? -0.45; // ~-26°
    this.maxPitch = options.maxPitch ?? 0.35;  // ~+20°
    this.yawSmooth = options.yawSmooth ?? 0.18;
    this.pitchSmooth = options.pitchSmooth ?? 0.18;
    this.mouseSensitivity = options.mouseSensitivity ?? 0.00125;

    // Rig hierarchy
    this.yawPivot = new THREE.Object3D();
    this.pitchPivot = new THREE.Object3D();
    this.yawPivot.add(this.pitchPivot);
    this.pitchPivot.add(this.camera);

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
    const newYaw = this._lerpAngle(this.target.mesh.rotation.y, aimYaw, 0.25);
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
