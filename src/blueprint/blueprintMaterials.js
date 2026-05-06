import { LineMaterial } from "three/addons/lines/LineMaterial.js";

/**
 * Creates a LineMaterial with shared defaults and registers it in the
 * caller's tracking array so resolution updates and disposal work correctly.
 */
export function makeLineMat(linewidth, opacity, trackingArray, extraOpts = {}) {
  const mat = new LineMaterial({
    color: 0xffffff,
    linewidth,
    transparent: true,
    opacity,
    worldUnits: false,
    dashed: false,
    ...extraOpts,
  });
  mat.resolution.set(window.innerWidth, window.innerHeight);
  trackingArray.push(mat);
  return mat;
}
