const TITLEBAR_H = 34;
const STATUSBAR_H = 32;

let hudEl = null;
let _isFullscreen = false;
let _onResizeCb = null;
let _winDims = null;

function glyphSvg(kind) {
  const h = 6, r = 5;
  switch (kind) {
    case "triangle": {
      const pts = Array.from({ length: 3 }, (_, i) => {
        const a = -Math.PI / 2 + (i / 3) * Math.PI * 2;
        return `${(h + Math.cos(a) * r).toFixed(1)},${(h + Math.sin(a) * r).toFixed(1)}`;
      }).join(" ");
      return `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><polygon points="${pts}"/></svg>`;
    }
    case "diamond":
      return `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><polygon points="6,1 11,6 6,11 1,6"/></svg>`;
    case "hex": {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return `${(h + Math.cos(a) * r).toFixed(1)},${(h + Math.sin(a) * r).toFixed(1)}`;
      }).join(" ");
      return `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><polygon points="${pts}"/></svg>`;
    }
    case "plus":
      return `<svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" stroke-width="1.2"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>`;
    default:
      return `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="6" cy="6" r="5"/><circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none"/></svg>`;
  }
}

function _contentRect(winDims, fullscreen) {
  if (fullscreen || !winDims) {
    return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
  }
  return {
    left:   winDims.l,
    top:    winDims.t + TITLEBAR_H,
    width:  winDims.w,
    height: winDims.h - TITLEBAR_H - STATUSBAR_H,
  };
}

export function mountIridescentHud(disc, onBack, options = {}) {
  unmountIridescentHud();
  _isFullscreen = false;
  _onResizeCb   = options.onResize ?? null;
  _winDims      = options.winDims  ?? null;

  const label  = disc.userData.planetLabel  ?? "PLANET";
  const glyph  = disc.userData.planetGlyph  ?? "ring-dot";
  const orbitR = disc.userData.planetOrbitR ?? "—";
  const speed  = disc.userData.planetSpeed  ?? "—";

  hudEl = document.createElement("div");
  hudEl.className = "bp-iri-window";

  if (_winDims) {
    Object.assign(hudEl.style, {
      top:    _winDims.t + "px",
      left:   _winDims.l + "px",
      width:  _winDims.w + "px",
      height: _winDims.h + "px",
    });
  }

  hudEl.innerHTML = `
    <div class="bp-iri-titlebar">
      <span class="bp-iri-titlebar-glyph">${glyphSvg(glyph)}</span>
      <span class="bp-iri-titlebar-name">${label}</span>
      <span class="bp-iri-titlebar-sep">//</span>
      <span class="bp-iri-titlebar-sub">IRIDESCENT_VIEW</span>
      <span class="bp-iri-titlebar-meta">ORBITAL.R&nbsp;${orbitR}&nbsp;AU&nbsp;&nbsp;SPEED&nbsp;${speed}&nbsp;&omega;</span>
      <button class="bp-iri-titlebar-fs" aria-label="fullscreen">⤢</button>
      <button class="bp-iri-titlebar-close" aria-label="back">✕</button>
    </div>
    <i class="bp-iri-corner tl"></i>
    <i class="bp-iri-corner tr"></i>
    <i class="bp-iri-corner bl"></i>
    <i class="bp-iri-corner br"></i>
    <div class="bp-iri-statusbar">DRAG ORBIT &nbsp;·&nbsp; SCROLL ZOOM &nbsp;·&nbsp; ARROWS MOVE</div>
  `;
  document.body.appendChild(hudEl);

  const fsBtn = hudEl.querySelector(".bp-iri-titlebar-fs");
  fsBtn.addEventListener("click", () => {
    _isFullscreen = !_isFullscreen;
    hudEl.classList.toggle("is-fullscreen", _isFullscreen);

    if (_isFullscreen) {
      Object.assign(hudEl.style, { top: "0", left: "0", width: "100vw", height: "100vh" });
      fsBtn.textContent = "⤡";
    } else {
      if (_winDims) {
        Object.assign(hudEl.style, {
          top:    _winDims.t + "px",
          left:   _winDims.l + "px",
          width:  _winDims.w + "px",
          height: _winDims.h + "px",
        });
      }
      fsBtn.textContent = "⤢";
    }

    if (_onResizeCb) _onResizeCb(_contentRect(_winDims, _isFullscreen));
  });

  hudEl.querySelector(".bp-iri-titlebar-close").addEventListener("click", () => {
    unmountIridescentHud();
    onBack();
  });
}

export function unmountIridescentHud() {
  if (!hudEl) return;
  hudEl.remove();
  hudEl = null;
  _isFullscreen = false;
  _onResizeCb   = null;
  _winDims      = null;
}
