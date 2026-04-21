import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { camera, renderer } from "./scene.js";

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 1.1;
controls.maxDistance = 12;

// --- 탐험 시스템용 변수 ---
const moveState = { forward: 0, right: 0 };
const MOVE_SPEED = 4.0;
const BOUNDARY = 8.0; 

window.addEventListener("keydown", (e) => {
  const code = e.code;
  if (code === "ArrowUp" || code === "KeyW") moveState.forward = 1;
  if (code === "ArrowDown" || code === "KeyS") moveState.forward = -1;
  if (code === "ArrowLeft" || code === "KeyA") moveState.right = -1;
  if (code === "ArrowRight" || code === "KeyD") moveState.right = 1;
});

window.addEventListener("keyup", (e) => {
  const code = e.code;
  if (["ArrowUp", "ArrowDown", "KeyW", "KeyS"].includes(code)) moveState.forward = 0;
  if (["ArrowLeft", "ArrowRight", "KeyA", "KeyD"].includes(code)) moveState.right = 0;
});

export function updateCameraMovement(delta) {
  if (moveState.forward === 0 && moveState.right === 0) return;

  // 1. 방향 벡터 계산 (안정적인 Y-up 기준)
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3();
  right.set(forward.z, 0, -forward.x).normalize().negate(); 

  // 2. 이동할 벡터 합산
  const moveVec = new THREE.Vector3();
  moveVec.addScaledVector(forward, moveState.forward);
  moveVec.addScaledVector(right, moveState.right);
  moveVec.normalize().multiplyScalar(MOVE_SPEED * delta);

  // [핵심] 3. 타겟과 카메라 포지션을 동시에 이동 (Sliding)
  // 이렇게 해야 OrbitControls 상태에서도 시점이 평행하게 이동합니다.
  const nextTargetX = controls.target.x + moveVec.x;
  const nextTargetZ = controls.target.z + moveVec.z;

  // [가드] 경계 체크
  if (Math.abs(nextTargetX) < BOUNDARY) {
    controls.target.x = nextTargetX;
    camera.position.x += moveVec.x;
  }
  if (Math.abs(nextTargetZ) < BOUNDARY) {
    controls.target.z = nextTargetZ;
    camera.position.z += moveVec.z;
  }
}

const ORBITAL_TARGET = new THREE.Vector3(0, 0, 0);

export function setControlsMode(mode) {
  if (mode === "landscape") {
    controls.target.set(0, 0.05, 0);
    controls.minDistance = 0.3;
    controls.maxDistance = 2.0;
    controls.minPolarAngle = 0.2;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.zoomSpeed = 0.5;
  } else {
    controls.target.copy(ORBITAL_TARGET);
    controls.minDistance = 1.1;
    controls.maxDistance = 12;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
    controls.zoomSpeed = 1;
  }
  controls.update();
}
