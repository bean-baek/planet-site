const GRAPH_LEN = 120;

const METRICS = [
  { key: "camDist", label: "CAM.DIST", min: 1, max: 6 },
  { key: "orbitPhase", label: "ORB.PHASE", min: 0, max: 1 },
  { key: "frameTime", label: "FRAME.MS", min: 0, max: 33 },
  { key: "bloomStrength", label: "BLOOM", min: 0, max: 2 },
];

let graphState = null;

function svg(tag, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

export function mountGraphs(container) {
  if (!container) return null;
  container.innerHTML = "";
  graphState = { metrics: {}, container };

  for (const m of METRICS) {
    const wrap = document.createElement("div");
    wrap.className = "bp-graph";
    wrap.innerHTML = `
      <div class="bp-graph-head">
        <span class="bp-graph-label">${m.label}</span>
        <span class="bp-graph-value" data-key="${m.key}">—</span>
      </div>
    `;
    const svgEl = svg("svg", { viewBox: "0 0 120 30", preserveAspectRatio: "none" });
    const baseline = svg("line", {
      x1: 0, y1: 29, x2: 120, y2: 29,
      stroke: "rgba(255,255,255,0.15)", "stroke-width": "0.5",
    });
    const poly = svg("polyline", {
      fill: "none",
      stroke: "#ffffff",
      "stroke-width": "0.9",
      "stroke-linejoin": "round",
    });
    svgEl.appendChild(baseline);
    svgEl.appendChild(poly);
    wrap.appendChild(svgEl);
    container.appendChild(wrap);

    graphState.metrics[m.key] = {
      cfg: m,
      buf: new Float32Array(GRAPH_LEN),
      head: 0,
      count: 0,
      poly,
      valueEl: wrap.querySelector(`.bp-graph-value[data-key="${m.key}"]`),
    };
  }
  return graphState;
}

export function pushSample(key, v) {
  if (!graphState) return;
  const g = graphState.metrics[key];
  if (!g) return;
  g.buf[g.head] = v;
  g.head = (g.head + 1) % GRAPH_LEN;
  if (g.count < GRAPH_LEN) g.count++;
}

export function renderGraphs() {
  if (!graphState) return;
  for (const key in graphState.metrics) {
    const g = graphState.metrics[key];
    const { min, max } = g.cfg;
    const count = g.count;
    if (count === 0) continue;

    const parts = [];
    // iterate oldest → newest for left-to-right drawing
    const start = (g.head - count + GRAPH_LEN) % GRAPH_LEN;
    for (let i = 0; i < count; i++) {
      const idx = (start + i) % GRAPH_LEN;
      const vRaw = g.buf[idx];
      const tClamp = Math.max(0, Math.min(1, (vRaw - min) / (max - min)));
      const x = (i / (GRAPH_LEN - 1)) * 120;
      const y = 29 - tClamp * 28;
      parts.push(x.toFixed(1) + "," + y.toFixed(1));
    }
    g.poly.setAttribute("points", parts.join(" "));
    const last = g.buf[(g.head - 1 + GRAPH_LEN) % GRAPH_LEN];
    if (g.valueEl) g.valueEl.textContent = last.toFixed(2);
  }
}

export function resetGraphs() {
  graphState = null;
}

export function ensureGraphsInDOM() {
  const host = document.getElementById("bp-graphs");
  if (host && !host.firstChild) mountGraphs(host);
  else if (host && !graphState) mountGraphs(host);
}
