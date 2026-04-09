import * as THREE from "three";

export function createPlanet(planetTexture) {
  const geo = new THREE.IcosahedronGeometry(1, 20);
  const mat = new THREE.MeshPhysicalMaterial({
    map: planetTexture,
    roughness: 0.05,
    metalness: 0.05,
    transmission: 0.1,
    thickness: 0.5,
    iridescence: 1.0,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [100, 500],
    ior: 1.5,
    specularIntensity: 1.8,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });
  return new THREE.Mesh(geo, mat);
}
