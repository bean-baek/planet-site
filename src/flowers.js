import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import {
  TRACK_COUNT,
  RING_COUNT,
  RING_START_RADIUS as START_RADIUS,
  RING_END_RADIUS as END_RADIUS,
  RING_TILT_X,
  RING_TILT_Y,
  RING_TRACK_PALETTE,
} from "./ringConfig.js";

const MODEL_URL = "/model/flower/1435963177547374592.glb";

// Flower instances scattered on the same ring tracks as glitter.
const COUNT = 120;
const STEP = (END_RADIUS - START_RADIUS) / TRACK_COUNT;
const RINGS_JS_STEP = (END_RADIUS - START_RADIUS) / RING_COUNT;
const BASE_SPEED = 0.04;
const PARALLAX_PER_INDEX = 0.0015;

const MIN_SCALE = 0.02;
const MAX_SCALE = 0.05;
const Z_SPREAD = 0.05;
const EMISSIVE_INTENSITY = 1.2;
const COLOR_OVERLAY_MIX = 0.45; // Overlay intensity, can be adjusted later

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

function applyFlowerMaterial(root, trackColor) {
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    
    // Clone materials so each flower can have its own track color
    if (Array.isArray(obj.material)) {
      obj.material = obj.material.map(m => m.clone());
    } else {
      obj.material = obj.material.clone();
    }

    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((m) => {
      // Use the provided track color to overlay onto the base material
      const base = m.color ? m.color.clone() : new THREE.Color(0xffd6e5);
      
      // "Overlay" effect: blend the palette color with the base color
      if (m.color) {
        m.color.copy(base).lerp(trackColor, COLOR_OVERLAY_MIX);
      }
      
      // Set emissive to the track color for that "glow" matching the glitter
      m.emissive.copy(trackColor);
      
      if (m.map) m.emissiveMap = m.map;
      m.emissiveIntensity = EMISSIVE_INTENSITY;
      m.transparent = true;
      m.depthWrite = false;
      m.fog = false;
      m.toneMapped = true;
    });
  });
}

function normalizeScale(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3()).length();
  return 1 / Math.max(size, 1e-3);
}

export async function createFlowers() {
  const gltf = await loader.loadAsync(MODEL_URL);
  const source = gltf.scene;
  const unitScale = normalizeScale(source);

  const group = new THREE.Group();

  for (let i = 0; i < COUNT; i++) {
    const trackIndex = Math.floor(Math.random() * TRACK_COUNT);
    const inner = START_RADIUS + trackIndex * STEP;
    const outer = inner + STEP * 1.5;
    const baseR = (inner + outer) / 1.8;
    const r = baseR + (Math.random() - 0.5) * 0.05;

    const initialTheta = Math.random() * Math.PI * 2;
    const z = (Math.random() - 0.5) * Z_SPREAD;

    const clone = source.clone(true);
    
    // Apply track-specific color (referencing glitter colors)
    const trackColor = RING_TRACK_PALETTE[trackIndex % RING_TRACK_PALETTE.length];
    applyFlowerMaterial(clone, trackColor);

    clone.position.set(r, 0, z);
    const s = (MIN_SCALE + Math.random() * (MAX_SCALE - MIN_SCALE)) * unitScale;
    clone.scale.setScalar(s);
    clone.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
    );

    // Each flower orbits around the group's Z axis at its own parallax speed
    const orbit = new THREE.Group();
    orbit.add(clone);
    orbit.rotation.z = initialTheta;

    const mappedRingIndex = (baseR - START_RADIUS) / RINGS_JS_STEP;
    orbit.userData.speed = BASE_SPEED + mappedRingIndex * PARALLAX_PER_INDEX;

    group.add(orbit);
  }

  group.rotation.x = RING_TILT_X;
  group.rotation.y = RING_TILT_Y;
  group.renderOrder = 600;

  return group;
}

export function disposeFlowers(group) {
  group.traverse((obj) => {
    if (!obj.isMesh) return;
    if (obj.geometry) obj.geometry.dispose();
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((m) => m && m.dispose());
  });
}
