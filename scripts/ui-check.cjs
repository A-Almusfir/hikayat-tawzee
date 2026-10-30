// فحص الواجهة في متصفح حقيقي. يتطلب Playwright وخادم معاينة:
//   npm run build && npx vite preview --port 4173   ثم   npm run check:ui
// يفشل (exit 1) عند: تمرير أفقي، معادلة أعرض من حاويتها، تداخل تسميات الشجرة،
// مشهد أطول من شاشة ونصف قبل الكشف، أخطاء في الكونسول، أو تسجيل إجابة بمجرد التنقل بالأسهم.
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:4173/';
const CHAPTERS = ['bernoulli', 'binomial', 'hypergeometric', 'poisson', 'exponential', 'gamma', 'geometric', 'negbin', 'normal', 'chisquare', 't'];
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
    for (const route of ['#/', ...CHAPTERS.map((c) => '#/d/' + c), '#/exam', '#/drill', '#/mgf', '#/refs']) {
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
      for (const ch of CHAPTERS) {
        await page.goto(BASE + '#/');
        await page.evaluate(() => localStorage.clear());
        await page.goto(BASE + '#/d/' + ch);
        await page.waitForTimeout(400);
        const heights = async () => page.evaluate(() => [1, 2, 3, 4, 5].map((n) => +(document.getElementById(`scene-${n}`).getBoundingClientRect().height / innerHeight).toFixed(2)));
        const before = await heights();
        before.forEach((v, i) => v > 1.5 && fail(`[mobile] ${ch} المشهد ${i + 1}: ${v} شاشة قبل الكشف (الحد 1.5)`));

        // لوحة المفاتيح: الأسهم لا تسجّل إجابة، والتركيز ينتقل إلى التغذية الراجعة بعد «تحقّق»
        const radio = page.locator('#scene-3 .predict input[type=radio]').first();
        await radio.focus();
        await page.keyboard.press('ArrowDown');
        const answered = await page.evaluate(() => JSON.parse(localStorage.getItem('hikayat-tawzee:v1') || '{}').quiz || {});
        if (Object.keys(answered).length) fail(`[mobile] ${ch}: التنقل بالأسهم سجّل إجابة قبل «تحقّق»`);
        await page.keyboard.press('Space');
        await page.locator('#scene-3 .check-btn').first().click();
        const focused = await page.evaluate(() => document.activeElement?.className || document.activeElement?.tagName);
        if (!String(focused).includes('feedback')) fail(`[mobile] ${ch}: التركيز بعد «تحقّق» على ${focused}`);

        // كشف كامل: كل التوقعات، والمسألة الأولى، و«املأ القانون» (أسوأ حالة)، وسؤال الاسترجاع الأول
        for (let i = 0; i < 3; i++) {
          const fs = page.locator('#scene-3 .predict').filter({ has: page.locator('.check-btn') }).first();
          if (!(await fs.count())) break;
          await fs.locator('label.option').first().click();
          await fs.locator('.check-btn').click();
        }
        await page.locator('#scene-4').getByRole('button', { name: 'اكشف الحل كاملًا' }).click();
        const tiles = page.locator('#scene-5 .tile');
        const slots = await page.locator('#scene-5 .slot').count();
        for (let i = 0; i < slots; i++) await tiles.nth(slots + i).click();
        await page.locator('#scene-5 .compose').getByRole('button', { name: 'تحقّق' }).click();
        const r1 = page.locator('#scene-5 .predict').first();
        await r1.locator('label.option').first().click();
        await r1.locator('.check-btn').click();
        // زر المحاكاة في المشهد 2 إن وُجد
        const simBtn = page.locator('#scene-2 .btn-c').first();
        if (await simBtn.count()) await simBtn.click();
        await texOverflow(page, 'mobile', `#/d/${ch} (بعد الكشف)`);
        const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (sw > 0) fail(`[mobile] ${ch} بعد الكشف: تمرير أفقي ${sw}px`);
        const after = await heights();
        console.log(`${ch.padEnd(12)} قبل: ${before.join(' | ')}   بعد: ${after.join(' | ')}`);
        // أسوأ حالة: إجابات خاطئة (تغذية راجعة أطول) — الحد شاشتان
        after.forEach((v, i) => v > 2 && fail(`[mobile] ${ch} المشهد ${i + 1}: ${v} شاشة بعد الكشف (الحد 2)`));
      }
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
