import * as THREE from "three";

let terrain = null;
let disposed = false;
const terrainUniforms = {
  uTime: { value: 0 },
};

function layeredNoise(x, y) {
  let v = 0;
  v += Math.sin(x * 1.2 + y * 0.8) * 0.5;
  v += Math.sin(x * 2.5 - y * 1.7 + 1.3) * 0.25;
  v += Math.sin(x * 5.1 + y * 4.3 + 2.7) * 0.125;
  v += Math.sin(x * 10.3 - y * 8.7 + 5.1) * 0.0625;
  return v;
}

function generateHeightmap(size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x / size) * 6;
      const ny = (y / size) * 6;
      const v = (layeredNoise(nx, ny) + 1) * 0.5;
      const byte = Math.floor(v * 255);
      const idx = (y * size + x) * 4;
      imageData.data[idx] = byte;
      imageData.data[idx + 1] = byte;
      imageData.data[idx + 2] = byte;
      imageData.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

const TERRAIN_COLORS = [
  [0.85, 0.75, 0.8],
  [0.8, 0.82, 0.88],
  [0.85, 0.8, 0.72],
  [0.78, 0.85, 0.82],
  [0.82, 0.78, 0.85],
];

function generateColorMap(size, heightmap) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(size, size);

  const hCtx = heightmap.image.getContext("2d");
  const hData = hCtx.getImageData(0, 0, size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const h = hData.data[idx] / 255;

      const bandIdx = Math.min(
        Math.floor(h * TERRAIN_COLORS.length),
        TERRAIN_COLORS.length - 1,
      );
      const c = TERRAIN_COLORS[bandIdx];
      const vary = layeredNoise((x / size) * 12, (y / size) * 12) * 0.05;

      imageData.data[idx] = Math.floor(
        Math.max(0, Math.min(1, c[0] + vary)) * 255,
      );
      imageData.data[idx + 1] = Math.floor(
        Math.max(0, Math.min(1, c[1] + vary)) * 255,
      );
      imageData.data[idx + 2] = Math.floor(
        Math.max(0, Math.min(1, c[2] + vary)) * 255,
      );
      imageData.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createLandscape(scene) {
  if (terrain) return terrain;

  const SIZE = 512;
  const heightmap = generateHeightmap(SIZE);
  const colorMap = generateColorMap(SIZE, heightmap);

  const geo = new THREE.PlaneGeometry(20, 20, 256, 256);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshPhysicalMaterial({
    map: colorMap,
    displacementMap: heightmap,
    displacementScale: 0.4,
    roughness: 0.4,
    metalness: 0.05,
    iridescence: 0.5,
    iridescenceIOR: 1.3,
    clearcoat: 0.3,
    // [초미세 조정] 0.02 -> 0.05
    emissive: new THREE.Color("#ffffff"),
    emissiveMap: colorMap,
    emissiveIntensity: 0.05,
    side: THREE.DoubleSide,
    fog: true,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = terrainUniforms.uTime;
    shader.vertexShader = `
      uniform float uTime;
      ${shader.vertexShader}
    `.replace(
      "#include <displacementmap_vertex>",
      `
      #include <displacementmap_vertex>
      // [시니어 디테일] 더 정교하고 리얼한 복합 파동 연출
      float wave = sin(transformed.x * 1.2 + uTime * 0.4) * cos(transformed.z * 1.5 + uTime * 0.5) * 0.08;
      transformed.y += wave;
      `,
    );
  };

  terrain = new THREE.Mesh(geo, mat);
  terrain.visible = false;
  terrain.position.y = -0.5;
  scene.add(terrain);

  return terrain;
}

export function updateLandscape(delta) {
  terrainUniforms.uTime.value += delta;
}

export function createLandscapeLights() {
  const group = new THREE.Group();

  // 1. 카메라 바로 위에서 수직으로 내리는 화이트 광원
  const topLight = new THREE.DirectionalLight("#ffffff", 0.4);
  topLight.position.set(0, 100, 0); 
  group.add(topLight);
  group.add(topLight.target);
  topLight.target.position.set(0, 0, 0); // 카메라 중심을 비춤

  // 2. 카메라 우측 상단 뒤쪽에서 오는 핑크빛
  const pinkWash = new THREE.DirectionalLight("#ffccff", 0.4);
  pinkWash.position.set(50, 50, 50);
  group.add(pinkWash);
  group.add(pinkWash.target);
  pinkWash.target.position.set(0, 0, 0);

  // 3. 카메라 좌측 상단 뒤쪽에서 오는 청록빛
  const cyanWash = new THREE.DirectionalLight("#ccffff", 0.4);
  cyanWash.position.set(-50, 50, 50);
  group.add(cyanWash);
  group.add(cyanWash.target);
  cyanWash.target.position.set(0, 0, 0);

  // 4. 카메라 정후면 상단에서 오는 보랏빛
  const purpleWash = new THREE.DirectionalLight("#e8d6ff", 0.3);
  purpleWash.position.set(0, 50, 100);
  group.add(purpleWash);
  group.add(purpleWash.target);
  purpleWash.target.position.set(0, 0, 0);

  return group;
}

export function getLandscape() {
  return terrain;
}

export function disposeLandscape() {
  if (!terrain || disposed) return;
  disposed = true;
  terrain.geometry.dispose();
  if (terrain.material.map) terrain.material.map.dispose();
  if (terrain.material.displacementMap)
    terrain.material.displacementMap.dispose();
  terrain.material.dispose();
}
