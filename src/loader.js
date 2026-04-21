import * as THREE from "three";

export function loadTextures() {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    const textures = {};
    let loaded = 0;

    const paths = [
      ["/ring.png", "ringTexture", true],
      ["/model/sphere/sphere-albedo.webp", "sphereAlbedo", true],
      ["/model/sphere/sphere-normal.webp", "sphereNormal", false],
      ["/model/sphere/sphere-roughness.webp", "sphereRoughness", false],
    ];
    const total = paths.length;

    const onLoad = (key, sRGB) => (texture) => {
      if (sRGB) texture.colorSpace = THREE.SRGBColorSpace;
      textures[key] = texture;
      loaded++;
      if (loaded === total) resolve(textures);
    };

    paths.forEach(([url, key, sRGB]) =>
      loader.load(url, onLoad(key, sRGB), undefined, reject),
    );
  });
}
