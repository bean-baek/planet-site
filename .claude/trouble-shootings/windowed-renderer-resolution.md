# Windowed → Fullscreen 복귀 후 화질 저하 — renderer.setSize 명시 호출

**관련 파일**: `src/blueprint/blueprintController.js`, `src/main.js`

---

## 증상

Iridescent 윈도우드 뷰(예: 900×554)를 보고 BACK 또는 스크롤로 Blueprint로 복귀하면, Blueprint 궤도 링이 흐릿하고 픽셀이 깨져 보임. 새로고침하면 정상 화질로 돌아옴.

## 원인 — renderer drawing buffer ≠ canvas CSS 크기

Three.js `WebGLRenderer.setSize(w, h)`는 두 가지를 동시에 설정한다:
1. **Drawing buffer 크기**: WebGL이 실제 렌더링하는 픽셀 해상도 (`canvas.width`, `canvas.height` 속성)
2. **Canvas CSS 크기**: 화면에 표시되는 크기 (`canvas.style.width`, `canvas.style.height`)

`setSize(w, h, false)`처럼 세 번째 인자를 `false`로 주면 CSS는 건드리지 않고 drawing buffer만 변경한다.

윈도우드 모드 진입 시 이 패턴을 사용했다:
```javascript
// main.js — _positionIriCanvas
renderer.setSize(width, height, false);   // 900×554 buffer
Object.assign(_bgCanvas.style, {
  position: "fixed",
  left: "210px", top: "97px",
  width: "900px", height: "554px",        // CSS도 매칭
});
```

이 시점에 canvas 픽셀은 900×554, CSS도 900×554 — 정합.

복귀 시 (`returnToBlueprint`):
```javascript
_bgCanvas.style.cssText = "";   // CSS 인라인 스타일 제거 → CSS는 fullscreen으로 복귀 (#bg { inset:0 })
// renderer.setSize는 호출 안 함!
```

→ canvas의 **drawing buffer는 여전히 900×554**, CSS는 fullscreen(예: 1920×1080).

→ 브라우저가 작은 buffer를 큰 CSS 크기로 stretch 렌더링 → 흐림 발생.

## 해결

Blueprint 시작 시점(`startBlueprint`)에 항상 `renderer.setSize(window.innerWidth, window.innerHeight)` 호출.

```javascript
// blueprintController.js
export function startBlueprint(onComplete, mountIridescent) {
  resetModeState();
  // ...
  const w = window.innerWidth;
  const h = window.innerHeight;

  // ↓ 핵심: 윈도우드 모드에서 작아진 drawing buffer를 fullscreen으로 되돌림
  renderer.setSize(w, h);

  const bpScene = createBlueprintScene();
  setViewport(w, h);
  bpCamera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  // ...
}
```

`returnToBlueprint`에서 처리하지 않고 `startBlueprint` 진입 시점에 두는 이유:
- `startBlueprint`은 직접/간접 복귀 모든 경로의 진입점이므로 한 곳에 두면 누락 위험 없음
- camera aspect도 함께 갱신하므로 인접 위치에 두는 것이 자연스러움

## 검증

```javascript
// 콘솔에서
canvas.width / canvas.height                                   // drawing buffer 비율
parseFloat(canvas.style.width) / parseFloat(canvas.style.height) // CSS 비율
window.innerWidth / window.innerHeight                          // viewport 비율
```

세 값이 모두 일치해야 stretch/blur 없이 선명. 하나라도 다르면 비율 불일치 또는 해상도 손실.

## 관련 — `updateStyle` false vs true

| 호출 | 효과 |
|------|------|
| `setSize(w, h)` (= `setSize(w, h, true)`) | canvas.width/height + canvas.style.width/height 모두 변경 |
| `setSize(w, h, false)` | canvas.width/height만 변경 (CSS 보존) |

윈도우드 모드처럼 CSS를 JS에서 수동 제어하고 있다면 `false`가 맞음. 하지만 fullscreen 복귀 시점에는 CSS도 함께 정상화돼야 하므로 기본(true) 호출이 맞다.

## 일반화

Three.js에서 `renderer.setSize`를 한 번 작은 값으로 호출하면, 다음 모드/씬 전환 시점에 명시적으로 다시 설정하지 않는 한 그 크기를 유지한다. 다중 모드(fullscreen ↔ windowed) UI에서는 **각 모드 진입 시점에 그 모드에 맞는 setSize를 명시 호출**하는 것이 안전.
