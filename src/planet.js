import * as THREE from "three";

export const AURORA = {
  name: "AURORA",
  radius: 1,
  segments: 64,
  position: [0, 0, 0],
  normalScale: 0.08,
  material: {
    roughness: 0.55,
    metalness: 0.1,
    transparent: true,
    opacity: 0.95,
    transmission: 0.15,
    iridescence: 1,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [100, 800],
  },
};

export function createPlanet(options = {}) {
  const {
    name = AURORA.name,
    textures = {},
    radius = AURORA.radius,
    segments = AURORA.segments,
    position = AURORA.position,
    normalScale = AURORA.normalScale,
    material: materialOverrides = {},
  } = options;

  const { albedo, normal, roughness } = textures;
  const mat = { ...AURORA.material, ...materialOverrides };

  const geo = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshPhysicalMaterial({
    map: albedo,
    normalMap: normal,
    normalScale: new THREE.Vector2(normalScale, normalScale),
    roughnessMap: roughness,
    roughness: mat.roughness,
    metalness: mat.metalness,
    transparent: mat.transparent,
    opacity: mat.opacity,
    transmission: mat.transmission,
    iridescence: mat.iridescence,
    iridescenceIOR: mat.iridescenceIOR,
    iridescenceThicknessRange: mat.iridescenceThicknessRange,
  });

  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.name = name;
  mesh.userData.planetName = name;
  return mesh;
}

export function disposePlanet(planet) {
  planet.geometry.dispose();
  if (planet.material.map) planet.material.map.dispose();
  if (planet.material.normalMap) planet.material.normalMap.dispose();
  if (planet.material.roughnessMap) planet.material.roughnessMap.dispose();
  planet.material.dispose();
}
