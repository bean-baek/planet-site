import * as THREE from "three";

export function loadTextures() {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    const textures = {};
    let loaded = 0;

    const onLoad = (key) => (texture) => {
      textures[key] = texture;
      loaded++;
      if (loaded === 2) resolve(textures);
    };

    loader.load("/mapping.png", onLoad("planetTexture"), undefined, reject);
    loader.load("/ring.png", onLoad("ringTexture"), undefined, reject);
  });
}
