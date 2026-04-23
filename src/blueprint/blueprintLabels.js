import * as THREE from "three";

const SVG_NS = "http://www.w3.org/2000/svg";

let host = null;
let svgEl = null;
let labels = [];

function svg(tag, attrs) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

export function initLabels(hostEl) {
  host = hostEl;
  if (!host) return;
  if (svgEl) svgEl.remove();
  svgEl = svg("svg", {
    class: "bp-labels-svg",
    preserveAspectRatio: "none",
  });
  host.appendChild(svgEl);
}

export function setFocusLabels(anchors) {
  clearLabels();
  if (!host) return;
  anchors.forEach((a, i) => {
    const div = document.createElement("div");
    div.className = "bp-label";
    div.innerHTML = `
      <div class="bp-label-head">${a.head}</div>
      ${a.lines.map((l) => `<div class="bp-label-line">${l}</div>`).join("")}
    `;
    host.appendChild(div);

    const poly = svg("polyline", {
      fill: "none",
      stroke: "#ffffff",
      "stroke-width": "1",
      "stroke-opacity": "0.85",
    });
    svgEl.appendChild(poly);

    labels.push({
      div,
      poly,
      anchorWorld: a.anchorWorld.clone(),
      offset: a.offset || { x: 0, y: 0 },
      side: a.side || "right",
    });
  });
}

export function clearLabels() {
  labels.forEach((l) => {
    l.div.remove();
    l.poly.remove();
  });
  labels = [];
}

const _v = new THREE.Vector3();

export function updateLabels(camera, w, h, opacity = 1) {
  if (!host || !svgEl) return;
  svgEl.setAttribute("width", String(w));
  svgEl.setAttribute("height", String(h));
  svgEl.setAttribute("viewBox", `0 0 ${w} ${h}`);

  for (const l of labels) {
    _v.copy(l.anchorWorld).project(camera);
    if (_v.z > 1 || _v.z < -1) {
      l.div.style.display = "none";
      l.poly.setAttribute("points", "");
      continue;
    }
    const ax = (_v.x * 0.5 + 0.5) * w;
    const ay = (-_v.y * 0.5 + 0.5) * h;

    const ox = l.side === "right" ? ax + 80 + l.offset.x : ax - 220 + l.offset.x;
    const oy = ay + l.offset.y;

    l.div.style.display = "block";
    l.div.style.opacity = String(opacity);
    l.div.style.transform = `translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px)`;

    // polyline: from label edge to anchor
    const rect = l.div.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    const edgeX = l.side === "right" ? rect.left - hostRect.left : rect.right - hostRect.left;
    const edgeY = rect.top - hostRect.top + rect.height * 0.5;
    const midX = (edgeX + ax) * 0.5;
    l.poly.setAttribute(
      "points",
      `${edgeX.toFixed(1)},${edgeY.toFixed(1)} ${midX.toFixed(1)},${edgeY.toFixed(1)} ${midX.toFixed(1)},${ay.toFixed(1)} ${ax.toFixed(1)},${ay.toFixed(1)}`,
    );
    l.poly.setAttribute("stroke-opacity", String(0.85 * opacity));
  }
}

export function setLabelsVisible(v) {
  if (host) host.style.display = v ? "block" : "none";
}
