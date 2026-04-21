import * as THREE from "three";

export function createSpores() {
  const count = 5000;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const color = new Float32Array(count * 3);
  const offsets = new Float32Array(count);

  const palette = [
    new THREE.Color("#ffffff"), 
    new THREE.Color("#ffccff"),
    new THREE.Color("#ccffff"), 
  ];

  for (let i = 0; i < count; i++) {
    // Spread spores across the landscape area
    pos[i * 3 + 0] = (Math.random() - 0.5) * 20;
    pos[i * 3 + 1] = Math.random() * 2; // Floating low to ground
    pos[i * 3 + 2] = (Math.random() - 0.5) * 20;

    const col = palette[Math.floor(Math.random() * palette.length)];
    color[i * 3 + 0] = col.r;
    color[i * 3 + 1] = col.g;
    color[i * 3 + 2] = col.b;

    offsets[i] = Math.random() * Math.PI * 2;
  }

  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(color, 3));
  geo.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexShader: `
      uniform float uTime;
      uniform float uOpacity;
      attribute vec3 color;
      attribute float aOffset;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = color;
        vec3 p = position;
        
        // Gentle organic float (Brownian-ish)
        p.x += sin(uTime * 0.3 + aOffset) * 0.2;
        p.y += cos(uTime * 0.5 + aOffset) * 0.1;
        p.z += sin(uTime * 0.4 + aOffset) * 0.2;

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (2.0 + sin(uTime + aOffset)) * (20.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;

        vAlpha = uOpacity * (0.4 + 0.6 * sin(uTime * 0.5 + aOffset));
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float glow = pow(1.0 - d * 2.0, 2.0);
        gl_FragColor = vec4(vColor, glow * vAlpha);
      }
    `
  });

  return new THREE.Points(geo, mat);
}

export function updateSpores(spores, delta, progress) {
  if (!spores) return;
  spores.material.uniforms.uTime.value += delta;
  
  // Fade in spores during arrival
  const sporeAlpha = Math.max(0, (progress - 0.9) / 0.1); 
  spores.material.uniforms.uOpacity.value = sporeAlpha;
  spores.visible = sporeAlpha > 0;
}
