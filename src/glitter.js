import * as THREE from "three";
import {
  TRACK_COUNT,
  RING_COUNT,
  RING_START_RADIUS as START_RADIUS,
  RING_END_RADIUS as END_RADIUS,
  RING_ELLIPSE_RATIO as ELLIPSE_RATIO,
  RING_TRACK_PALETTE as PALETTE,
  RING_TILT_X,
  RING_TILT_Y,
} from "./ringConfig.js";

const COUNT = 5000;

const STEP = (END_RADIUS - START_RADIUS) / TRACK_COUNT;
const RINGS_JS_STEP = (END_RADIUS - START_RADIUS) / RING_COUNT;
const BASE_SPEED = 0.04; // RING_BASE_ROT_Z
const PARALLAX_PER_INDEX = 0.0015;

function createSparkleTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0.0, "rgba(255,255,255,1.0)");
  gradient.addColorStop(0.15, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.45, "rgba(230,235,255,0.45)");
  gradient.addColorStop(0.8, "rgba(220,215,255,0.12)");
  gradient.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const sparkleTexture = createSparkleTexture();

function buildGlitterAttributes() {
  const pos = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);
  const colors = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    const trackIndex = Math.floor(Math.random() * TRACK_COUNT);
    const inner = START_RADIUS + trackIndex * STEP;
    const outer = inner + STEP * 1.5;
    const baseR = (inner + outer) / 1.8;
    const r = baseR + (Math.random() - 0.9) * 0.03;

    const theta = Math.random() * Math.PI * 2;
    const x = r * ELLIPSE_RATIO * Math.cos(theta);
    const y = r * Math.sin(theta);
    const z = (Math.random() - 0.4) * 0.01;

    pos[i * 3 + 0] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;

    const targetColor = PALETTE[trackIndex % PALETTE.length];
    colors[i * 3 + 0] = targetColor.r;
    colors[i * 3 + 1] = targetColor.g;
    colors[i * 3 + 2] = targetColor.b;

    sizes[i] = Math.random() * 2;

    // rings.js parallax 공식을 이 파티클의 반경에 매핑
    const mappedRingIndex = (baseR - START_RADIUS) / RINGS_JS_STEP;
    speeds[i] = BASE_SPEED + mappedRingIndex * PARALLAX_PER_INDEX;
  }
  return { pos, sizes, colors, speeds };
}

const { pos, sizes, colors, speeds } = buildGlitterAttributes();

const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
geo.setAttribute("speed", new THREE.BufferAttribute(speeds, 1));

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  attribute float size;
  attribute float speed;

  varying vec3 vColor;

  void main() {
    vColor = color;

    // 파티클별 rings.js 속도로 Z 회전 (local, tilt 이전)
    float angle = uTime * speed;
    float c = cos(angle);
    float s = sin(angle);
    vec3 rotated = vec3(
      position.x * c - position.y * s,
      position.x * s + position.y * c,
      position.z
    );

    vec4 mvPosition = modelViewMatrix * vec4(rotated, 1.0);
    gl_PointSize = size * uSize * uPixelRatio * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;

  varying vec3 vColor;

  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    gl_FragColor = vec4(vColor * tex.rgb, tex.a * uOpacity);
  }
`;

const mat = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uSize: { value: 0.03 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uMap: { value: sparkleTexture },
    uOpacity: { value: 1 },
  },
  vertexShader,
  fragmentShader,
  vertexColors: true,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  fog: false,
});

export const glitter = new THREE.Points(geo, mat);

glitter.rotation.x = RING_TILT_X;
glitter.rotation.y = RING_TILT_Y;

export function disposeGlitter() {
  geo.dispose();
  mat.dispose();
  sparkleTexture.dispose();
}
