const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  try {
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    console.log('Page loaded.');

    // 100% 도착 지점으로 이동 (카메라 거리가 1.15가 되는 지점)
    // 휠 시뮬레이션 대신 줌 거리를 강제하거나 스크롤 최상단으로 이동
    await page.evaluate(() => window.scrollTo(0, 0)); 
    await page.waitForTimeout(5000); // 렌더링 안정화 대기
    
    await page.screenshot({ path: '.shots/check_landscape_blind.png' });
    console.log('Saved: check_landscape_blind.png');
  } catch (e) {
    console.error(e);
  }

  await browser.close();
})();
