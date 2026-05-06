import * as THREE from "three";

export const BLUEPRINT_IDLE = "BLUEPRINT_IDLE";
export const BLUEPRINT_FOCUS = "BLUEPRINT_FOCUS";
export const BLUEPRINT_TO_IRIDESCENT = "BLUEPRINT_TO_IRIDESCENT";
export const IRIDESCENT = "IRIDESCENT";

const FOCUS_DAMP = 5;
const DISSOLVE_DURATION = 1.6;

let mode = BLUEPRINT_IDLE;
let focusTarget = null;
let focusProgress = 0;
let rawFocus = 0;
let dissolveProgress = 0;
let dissolveElapsed = 0;
const listeners = new Set();

export function getMode() {
  return mode;
}

export function getFocusTarget() {
  return focusTarget;
}

export function getFocusProgress() {
  return focusProgress;
}

export function getDissolveProgress() {
  return dissolveProgress;
}

export function onModeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(prev, next) {
  for (const fn of listeners) fn(next, prev);
}

export function setMode(next, options = {}) {
  if (next === mode) return;
  const prev = mode;
  mode = next;

  if (next === BLUEPRINT_IDLE) {
    focusTarget = null;
    rawFocus = 0;
    // focusProgress damps to 0 naturally via updateMode — don't snap it
  } else if (next === BLUEPRINT_FOCUS) {
    focusTarget = options.target || null;
    rawFocus = 1;
  } else if (next === BLUEPRINT_TO_IRIDESCENT) {
    dissolveElapsed = 0;
    dissolveProgress = 0;
  } else if (next === IRIDESCENT) {
    dissolveProgress = 1;
    focusProgress = 0;
    rawFocus = 0;
    focusTarget = null;
  }

  emit(prev, next);
}

export function updateMode(delta) {
  if (mode === BLUEPRINT_IDLE || mode === BLUEPRINT_FOCUS) {
    focusProgress = THREE.MathUtils.damp(focusProgress, rawFocus, FOCUS_DAMP, delta);
    if (focusProgress < 0.001) focusProgress = 0;
    if (focusProgress > 0.999) focusProgress = 1;
  } else if (mode === BLUEPRINT_TO_IRIDESCENT) {
    dissolveElapsed += delta;
    const t = Math.min(dissolveElapsed / DISSOLVE_DURATION, 1);
    dissolveProgress = THREE.MathUtils.smoothstep(t, 0, 1);
    if (dissolveProgress >= 1) {
      setMode(IRIDESCENT);
    }
  }
}

export function resetBlueprintFocus() {
  if (mode === BLUEPRINT_FOCUS) {
    rawFocus = 0;
    setMode(BLUEPRINT_IDLE);
  }
}

// Hard reset — call before re-entering blueprint from iridescent
export function resetModeState() {
  mode = BLUEPRINT_IDLE;
  focusTarget = null;
  focusProgress = 0;
  rawFocus = 0;
  dissolveProgress = 0;
  dissolveElapsed = 0;
  listeners.clear();
}
