# GPU dispose는 동기 sync 포인트 — RAF 지연으로 freeze 회피

**관련 파일**: `src/blueprint/blueprintScene.js`, `src/blueprint/blueprintController.js`

---

## 증상

ENTER SYSTEM 버튼을 클릭하고 Iridescent 팝업이 뜨기 직전에 화면이 100ms 이상 멈춰 보임. CSS 트랜지션도 함께 일시정지.

## 원인

`abortBlueprint()` → `stopBlueprint(false)` 안에서 `disposeBlueprintScene()`이 동기로 실행된다.

```javascript
// blueprintScene.js (수정 전)
export function disposeBlueprintScene() {
  if (!bpScene) return;
  bpScene.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();   // ← GPU sync
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => m.dispose?.());        // ← GPU sync
    }
  });
  bpScene = null;
}
```

Three.js의 `geometry.dispose()` / `material.dispose()`는 내부적으로 WebGL `gl.deleteBuffer()`, `gl.deleteTexture()`, `gl.deleteProgram()` 등을 호출한다. 이들은 GPU와의 동기화 포인트로 JS 메인 스레드를 블록한다.

Blueprint scene에는 다음이 들어있다:
- 32개 궤도 링 × 96~192 segments
- 4개 노드 × ~11개 라인 지오메트리
- 시스템 행성 × 30+ 재질 (LineMaterial, MeshBasicMaterial, LineBasicMaterial)
- iris 행성 × 48개 Line2 객체

전체 traverse가 동기 실행되면 100ms+ stall이 발생하고, 이 시점은 사용자가 클릭한 직후라 가장 눈에 띈다.

## 해결

scene 참조를 즉시 null로 끊고(새 세션이 안전하게 시작하도록), 실제 GPU dispose는 다음 RAF로 지연.

```javascript
// blueprintScene.js (수정 후)
export function deferDisposeBlueprintScene() {
  const scene = bpScene;
  bpScene = null;                       // 즉시 참조 해제 (재진입 안전)
  if (!scene) return;
  requestAnimationFrame(() => {
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => m.dispose?.());
      }
    });
  });
}
```

```javascript
// blueprintController.js
function stopBlueprint(closeWindow = true) {
  // ... cancel RAF, remove listeners ...
  unmountBlueprintUI();
  unmountAnnotationLayer();
  deferDisposeBlueprintScene();           // ← 동기 → 비동기
  clearIrisMats();
  clearNodeMats();
  clearRingMats();
  clearSysMats();
}
```

## 왜 다음 RAF에서는 안 보이는가

지연된 RAF가 fire될 때:
- canvas#bg는 이미 `opacity: 0`로 설정됨 (Iridescent 페이드인 시작 전)
- 사용자는 페이드아웃된 Planet Window 또는 backdrop만 보임
- 그 프레임에서 100ms stall이 나도 시각적으로 변화가 없으므로 인지 불가

## 참조 해제 타이밍

`bpScene = null`을 dispose 콜백 안이 아닌 **함수 진입 직후**에 처리해야 한다. 이유:
- 사용자가 빠르게 ENTER → BACK → ENTER를 누를 수 있음
- 두 번째 ENTER 시점에 `createBlueprintScene()`이 `if (bpScene) return bpScene`로 폐기된 scene을 재사용하면 dispose 콜백이 그 scene을 파괴함
- 참조를 즉시 끊으면 새 세션은 항상 fresh scene을 만든다

## 일반화

`.dispose()`를 가진 Three.js 리소스는 모두 GPU 동기 포인트:
- `BufferGeometry.dispose()`
- `Material.dispose()`, `ShaderMaterial.dispose()`
- `Texture.dispose()`
- `RenderTarget.dispose()`
- `WebGLRenderer.dispose()`

대량 정리가 필요한 시점이 사용자 인터랙션 직후라면 **즉시 dispose 대신 다음 RAF로 지연**하고, 그 사이 화면을 가리는 페이드 오버레이를 깔아 stall을 숨긴다.
