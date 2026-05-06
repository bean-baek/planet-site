# 크로스페이드 전환 — fade-out과 fade-in의 타이밍 오버랩

**관련 파일**: `src/blueprint/blueprintPlanetWindow.js`, `src/main.js`

---

## 증상

ENTER SYSTEM 클릭 → Iridescent 진입 시 어색한 전환:
- (1) Planet Window가 먼저 사라지고 검은 화면이 잠시 보였다가 Iridescent가 페이드인
- (2) 또는 Planet Window 페이드 완료까지 기다린 뒤 Iridescent 페이드 → 총 800ms+ 걸림

## 원인

순차적(serial) 처리 패턴:
```
[Planet Window fade-out 완료] → [Iridescent setup] → [Iridescent fade-in]
```
사이에 검은 화면 또는 정지 프레임이 노출됨.

기본 `setTimeout` 패턴:
```javascript
setTimeout(async () => {
  // ... 미니 캔버스 정지 ...
  miniCanvas.style.opacity = "0";          // Planet Window fade 시작
  await mountIridescentCb();               // GPU 작업 + 페이드 완료까지 await
  // ↑ 이 시점에 Planet Window는 이미 사라졌고
  //    Iridescent도 완전히 보임 → 한쪽씩 시리얼로 전환됨
  mountIridescentHud(...);
}, 420);
```

## 해결 — Cross-fade 타이밍

두 transition을 **시간 축에서 오버랩**시키면 검은 화면 없이 자연스럽게 한쪽이 다른 쪽으로 흘러간다.

```
t=0       t=150     t=400     t=550     t=950
│         │         │         │         │
├── Planet Window fade-out (0.45s) ────┤
│                   ├── canvas opacity 0→1 (0.4s) ─┤
│                   ├── window frame anim 0.4s ────┤
│                   │
└─ ENTER 클릭        └─ Iridescent setup 완료
```

- **t=0**: ENTER 클릭. Planet Window root에 `opacity: 0` transition 시작 (0.45s).
- **t=150ms**: GPU 작업(`abortBlueprint()`, scene dispose 지연, renderer setup)이 마무리되는 시점.
- **t=150ms+2RAF**: Iridescent canvas opacity 0→1 transition 시작 (0.4s).
- **t=550ms**: Iridescent 완전히 보임. Planet Window는 거의 사라짐.

```javascript
// blueprintPlanetWindow.js — startMaximize
function startMaximize() {
  if (!root) return;
  isMaximized = true;
  root.style.pointerEvents = "none";

  // (1) Planet Window fade-out 즉시 시작
  requestAnimationFrame(() => {
    root.style.transition = "opacity 0.45s ease";
    root.style.opacity    = "0";
  });

  // (2) 150ms 후 Iridescent setup → 양 transition이 250ms 동안 오버랩
  setTimeout(async () => {
    if (!isMaximized) return;
    // GPU 작업 + canvas 페이드인 예약
    savedOnBack = await mountIridescentCb();
    if (root) { root.remove(); root = null; }
    mountIridescentHud(...);
  }, 150);
}
```

```javascript
// main.js — mountIridescentInRect
async function mountIridescentInRect() {
  // ... GPU setup, animate() 시작 ...

  // 2 RAF 후 fade-in 예약 (fire-and-forget — 호출자가 즉시 다음 단계 진행 가능)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      _bgCanvas.style.transition = "opacity 0.4s ease";
      _bgCanvas.style.opacity    = "1";
      setTimeout(() => { _bgCanvas.style.transition = ""; }, 400);
    });
  });

  return { onBack, onCanvasResize, winDims };  // 즉시 반환
}
```

## 핵심 포인트

### 1. fire-and-forget 패턴

`mountIridescentInRect`가 fade-in 완료를 `await`하면 호출자가 동시에 진행해야 할 작업(window frame mount)이 지연된다. fade-in을 `requestAnimationFrame`으로 **예약만 하고 즉시 return** 하면, 호출자는 이어서 mount 작업을 시작할 수 있고 fade는 background에서 진행된다.

### 2. 150ms 지연의 역할

- 너무 짧으면(<50ms): Planet Window fade가 거의 시작 안 된 상태에서 GPU stall이 보임
- 너무 길면(>300ms): 클릭 후 반응 지연 체감
- 150ms가 적절: 사용자가 "버튼이 눌렸다"고 인지하는 시점에 다음 단계가 시작됨

### 3. 2 RAF의 이유

- 1번째 RAF: 브라우저가 페인트 사이클 시작
- 2번째 RAF: 이전 setup의 결과가 layout/paint 반영 완료
- 그 후 opacity 트랜지션이 정확한 초기 상태(0)에서 출발

1 RAF만 두면 일부 브라우저에서 트랜지션이 적용 안 되거나 점프하는 경우가 있음.

## 일반화

두 UI 레이어 사이의 매끄러운 전환:
1. 두 레이어의 transition duration을 비슷하게 맞춤 (0.4s ~ 0.5s)
2. fade-out 시작 후 약 30~40% 시점에 fade-in 시작 (오버랩 250ms 정도)
3. fade-in을 promise로 await하지 말고 fire-and-forget
4. CSS animation이 RAF에 동기화되도록 2-RAF 지연 사용
