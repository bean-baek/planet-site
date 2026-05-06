# WebGL 캔버스 스냅샷 — preserveDrawingBuffer + 동일 task 캡처

**관련 파일**: `src/scene.js`, `src/main.js`, `src/blueprint/blueprintController.js`

---

## 증상

Blueprint 화면을 backdrop으로 사용하기 위해 `canvas#bg.toDataURL()`로 스냅샷을 찍었으나, 빈 검정 이미지만 반환됨.

## 원인 1 — preserveDrawingBuffer

WebGL은 기본적으로 **double-buffered**로 동작하며, 매 프레임마다 drawing buffer를 swap한다. RAF 콜백 외부에서 `toDataURL()`을 호출하면 swap된 빈 buffer를 읽게 된다.

`THREE.WebGLRenderer`의 기본값은 `preserveDrawingBuffer: false` — 성능 최적화 기본이지만 캡처가 불가능하다.

```javascript
// scene.js (수정 전)
export const renderer = new THREE.WebGLRenderer({
  canvas, antialias: true, alpha: true,
  // preserveDrawingBuffer 미설정 → false (기본)
});
```

## 원인 2 — Vite HMR과 module singleton

`scene.js`의 `renderer`는 모듈 상수로 한 번만 생성된다. `preserveDrawingBuffer: true`를 추가해도 Vite HMR이 모듈을 다시 로드하면서도 **이미 생성된 renderer 인스턴스**는 그대로 유지될 수 있다. WebGL context 옵션은 생성 시점에만 적용되므로, HMR 후에도 `preserveDrawingBuffer`가 false인 채 동작.

→ **전체 페이지 새로고침**이 필요.

## 해결

### Step 1: WebGLRenderer에 옵션 추가

```javascript
// scene.js (수정 후)
export const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
  preserveDrawingBuffer: true,           // ← 추가
});
```

### Step 2: 명시적 render → 동일 JS task에서 toDataURL

`preserveDrawingBuffer: true`만으로도 동작하지만, 안전하게 하려면 캡처 직전에 `renderer.render()`를 명시 호출한다. 동일 synchronous task 안에서 호출하면 swap이 일어나기 전에 buffer를 읽을 수 있다.

```javascript
// main.js
async function mountIridescentInRect() {
  // 스냅샷 직전에 blueprint를 한 번 더 명시 렌더
  const bpCam = getBpCamera();
  const bpScn = getBlueprintScene();
  if (bpCam && bpScn) {
    renderer.render(bpScn, bpCam);              // 동기 렌더 → drawing buffer 채움
    const snapshot = _bgCanvas.toDataURL("image/jpeg", 0.88);  // 동일 task에서 즉시 read
    
    _iriBackdrop = document.createElement("div");
    _iriBackdrop.className = "bp-iri-backdrop";
    _iriBackdrop.style.backgroundImage = `url(${snapshot})`;
    document.body.appendChild(_iriBackdrop);
  }

  abortBlueprint();
  // ...
}
```

### Step 3: getter 노출

명시 렌더에 필요한 blueprint scene/camera 인스턴스를 외부로 노출.

```javascript
// blueprintController.js
export function getBpCamera() { return bpCamera; }

// blueprintScene.js — 이미 export되어 있음
export function getBlueprintScene() { return bpScene; }
```

## JPEG 압축

`toDataURL()` 첫 번째 인자를 `"image/jpeg"`, 두 번째 인자를 0~1 quality로 설정해 dataURL 크기를 줄인다.

```javascript
_bgCanvas.toDataURL("image/jpeg", 0.88);
```

PNG는 무손실이지만 fullscreen 캡처 시 base64 dataURL이 수 MB가 되어 CSS `background-image`로 적용 시 메모리/페인팅 코스트가 큼. JPEG 0.88 quality면 시각적 차이가 없으면서 크기는 1/5~1/10.

## 트레이드오프

| 옵션 | 장점 | 단점 |
|------|------|------|
| `preserveDrawingBuffer: true` | toDataURL이 항상 동작 | 일부 GPU에서 frame rate 소폭 저하 (buffer swap 최적화 비활성) |
| `false` + 명시 렌더 후 toDataURL | 성능 최적 | 캡처 시점이 RAF 외부일 때 불안정 |

이 프로젝트는 backdrop 캡처가 모드 전환 시 단발성으로 발생하므로 `preserveDrawingBuffer: true` 비용은 무시 가능.

## 참고

- [WebGLRenderingContext: preserveDrawingBuffer](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#preservedrawingbuffer)
- Three.js docs: `WebGLRenderer.parameters`
