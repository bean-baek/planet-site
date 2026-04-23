const MENU_ITEMS = [
  { id: "PROJECT_ALPHA", label: "PROJECT_ALPHA", kind: "planet" },
  { id: "PROJECT_BETA", label: "PROJECT_BETA", kind: "planet" },
  { id: "SENSOR_GRID", label: "SENSOR_GRID", kind: "panel" },
  { id: "SYSTEM_LOG", label: "SYSTEM_LOG", kind: "panel" },
];

const DEFAULT_DATA_PANE_HTML = `
  <div class="bp-pane-title">SYSTEM_SCHEMATIC</div>
  <div class="bp-pane-block">
    <div class="bp-kv"><span>ENGINE.ID</span><b>CE.v0.1a_DEV</b></div>
    <div class="bp-kv"><span>BUILD</span><b>2026.04.22</b></div>
    <div class="bp-kv"><span>ORBIT.COUNT</span><b>32</b></div>
    <div class="bp-kv"><span>NODE.ACTIVE</span><b id="bp-active-node">—</b></div>
  </div>
  <div class="bp-pane-title">LIVE_METRICS</div>
  <div class="bp-graphs" id="bp-graphs"></div>
  <div class="bp-pane-title">STREAM</div>
  <div class="bp-pane-code" id="bp-stream">
    <div>system.boot: OK</div>
    <div>module.orbital = load()</div>
    <div>module.iris = attach("ALPHA")</div>
    <div>gate.standby = true</div>
  </div>
`;

const SENSOR_PANE_HTML = `
  <div class="bp-pane-title">SENSOR_GRID</div>
  <div class="bp-pane-block">
    <div class="bp-kv"><span>S.01 thermal</span><b>213.4K</b></div>
    <div class="bp-kv"><span>S.02 mag_flux</span><b>0.047T</b></div>
    <div class="bp-kv"><span>S.03 particle</span><b>2.1k/s</b></div>
    <div class="bp-kv"><span>S.04 rf_noise</span><b>-112dBm</b></div>
    <div class="bp-kv"><span>S.05 vibration</span><b>0.002g</b></div>
    <div class="bp-kv"><span>S.06 pressure</span><b>0.00Pa</b></div>
    <div class="bp-kv"><span>S.07 gamma</span><b>44cps</b></div>
    <div class="bp-kv"><span>S.08 uv_band</span><b>λ=280nm</b></div>
  </div>
  <div class="bp-pane-title">ARRAY.STATUS</div>
  <div class="bp-pane-code">
    <div>array.nodes = 8/8 online</div>
    <div>telemetry.rate = 120hz</div>
    <div>sync.drift = 0.0002s</div>
  </div>
`;

const LOG_LINES = [
  "[T+00:00.12] boot.complete",
  "[T+00:02.41] orbit.system.ready",
  "[T+00:04.08] iris.ALPHA.mounted",
  "[T+00:06.73] iris.BETA.mounted",
  "[T+00:09.55] sensor.grid.online",
  "[T+00:11.20] gate.standby engaged",
  "[T+00:14.91] calib.drift(-0.0004)",
  "[T+00:19.04] node.sensor_04 ping",
  "[T+00:22.80] ring.spin.sync ok",
  "[T+00:27.33] anno.layer render",
  "[T+00:31.77] user.session init",
];

const LOG_PANE_HTML = `
  <div class="bp-pane-title">SYSTEM_LOG</div>
  <div class="bp-pane-log" id="bp-log">
    ${LOG_LINES.map((l) => `<div>${l}</div>`).join("")}
  </div>
`;

let root = null;
let leftCol = null;
let rightPanel = null;
let menuEls = {};
let callbacks = {};

export function mountBlueprintUI({ onMenuClick, onExploreClick, onNodeHoverChange } = {}) {
  callbacks = { onMenuClick, onExploreClick, onNodeHoverChange };
  if (root) return root;
  root = document.createElement("div");
  root.id = "blueprint-root";
  root.className = "bp-root";

  // Left column
  leftCol = document.createElement("div");
  leftCol.className = "bp-left-col";
  leftCol.innerHTML = `
    <div class="bp-title-block">
      <div class="bp-title-main">CELESTIAL_ENGINE</div>
      <div class="bp-title-sub">v0.1a_DEV</div>
    </div>
    <div class="bp-menu"></div>
    <div class="bp-footer">
      <div>© CE.LABS / 2026</div>
      <div>node: earth-side</div>
    </div>
  `;
  const menuHost = leftCol.querySelector(".bp-menu");
  MENU_ITEMS.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "bp-menu-btn";
    btn.dataset.id = item.id;
    btn.dataset.kind = item.kind;
    btn.innerHTML = `
      <span class="bp-menu-bullet">//</span>
      <span class="bp-menu-label">${item.label}</span>
      <span class="bp-menu-meta">${item.kind === "planet" ? "› fly" : "› view"}</span>
    `;
    btn.addEventListener("click", () => {
      btn.classList.add("is-clicked");
      setTimeout(() => btn.classList.remove("is-clicked"), 420);
      callbacks.onMenuClick?.(item);
    });
    menuHost.appendChild(btn);
    menuEls[item.id] = btn;
  });
  root.appendChild(leftCol);

  // Right panel
  rightPanel = document.createElement("div");
  rightPanel.className = "bp-right-panel";
  rightPanel.innerHTML = `
    <div class="bp-panel-head">
      <div class="bp-panel-head-main">DATA_PANEL</div>
      <div class="bp-panel-head-sub" id="bp-panel-sub">/ default</div>
    </div>
    <div class="bp-panel-body" id="bp-panel-body">${DEFAULT_DATA_PANE_HTML}</div>
  `;
  root.appendChild(rightPanel);

  // Planet interaction hint (shown in focus mode)
  const planetHint = document.createElement("div");
  planetHint.className = "bp-planet-hint";
  planetHint.id = "bp-planet-hint";
  planetHint.textContent = "click planet · click to exit";
  root.appendChild(planetHint);

  // Label layer (for tethered focus labels)
  const labelLayer = document.createElement("div");
  labelLayer.className = "bp-labels-layer";
  labelLayer.id = "bp-labels-layer";
  root.appendChild(labelLayer);

  document.body.appendChild(root);
  return root;
}

export function unmountBlueprintUI() {
  if (!root) return;
  root.remove();
  root = null;
  menuEls = {};
}

export function setRightPane(kind) {
  if (!rightPanel) return;
  const body = rightPanel.querySelector("#bp-panel-body");
  const sub = rightPanel.querySelector("#bp-panel-sub");
  if (kind === "sensor") {
    body.innerHTML = SENSOR_PANE_HTML;
    sub.textContent = "/ sensor_grid";
  } else if (kind === "log") {
    body.innerHTML = LOG_PANE_HTML;
    sub.textContent = "/ system_log";
  } else {
    body.innerHTML = DEFAULT_DATA_PANE_HTML;
    sub.textContent = "/ default";
  }
  return body;
}

export function updateFocusPanel(nodeId) {
  if (!rightPanel) return;
  const body = rightPanel.querySelector("#bp-panel-body");
  const sub = rightPanel.querySelector("#bp-panel-sub");
  sub.textContent = `/ ${nodeId.toLowerCase()}`;
  body.innerHTML = `
    <div class="bp-pane-title">${nodeId}: DETAILED CORE MECHANICS</div>
    <div class="bp-pane-block">
      <div class="bp-kv"><span>ORBITAL_STABILITY</span><b>99.1%</b></div>
      <div class="bp-kv"><span>CORE_TEMP</span><b>${(280 + Math.random() * 40).toFixed(1)}K</b></div>
      <div class="bp-kv"><span>MASS</span><b>${(4.2 + Math.random() * 0.8).toFixed(3)}e24 kg</b></div>
      <div class="bp-kv"><span>ORBIT.R</span><b>120km</b></div>
    </div>
    <div class="bp-pane-title">LIVE_METRICS</div>
    <div class="bp-graphs" id="bp-graphs"></div>
    <div class="bp-pane-title">CORE_OPS</div>
    <div class="bp-pane-code">
      <div>vector_A = calc_orbit(r_core, mass_core)</div>
      <div>system.core_ops: <b style="color:#bfe6ff">ACTIVE</b></div>
      <div>integrity = calc_integrity(${nodeId.toLowerCase()}_core)</div>
      <div>// streaming…</div>
    </div>
  `;
  // mark active menu
  Object.values(menuEls).forEach((b) => b.classList.remove("is-active"));
  if (menuEls[nodeId]) menuEls[nodeId].classList.add("is-active");
  return body;
}

export function clearFocusPanel() {
  Object.values(menuEls).forEach((b) => b.classList.remove("is-active"));
  setRightPane("default");
}

export function getLabelLayer() {
  return document.getElementById("bp-labels-layer");
}

export function setPlanetHintVisible(v) {
  const el = document.getElementById("bp-planet-hint");
  if (el) el.classList.toggle("visible", v);
}

export function setUIVisible(v) {
  if (root) root.style.display = v ? "block" : "none";
}

export function setUIOpacity(o) {
  if (root) root.style.opacity = String(o);
}
