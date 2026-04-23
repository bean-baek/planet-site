# 트러블슈팅: Blueprint 랜딩 레이어 및 인터랙션 시스템

이 문서는 Blueprint 랜딩 레이어와 브루탈리즘 행성 창을 개발하며 마주한 주요 기술적 문제들과 그 해결 과정을 기록합니다. 후속 개발 및 유지보수 시 이 문서를 참고하여 동일한 실수를 방지하고 설계 의도를 파악하시기 바랍니다.

---

## 목차

1. [Blueprint → Iridescent 전환 시 블랙 화면 고착](#1-blueprint--iridescent-전환-시-블랙-화면-고착)
2. [modeState 미초기화로 Blueprint 재진입 시 완전 먹통](#2-modestate-미초기화로-blueprint-재진입-시-완전-먹통)
3. [Inner Disc Raycast 우선 충돌로 행성 클릭 무반응](#3-inner-disc-raycast-우선-충돌로-행성-클릭-무반응)
4. [Planet Window 클릭 이벤트 하위 캔버스까지 전파](#4-planet-window-클릭-이벤트-하위-캔버스까지-전파)
5. [canvas 클릭 콜백 null 참조로 씬 전환 불발](#5-canvas-클릭-콜백-null-참조로-씬-전환-불발)
6. [focusProgress 즉시 리셋으로 포커스 해제 시 스냅 발생](#6-focusprogress-즉시-리셋으로-포커스-해제-시-스냅-발생)
7. [landscapeCreated 플래그 미초기화로 지형 재생성 실패](#7-landscapecreated-플래그-미초기화로-지형-재생성-실패)
8. [animate() 재호출 시 lastTime 오염으로 첫 프레임 delta 폭발](#8-animate-재호출-시-lasttime-오염으로-첫-프레임-delta-폭발)
9. [Iridescent 복귀 후 controls 잔여 상태로 줌/카메라 오작동](#9-iridescent-복귀-후-controls-잔여-상태로-줌카메라-오작동)
10. [resize 리스너 중복 등록](#10-resize-리스너-중복-등록)

---

## 1. Blueprint → Iridescent 전환 시 블랙 화면 고착

### 현상
브루탈리즘 창의 mini canvas를 클릭하면 검은 화면만 보이고 이리데슨트 씬이 나타나지 않음.

### 원인
`stopBlueprint()`에서 `overlayEl = null`로 변수만 해제했을 뿐, DOM에서 `#bp-overlay` div를 제거하지 않았음. 전환 애니메이션이 끝나 opacity=1이 된 블랙 오버레이가 화면을 덮은 채 이리데슨트 씬이 뒤에서 렌더링됨.

### 해결
`stopBlueprint()` 내 `overlayEl = null` 직전에 `overlayEl?.remove()` 추가. 동시에 `startBlueprint()` 재진입 시 기존 `#bp-overlay`가 남아있을 경우를 대비해 `document.getElementById("bp-overlay")?.remove()`로 선제 정리.

---

## 2. modeState 미초기화로 Blueprint 재진입 시 완전 먹통

### 현상
Iridescent에서 최대 줌아웃으로 Blueprint로 돌아왔을 때, iris 클릭·행성 hover 등 모든 인터랙션이 동작하지 않음.

### 원인
`modeState.js`의 `mode` 변수가 모듈 레벨 싱글턴이라 `IRIDESCENT` 상태가 유지됨. `startBlueprint()` 재호출 시 루프는 돌지만 `getMode()`가 `IRIDESCENT`를 반환하므로 `onClick`/`onMouseMove` 핸들러의 모든 조건 분기가 통과되지 않음.

### 해결
`modeState.js`에 `resetModeState()` 함수를 추가해 모든 상태 변수를 초기값으로 강제 리셋. `startBlueprint()` 최상단에서 호출하여 이전 세션 잔여 상태를 완전히 제거.

```javascript
export function resetModeState() {
  mode = BLUEPRINT_IDLE;
  focusTarget = null;
  focusProgress = 0;
  rawFocus = 0;
  dissolveProgress = 0;
  dissolveElapsed = 0;
}
```

---

## 3. Inner Disc Raycast 우선 충돌로 행성 클릭 무반응

### 현상
hover 시 나타나는 색상 원(inner disc)이 보이는 상태에서 클릭해도 아무 반응이 없음.

### 원인
inner disc(`isInnerDisc: true`)가 outer disc(`isPlanet: true`) 앞에 z=0.001로 배치되어 raycast hit에서 항상 먼저 감지됨. 그러나 `onClick`/`onMouseMove`가 `obj.userData.isPlanet` 여부만 확인해 inner disc 클릭을 무시.

### 해결
hit된 오브젝트가 `isInnerDisc`일 경우, 동일 pivot의 자식 중 `isPlanet: true`인 outer disc로 정규화:

```javascript
if (obj.userData.isInnerDisc) {
  obj = obj.parent?.children.find((c) => c.userData.isPlanet) ?? obj;
}
```

`onMouseMove`와 `onClick` 두 핸들러 모두에 동일하게 적용.

---

## 4. Planet Window 클릭 이벤트 하위 캔버스까지 전파

### 현상
브루탈리즘 창의 backdrop 또는 mini canvas를 클릭하면 창이 닫히는 동시에 즉시 새 창이 다시 열리는 버그 발생.

### 원인
창 DOM 요소의 클릭 이벤트가 `stopPropagation()` 없이 `window`까지 버블링됨. `blueprintController.js`의 `window.addEventListener("click", onClick)`이 받아 BLUEPRINT_FOCUS 모드에서 행성을 다시 감지해 `openPlanetWindow`를 재호출.

### 해결
창의 모든 클릭 핸들러에 `e.stopPropagation()` 추가:

```javascript
root.addEventListener("click", (e) => {
  e.stopPropagation();
  if (e.target === root) closePlanetWindow();
});
canvas.addEventListener("click", (e) => {
  e.stopPropagation();
  const cb = enterCb;
  closePlanetWindow();
  cb?.();
});
```

---

## 5. canvas 클릭 콜백 null 참조로 씬 전환 불발

### 현상
mini canvas를 클릭해도 이리데슨트 씬으로 전환되지 않음 (창은 닫힘).

### 원인
canvas 클릭 핸들러에서 `closePlanetWindow()` 호출이 `enterCb = null`로 콜백을 먼저 해제한 뒤 `enterCb?.()` 호출 → 항상 no-op.

```javascript
// 버그: closePlanetWindow()가 enterCb를 null로 만든 후 호출
canvas.addEventListener("click", () => {
  closePlanetWindow(); // ← enterCb = null 설정
  enterCb?.();         // ← 항상 null
});
```

### 해결
클릭 시 콜백을 지역 변수로 먼저 캡처:

```javascript
canvas.addEventListener("click", (e) => {
  e.stopPropagation();
  const cb = enterCb; // ← 먼저 캡처
  closePlanetWindow();
  cb?.();
});
```

---

## 6. focusProgress 즉시 리셋으로 포커스 해제 시 스냅 발생

### 현상
FOCUS → IDLE 전환 시 노드 스케일과 불투명도가 부드럽게 복원되지 않고 순간적으로 튀는 현상.

### 원인
`setMode(BLUEPRINT_IDLE)` 내에 `focusProgress = 0`을 즉시 설정하여 `applyFocusAnimation`이 다음 프레임에 `fp = 0`으로 계산, 모든 노드 상태가 스냅됨.

### 해결
`setMode(BLUEPRINT_IDLE)`에서 `rawFocus = 0`만 설정하고 `focusProgress` 초기화는 제거. `updateMode()`가 매 프레임 `THREE.MathUtils.damp(focusProgress, 0, ...)` 로 자연스럽게 수렴하도록 유지. 세션 간 강제 초기화는 `resetModeState()`가 담당.

---

## 7. landscapeCreated 플래그 미초기화로 지형 재생성 실패

### 현상
Blueprint → Iridescent → Blueprint → Iridescent 두 번째 진입 시 지형(Landscape)이 생성되지 않아 줌인해도 지표면이 나타나지 않음.

### 원인
`animate.js`의 모듈 레벨 `landscapeCreated = false` 플래그가 `cancelAnimation()` 시 초기화되지 않아, 재호출 시 `createLandscape()` 호출이 스킵됨.

### 해결
`animate()` 함수 진입부에서 세션 관련 상태 변수 일괄 초기화:

```javascript
export function animate(...) {
  lastTime = performance.now();
  landscapeCreated = false;
  maxZoomFired = false;
  prevState = ORBITAL;
  ...
}
```

---

## 8. animate() 재호출 시 lastTime 오염으로 첫 프레임 delta 폭발

### 현상
Blueprint에서 Iridescent로 두 번째 진입 시 첫 프레임에 오브젝트들이 크게 점프하는 현상.

### 원인
`lastTime`이 모듈 레벨에서 최초 1회만 `performance.now()`로 초기화됨. `cancelAnimation()` 후 수 분이 지나 `animate()`가 재호출되면, 첫 프레임 `delta = (now - lastTime) / 1000`이 수십 초 단위로 계산되어 damp/rotation 값이 폭발.

### 해결
위 7번 항목과 동일하게 `animate()` 진입부에서 `lastTime = performance.now()` 재설정.

---

## 9. Iridescent 복귀 후 controls 잔여 상태로 줌/카메라 오작동

### 현상
Blueprint로 돌아온 뒤 다시 Iridescent로 진입하면 카메라 줌 범위나 polar angle이 Landscape 모드 값으로 남아 있어 정상 궤도 탐색이 불가능한 경우 발생.

### 원인
`returnToBlueprint()`에서 `controls.minDistance`/`maxDistance`만 초기화하고 `controls.target`, `controls.minPolarAngle`, `controls.maxPolarAngle`, `controls.zoomSpeed`는 리셋하지 않아 Landscape 전환 시 변경된 값이 잔류.

### 해결
`returnToBlueprint()`에서 controls 전체 상태 완전 리셋 및 `disposeLandscape()` 추가:

```javascript
function returnToBlueprint() {
  cancelAnimation();
  window.removeEventListener("resize", onResize);
  controls.enabled = false;
  controls.target.set(0, 0, 0);
  controls.minDistance = 1.1;
  controls.maxDistance = 12;
  controls.zoomSpeed = 1;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI;
  camera.position.set(0, 0.4, 5);
  camera.lookAt(0, 0, 0);
  disposeLandscape();
  ...
}
```

---

## 10. resize 리스너 중복 등록

### 현상
Blueprint → Iridescent 순환을 반복할수록 resize 이벤트 시 연산 비용이 누적되어 성능 저하 및 예측 불가능한 동작 발생.

### 원인
`startIridescent()`가 호출될 때마다 `window.addEventListener("resize", onResize)`가 누적 등록됨. `removeEventListener`로 이전 리스너를 먼저 해제하는 코드 없음.

### 해결
`startIridescent()` 내에서 등록 전 항상 제거:

```javascript
window.removeEventListener("resize", onResize);
window.addEventListener("resize", onResize);
```

---

## 요약 및 최종 결과

| 구분 | 해결 전략 | 결과 |
| --- | --- | --- |
| **블랙 화면** | overlayEl DOM 제거 및 재진입 시 선제 정리 | 정상 씬 전환 |
| **Blueprint 먹통** | resetModeState() 재진입 시 강제 호출 | 인터랙션 완전 복원 |
| **클릭 무반응** | inner disc → outer disc 정규화 | 행성 클릭/hover 정상 동작 |
| **이벤트 전파** | stopPropagation() 전 계층 적용 | 창 중복 오픈 방지 |
| **콜백 null 참조** | enterCb 지역 캡처 후 close | 씬 전환 정상 실행 |
| **포커스 스냅** | focusProgress 즉시 리셋 제거 | 부드러운 unfocus 애니메이션 |
| **지형 미생성** | animate() 재진입 시 플래그 초기화 | 두 번째 이후에도 Landscape 정상 |
| **delta 폭발** | animate() 재진입 시 lastTime 리셋 | 첫 프레임 오브젝트 점프 제거 |
| **controls 오염** | 전체 controls 상태 + disposeLandscape | 재진입마다 깨끗한 궤도 탐색 |
| **리스너 중복** | remove 후 add 패턴 적용 | 성능 안정성 보장 |
