import * as THREE from "three";

// Ring plane tilt — identical across rings/glitter/bubbles/flowers/petals.
export const RING_TILT_X = Math.PI / 2 + 0.2;
export const RING_TILT_Y = Math.PI + 0.2;

export function applyRingTilt(obj3d) {
  obj3d.rotation.x = RING_TILT_X;
  obj3d.rotation.y = RING_TILT_Y;
}

// Ring band radius — shared by rings/glitter/flowers.
// bubbles keeps a narrower band; see bubbles.js for its local END_RADIUS.
export const RING_START_RADIUS = 1.2;
export const RING_END_RADIUS = 2.3;

// Ellipse aspect for ring-plane-local placement.
export const RING_ELLIPSE_RATIO = 1.0;

// Number of ring meshes in rings.js — glitter/flowers map particle radii
// back to this count when deriving per-particle parallax speeds.
export const RING_COUNT = 100;

// Placement-track count for glitter/bubbles/flowers scatter.
export const TRACK_COUNT = 8;

// 8-color pastel palette shared by rings.js and glitter.js.
export const RING_TRACK_COLORS = [
  0xffe4e8, // pale pink
  0xffd6e5, // soft blush
  0xffe8d6, // peach cream
  0xfff5d6, // buttermilk
  0xe8d6ff, // lavender mist
  0xd6e6ff, // pale periwinkle
  0xd6fff2, // pastel mint
  0xe8f6ff, // ice blue
];

export const RING_TRACK_PALETTE = RING_TRACK_COLORS.map(
  (hex) => new THREE.Color(hex),
);
