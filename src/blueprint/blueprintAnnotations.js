import * as THREE from "three";

const ANNOTATION_TEXTS = [
  "ACCEL_VOLT: 1.2MV",
  "LAT: 47.22°N",
  "T+00:47:12",
  "arc.k=0.47",
  "ω=2π/T",
  "n_04",
  "CH.22",
  "λ=589.3nm",
  "ORB.SYNC",
  "d_r=0.113",
  "sys.ok",
  "flux:0.82",
  "Δθ=0.047rad",
  "ε=0.0167",
  "v_esc=11.2",
  "ref.J2000",
  "axis:+Z",
  "calc.drift",
  "PH.B1",
  "ENCODE=64k",
  "seg_a7",
  "gate.open",
  "χ²=1.04",
  "dv=3.2m/s",
  "T_half=1.4h",
];

let container = null;
let annotations = [];

export function mountAnnotationLayer(parent = document.body) {
  if (container) return container;
  container = document.createElement("div");
  container.className = "bp-annotations";
  parent.appendChild(container);
  return container;
}

export function unmountAnnotationLayer() {
  if (!container) return;
  container.remove();
  container = null;
  annotations = [];
}

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function buildAnnotations({ beams, nodes }) {
  if (!container) mountAnnotationLayer();
  container.innerHTML = "";
  annotations = [];

  const rand = seeded(7);
  let textIdx = 0;
  const pickText = () => ANNOTATION_TEXTS[textIdx++ % ANNOTATION_TEXTS.length];

  // Beam-face annotations — 2-3 labels per beam using pre-computed world positions
  if (beams) {
    beams.children.forEach((beam) => {
      const anchors = beam.userData.dataAnchors || [];
      anchors.forEach((local) => {
        const world = local.clone();
        beam.localToWorld(world);
        addAnnotation(world, pickText(), 0.55);
      });
    });
  }

  // Near-node annotations — one label offset from each node
  if (nodes) {
    nodes.forEach((node) => {
      const rand2 = seeded(textIdx * 13);
      const p = node.position.clone().add(
        new THREE.Vector3((rand2() - 0.5) * 0.5, 0.25 + rand2() * 0.2, 0),
      );
      addAnnotation(p, pickText(), 0.5);
    });
  }

  // Scattered annotations in the orbital zone (static positions)
  const scatterCount = 10;
  for (let i = 0; i < scatterCount; i++) {
    const angle = (i / scatterCount) * Math.PI * 2;
    const r = 1.3 + rand() * 1.8;
    const p = new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, (rand() - 0.5) * 0.3);
    addAnnotation(p, pickText(), 0.3 + rand() * 0.2);
  }
}

function addAnnotation(worldPos, text, opacity) {
  const el = document.createElement("div");
  el.className = "bp-anno";
  el.textContent = text;
  el.style.opacity = String(opacity);
  container.appendChild(el);
  annotations.push({ el, worldPos: worldPos.clone(), baseOpacity: opacity });
}

const _v = new THREE.Vector3();

export function updateAnnotations(camera, w, h, globalOpacity = 1, panelMarginPx = 0) {
  if (!container) return;
  const rightEdge = w - panelMarginPx;
  for (const a of annotations) {
    _v.copy(a.worldPos).project(camera);
    if (_v.z > 1 || _v.z < -1) {
      a.el.style.display = "none";
      continue;
    }
    const px = (_v.x * 0.5 + 0.5) * w;
    const py = (-_v.y * 0.5 + 0.5) * h;
    // Hide annotations that fall inside the left or right panel columns
    if (panelMarginPx > 0 && (px < panelMarginPx || px > rightEdge)) {
      a.el.style.display = "none";
      continue;
    }
    a.el.style.display = "block";
    a.el.style.transform = `translate(${px.toFixed(1)}px,${py.toFixed(1)}px)`;
    a.el.style.opacity = String((a.baseOpacity * globalOpacity).toFixed(3));
  }
}

export function setAnnotationsVisible(v) {
  if (container) container.style.display = v ? "block" : "none";
}
