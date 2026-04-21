import * as THREE from "three";
import {
  TRACK_COUNT as RING_COUNT,
  RING_START_RADIUS as START_RADIUS,
  RING_ELLIPSE_RATIO as ELLIPSE_RATIO,
  RING_TILT_X,
  RING_TILT_Y,
} from "./ringConfig.js";

const COUNT = 100;

// Bubbles use a narrower band than rings/glitter/flowers — END_RADIUS is local.
const END_RADIUS = 2;
const STEP = (END_RADIUS - START_RADIUS) / RING_COUNT;

// Parallax locally tuned (gentler drift than glitter/flowers).
const RINGS_JS_COUNT = 10;
const RINGS_JS_STEP = (END_RADIUS - START_RADIUS) / RINGS_JS_COUNT;
const BASE_SPEED = 0.01;
const PARALLAX_PER_INDEX = 0.0001;

const LARGE_RATIO = 0.35;

function buildBubbleAttributes() {
  const pos = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);
  const speeds = new Float32Array(COUNT);
  const ids = new Float32Array(COUNT);
  const colorIndices = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    const ringIndex = Math.floor(Math.random() * RING_COUNT);
    const inner = START_RADIUS + ringIndex * STEP;
    const outer = inner + STEP * 1.5;
    const baseR = (inner + outer) / 1.8;
    const r = baseR + (Math.random() - 0.5) * 0.08;

    const theta = Math.random() * Math.PI * 2;
    const x = r * ELLIPSE_RATIO * Math.cos(theta);
    const y = r * Math.sin(theta);
    const z = (Math.random() - 0.5) * 0.9;

    pos[i * 3 + 0] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;

    // 35% large 0.08-0.15, 65% small 0.02-0.05
    const isLarge = Math.random() < LARGE_RATIO;
    sizes[i] = isLarge
      ? 0.05 + Math.random() * 0.1
      : 0.02 + Math.random() * 0.02;

    // Weighted base tint: 40% champagne, 25% rose, 20% lavender, 15% gold
    const pick = Math.random();
    let colorIdx;
    if (pick < 0.4) colorIdx = 0;
    else if (pick < 0.65) colorIdx = 1;
    else if (pick < 0.85) colorIdx = 2;
    else colorIdx = 3;
    colorIndices[i] = colorIdx;

    ids[i] = i;

    const mappedRingIndex = (baseR - START_RADIUS) / RINGS_JS_STEP;
    speeds[i] = BASE_SPEED + mappedRingIndex * PARALLAX_PER_INDEX;
  }
  return { pos, sizes, speeds, ids, colorIndices };
}

const { pos, sizes, speeds, ids, colorIndices } = buildBubbleAttributes();

const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
geo.setAttribute("speed", new THREE.BufferAttribute(speeds, 1));
geo.setAttribute("pid", new THREE.BufferAttribute(ids, 1));
geo.setAttribute("colorIndex", new THREE.BufferAttribute(colorIndices, 1));

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  attribute float size;
  attribute float speed;
  attribute float pid;
  attribute float colorIndex;

  varying float vParticleID;
  varying float vColorIndex;
  varying float vSize;

  void main() {
    vParticleID = pid;
    vColorIndex = colorIndex;
    vSize = size;
    
    float individualFloat = sin(uTime * 0.5 + pid) * 0.1;
    float angle = uTime * speed;
    float c = cos(angle);
    float s = sin(angle);

    vec3 rotated = vec3(
      position.x * c - position.y * s,
      position.x * s + position.y * c,
      position.z + individualFloat
    );

    vec4 mvPosition = modelViewMatrix * vec4(rotated, 1.0);
    gl_PointSize = size * uSize * uPixelRatio * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uFade;

  varying float vParticleID;
  varying float vColorIndex;
  varying float vSize;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv) * 2.0;
    if (dist > 1.02) discard;

    // Anti-aliased circular edge
    float edgeAA = 1.0 - smoothstep(0.96, 1.02, dist);

    // --- Layer 1: Thin fresnel rim (glass shell) ---
    // A narrow bright band near the outer edge + a broad fresnel falloff
    float rim = smoothstep(0.78, 0.95, dist) * (1.0 - smoothstep(0.95, 1.02, dist));
    float fresnel = pow(dist, 3.0) * 0.35;

    // --- Layer 2: Swirling thin-film interference ---
    // Real bubbles show uneven, flowing rainbow bands (varying film thickness),
    // not concentric rings. Approximate with layered trig noise in polar space.
    float angle = atan(uv.y, uv.x);
    float swirl = dist * 4.0
                + sin(angle * 3.0 + vParticleID * 1.3 + uTime * 0.15) * 0.6
                + sin(angle * 5.0 - vParticleID * 0.7) * 0.35
                + cos(dist * 7.0 + angle * 2.0 + vParticleID) * 0.5;
    float phase = swirl + vParticleID * 1.7;

    vec3 iri;
    iri.r = cos(phase) * 0.5 + 0.5;
    iri.g = cos(phase + 2.094) * 0.5 + 0.5;
    iri.b = cos(phase + 4.189) * 0.5 + 0.5;

    // Per-particle base tint (step-decoded)
    vec3 baseColor = vec3(0.941, 0.922, 0.898); // #F0EBE5 champagne
    baseColor = mix(baseColor, vec3(0.910, 0.816, 0.835), step(0.5, vColorIndex)); // #E8D0D5 rose
    baseColor = mix(baseColor, vec3(0.835, 0.835, 0.910), step(1.5, vColorIndex)); // #D5D5E8 lavender
    baseColor = mix(baseColor, vec3(0.910, 0.863, 0.753), step(2.5, vColorIndex)); // #E8DCC0 gold

    vec3 filmColor = mix(baseColor, iri, 0.72);

    // --- Layer 3: Sharp specular + soft bloom (upper-right key light) ---
    vec2 specUV = gl_PointCoord - vec2(0.68, 0.28);
    float d2 = dot(specUV, specUV);
    float specCore = exp(-d2 * 260.0);          // tight hotspot
    float specBloom = exp(-d2 * 45.0) * 0.35;   // soft halo around it
    float specular = specCore + specBloom;

    // Secondary (lower-left environment bounce)
    vec2 spec2UV = gl_PointCoord - vec2(0.3, 0.72);
    float spec2 = exp(-dot(spec2UV, spec2UV) * 180.0) * 0.28;

    // --- Layer 4: Surface caustic — slow flowing thickness variation ---
    float caustic = 0.0;
    if (vSize > 0.06) {
      caustic = sin(gl_PointCoord.x * 18.0 + vParticleID + uTime * 0.3)
              * sin(gl_PointCoord.y * 14.0 + vParticleID * 0.7 + uTime * 0.2)
              * 0.12;
    }

    // --- Composition ---
    
    // The shell carries the iridescent color, strongest at the fresnel rim.
    float shellEnergy = rim * 1.0 + fresnel * 0.25;
    vec3 color = filmColor * shellEnergy
               + vec3(1.0, 0.98, 0.95) * specular
               + vec3(1.0) * spec2
               + filmColor * caustic;

    // Interior is nearly transparent — alpha is carried by rim + highlights.
    float alpha = (0.12 + rim * 0.85
                 + fresnel * 0.05
                 + specular * 0.95
                 + spec2 * 0.4
                 + abs(caustic) * 0.12)
                * edgeAA;

    // Gentle independent twinkle
    alpha *= 0.92 + 0.18 * sin(uTime * 1.2 + vParticleID * 3.0);

    gl_FragColor = vec4(color, alpha * uFade);
  }
`;

const mat = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uFade: { value: 1 },
    uSize: { value: 2 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  },
  vertexShader,
  fragmentShader,
  transparent: true,
  blending: THREE.NormalBlending,
  depthWrite: false,
  fog: false,
});

export const bubbles = new THREE.Points(geo, mat);

// Match ring/glitter tilt so bubbles sit in the ring plane
bubbles.rotation.x = RING_TILT_X;
bubbles.rotation.y = RING_TILT_Y;
// Draw on top of the rings (rings use renderOrder ≤ 100 + i)
bubbles.renderOrder = 500;

export function disposeBubbles() {
  geo.dispose();
  mat.dispose();
}
