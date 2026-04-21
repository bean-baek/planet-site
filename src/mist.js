import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  // Simple noise function
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 p = vUv * 3.0;
    float n = noise(p + uTime * 0.1);
    
    // Create soft rolling mist effect
    float alpha = smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.5, vUv.y);
    alpha *= (0.3 + 0.7 * sin(vUv.x * 10.0 + uTime * 0.5) * cos(vUv.y * 5.0 + uTime * 0.2));
    
    vec3 color = vec3(0.8, 0.9, 1.0); // Soft grey-teal mist
    gl_FragColor = vec4(color, alpha * uOpacity * 0.4);
  }
`;

let mistMesh = null;

export function createMist() {
  const geo = new THREE.PlaneGeometry(30, 10, 1, 1);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  mistMesh = new THREE.Mesh(geo, mat);
  mistMesh.rotation.x = -Math.PI / 2.1; // Slightly tilted up from floor
  mistMesh.position.y = -0.3; // Floating just above ground
  mistMesh.visible = false;
  
  return mistMesh;
}

export function updateMist(delta, progress) {
  if (!mistMesh) return;
  mistMesh.material.uniforms.uTime.value += delta;
  
  // Only show during landscape transition/arrival
  const mistAlpha = Math.max(0, (progress - 0.8) / 0.2); // Fade in at the very end
  mistMesh.material.uniforms.uOpacity.value = mistAlpha;
  mistMesh.visible = mistAlpha > 0;
}
