import * as THREE from "three";

const COUNT = 1200;
const positions = new Float32Array(COUNT * 3);
const sizes = new Float32Array(COUNT);
for (let i = 0; i < COUNT; i++) {
  // Shell distribution: stars behind the planet, not cluttering the ring plane
  const r = 6 + Math.random() * 8;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = r * Math.cos(phi);
  sizes[i] = 0.3 + Math.random() * 1.4;
}

function createStarTexture() {
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
  gradient.addColorStop(0.2, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.5, "rgba(240,240,255,0.35)");
  gradient.addColorStop(0.85, "rgba(220,220,255,0.08)");
  gradient.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const starTexture = createStarTexture();

const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

const vertexShader = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float size;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * uSize * uPixelRatio * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    gl_FragColor = vec4(uColor * tex.rgb, tex.a * uOpacity);
  }
`;

const mat = new THREE.ShaderMaterial({
  uniforms: {
    uSize: { value: 0.04 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uMap: { value: starTexture },
    uColor: { value: new THREE.Color(0xfff1d6) },
    uOpacity: { value: 0.9 },
  },
  vertexShader,
  fragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  fog: false,
});

export const stars = new THREE.Points(geo, mat);

export function disposeStars() {
  geo.dispose();
  mat.dispose();
  starTexture.dispose();
}
