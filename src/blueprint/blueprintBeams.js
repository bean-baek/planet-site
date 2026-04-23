import * as THREE from "three";

export function createBlueprintBeams() {
  const group = new THREE.Group();
  group.userData = { isBlueprintBeams: true };

  const beamConfigs = [
    { pos: [1.8, -0.9, 0.5], rot: [0.1, 0.3, Math.PI * 0.32], size: [0.25, 0.25, 14] },
    { pos: [-1.6, 1.1, -0.4], rot: [-0.05, -0.2, Math.PI * 0.58], size: [0.18, 0.18, 12] },
    { pos: [2.5, 1.8, -0.8], rot: [0.2, 0.15, Math.PI * 0.42], size: [0.14, 0.14, 10] },
    { pos: [-2.2, -1.6, -1.0], rot: [-0.15, -0.1, Math.PI * 0.48], size: [0.16, 0.16, 11] },
  ];

  const bodyMat = new THREE.MeshBasicMaterial({ color: 0xf6f6f6, transparent: true, opacity: 1 });
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.9 });

  for (const cfg of beamConfigs) {
    const geom = new THREE.BoxGeometry(cfg.size[0], cfg.size[1], cfg.size[2]);
    const mesh = new THREE.Mesh(geom, bodyMat);
    mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    mesh.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
    mesh.userData.baseOpacity = 1;

    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geom), edgeMat);
    mesh.add(edges);

    // anchor points along each beam for annotations
    const anchors = [];
    for (let i = -0.3; i <= 0.3; i += 0.3) {
      const p = new THREE.Vector3(0, cfg.size[1] * 0.55, cfg.size[2] * i);
      anchors.push(p);
    }
    mesh.userData.dataAnchors = anchors;
    group.add(mesh);
  }

  return group;
}
