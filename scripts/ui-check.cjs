// فحص الواجهة في متصفح حقيقي. يتطلب Playwright وخادم معاينة:
//   npm run build && npx vite preview --port 4173   ثم   npm run check:ui
// يفشل (exit 1) عند: تمرير أفقي، معادلة أعرض من حاويتها، تداخل تسميات الشجرة،
// مشهد أطول من شاشة ونصف قبل الكشف، أخطاء في الكونسول، أو تسجيل إجابة بمجرد التنقل بالأسهم.
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:4173/';
const problems = [];
const fail = (m) => problems.push(m);

async function texOverflow(page, tag, route) {
  const bad = await page.evaluate(() => {
    const out = [];
    for (const k of document.querySelectorAll('main .katex')) {
      if (k.closest('details:not([open])')) continue;
      const box = k.closest('.tex-block, .tex, p, li, div');
      const host = k.closest('.tex-block') || box;
      const r = k.getBoundingClientRect();
      const hr = host.getBoundingClientRect();
      if (!r.width) continue;
      if (r.right > hr.right + 1.5 || r.left < hr.left - 1.5 || r.right > document.documentElement.clientWidth) out.push(k.textContent.slice(0, 40) + ` (${Math.round(r.width)} > ${Math.round(hr.width)})`);
    }
    return out;
  });
  bad.forEach((b) => fail(`[${tag}] ${route}: معادلة أعرض من حاويتها: ${b}`));
}

(async () => {
  const browser = await chromium.launch();
  for (const [w, h, tag] of [[390, 844, 'mobile'], [1440, 900, 'desktop']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    page.on('console', (m) => m.type() === 'error' && fail(`[${tag}] console: ${m.text()}`));
    page.on('pageerror', (e) => fail(`[${tag}] pageerror: ${e.message}`));
    await page.goto(BASE + '#/');
    await page.evaluate(() => localStorage.clear());
    for (const route of ['#/', '#/d/poisson']) {
      await page.goto(BASE + route);
      await page.waitForTimeout(400);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (sw > 0) fail(`[${tag}] ${route}: تمرير أفقي ${sw}px`);
      await texOverflow(page, tag, route);
    }

    // الشجرة: لا تتقاطع التسميات مع الأسماء أو الدوائر
    await page.goto(BASE + '#/');
    await page.waitForTimeout(300);
    const overlaps = await page.evaluate(() => {
      const box = (el) => el.getBoundingClientRect();
      const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      const labels = [...document.querySelectorAll('.t-label')].map((e) => [e.textContent, box(e)]);
      const others = [...document.querySelectorAll('.t-name, .t-node circle')].map((e) => [e.textContent || 'دائرة', box(e)]);
      const out = [];
      for (const [lt, lb] of labels) for (const [ot, ob] of others) if (hit(lb, ob)) out.push(`${lt} × ${ot}`);
      for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) if (hit(labels[i][1], labels[j][1])) out.push(`${labels[i][0]} × ${labels[j][0]}`);
      return out;
    });
    overlaps.forEach((o) => fail(`[${tag}] الشجرة: تداخل ${o}`));

    if (tag === 'mobile') {
      await page.goto(BASE + '#/d/poisson');
      await page.waitForTimeout(400);
      const heights = async () => page.evaluate(() => [1, 2, 3, 4, 5].map((n) => +(document.getElementById(`scene-${n}`).getBoundingClientRect().height / innerHeight).toFixed(2)));
      const before = await heights();
      before.forEach((v, i) => v > 1.5 && fail(`[mobile] المشهد ${i + 1}: ${v} شاشة قبل الكشف (الحد 1.5)`));

      // لوحة المفاتيح: الأسهم في خيارات التوقع لا تسجّل إجابة
      const radio = page.locator('#scene-3 .predict input[type=radio]').first();
      await radio.focus();
      await page.keyboard.press('ArrowDown');
      const answered = await page.evaluate(() => JSON.parse(localStorage.getItem('hikayat-tawzee:v1') || '{}').quiz || {});
      if (Object.keys(answered).length) fail('[mobile] التنقل بالأسهم سجّل إجابة قبل «تحقّق»');
      await page.keyboard.press('Space');
      await page.locator('#scene-3 .check-btn').first().click();
      const focused = await page.evaluate(() => document.activeElement?.className || document.activeElement?.tagName);
      if (!String(focused).includes('feedback')) fail(`[mobile] التركيز بعد «تحقّق» على ${focused} لا على التغذية الراجعة`);

      // كشف كامل: كل التوقعات صحيحة، والمسألة الأولى، وسؤال الاسترجاع الأول
      for (let i = 0; i < 3; i++) {
        const fs = page.locator('#scene-3 .predict').filter({ has: page.locator('.check-btn') }).first();
        if (!(await fs.count())) break;
        await fs.locator('label.option').first().click();
        await fs.locator('.check-btn').click();
      }
      await page.locator('#scene-4').getByRole('button', { name: 'اكشف الحل كاملًا' }).click();
      // «املأ القانون» بأي ثلاث بطاقات (أسوأ حالة: تغذية راجعة بالخطأ)، ثم أسئلة الاسترجاع
      const tiles = page.locator('#scene-5 .tile');
      for (let i = 0; i < 3; i++) await tiles.nth(i).click();
      await page.locator('#scene-5 .compose').getByRole('button', { name: 'تحقّق' }).click();
      const r1 = page.locator('#scene-5 .predict').first();
      await r1.locator('label.option').first().click();
      await r1.locator('.check-btn').click();
      await texOverflow(page, 'mobile', '#/d/poisson (بعد الكشف)');
      const after = await heights();
      console.log('ارتفاع المشاهد بالشاشات (390×844) قبل الكشف:', before.join(' | '));
      console.log('ارتفاع المشاهد بالشاشات (390×844) بعد الكشف:', after.join(' | '));
      after.forEach((v, i) => v > 2 && fail(`[mobile] المشهد ${i + 1}: ${v} شاشة بعد الكشف (الحد 2)`));
    }
    await ctx.close();
  }
  await browser.close();
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log('فحص الواجهة: لا مشكلات');
})();
