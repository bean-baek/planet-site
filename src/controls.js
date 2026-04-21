import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { camera, renderer } from "./scene.js";

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 1.1;
controls.maxDistance = 12;

const ORBITAL_TARGET = new THREE.Vector3(0, 0, 0);

export function setControlsMode(mode) {
  if (mode === "landscape") {
    // Landscape 모드: 지표면 근처에서 자유롭게 탐색 가능
    controls.target.set(0, 0.05, 0);
    controls.minDistance = 0.3;
    controls.maxDistance = 2.0;
    controls.minPolarAngle = 0.2;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.zoomSpeed = 0.5;
  } else {
    // Orbital 모드: 우주 공간에서 자유롭게 탐색 가능
    controls.target.copy(ORBITAL_TARGET);
    controls.minDistance = 1.1;
    controls.maxDistance = 12;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
    controls.zoomSpeed = 1;
  }
  controls.update();
}
