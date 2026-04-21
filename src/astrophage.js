import * as THREE from "three";

export function createAstrophage() {
  const count = 70000;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const color = new Float32Array(count * 3);

  const palette = [
    new THREE.Color("#ffffff"), new THREE.Color("#ffccff"),
    new THREE.Color("#ccffff"), new THREE.Color("#fff2cc"),
  ];

  for (let i = 0; i < count; i++) {
    pos[i * 3 + 0] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;

    const col = palette[Math.floor(Math.random() * palette.length)];
    color[i * 3 + 0] = col.r;
    color[i * 3 + 1] = col.g;
    color[i * 3 + 2] = col.b;
  }

  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(color, 3));

  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uProgress: { value: 0 } },
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    vertexShader: `
      uniform float uTime;
      uniform float uProgress;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = color;
        vec3 p = position;
        
        // 정면 흐름
        p.z += uProgress * 25.0;
        p.z = mod(p.z + 10.0, 20.0) - 10.0;

        // [핵심] 통과 연출: 0.85 지점부터 입자들이 사방으로 터져나가며 시야를 비움 (더 snappy하게)
        if (uProgress > 0.85) {
          float burst = smoothstep(0.85, 1.0, uProgress);
          p.xy *= (1.0 + burst * 50.0);
          p.z -= burst * 20.0;
        }

        p.x += sin(uTime * 0.5 + position.z) * 0.1;
        p.y += cos(uTime * 0.5 + position.x) * 0.1;

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (2.5 + sin(uTime * 2.0 + position.y)) * (25.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;

        // [핵심] 폭발 시작(0.85)과 함께 매우 빠르게 소멸하여 0.98에 완벽 제거
        vAlpha = smoothstep(0.0, 0.1, uProgress) * (1.0 - smoothstep(0.85, 0.98, uProgress));
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float glow = pow(1.0 - d * 2.0, 2.0);
        gl_FragColor = vec4(vColor, glow * vAlpha * 0.8);
      }
    `
  });

  return new THREE.Points(geo, mat);
}
