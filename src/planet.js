import * as THREE from "three";

export function createPlanet({ sphereAlbedo, sphereNormal, sphereRoughness }) {
  const geo = new THREE.SphereGeometry(1, 64, 64);
  const mat = new THREE.MeshPhysicalMaterial({
    map: sphereAlbedo,
    normalMap: sphereNormal,
    normalScale: new THREE.Vector2(0.08, 0.08),
    roughnessMap: sphereRoughness,
    roughness: 0.55,
    metalness: 0.1,
    transparent: true,
    opacity: 0.95,
    transmission: 0.15,
    iridescence: 1,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [100, 800],
  });

  return new THREE.Mesh(geo, mat);
}

export function disposePlanet(planet) {
  planet.geometry.dispose();
  if (planet.material.map) planet.material.map.dispose();
  if (planet.material.normalMap) planet.material.normalMap.dispose();
  if (planet.material.roughnessMap) planet.material.roughnessMap.dispose();
  planet.material.dispose();
}
