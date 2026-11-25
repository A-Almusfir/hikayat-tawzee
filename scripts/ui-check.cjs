// فحص الواجهة في متصفح حقيقي. يتطلب Playwright وخادم معاينة:
//   npm run build && npx vite preview --port 4173   ثم   npm run check:ui
// يفشل (exit 1) عند: تمرير أفقي، معادلة أعرض من حاويتها، تداخل تسميات الشجرة،
// مشهد أطول من شاشة ونصف قبل الكشف، أخطاء في الكونسول، أو تسجيل إجابة بمجرد التنقل بالأسهم.
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:4173/';
const GENERAL = ['#/exam', '#/drill', '#/mgf', '#/more', '#/choose', '#/cards', '#/refs'];

// نص عربي ظاهر في الواجهة الإنجليزية، عدا ما وُسم lang="ar" عمدًا (الاسم العربي بجانب الإنجليزي)
async function arabicLeaks(page) {
  return page.evaluate(() => {
    const out = new Set();
    const own = (el) => { const c = el.closest('[lang="ar"]'); return c && c !== document.documentElement; };
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode()); ) if (/[\u0600-\u06FF]/.test(n.textContent) && !own(n.parentElement) && !n.parentElement.closest('script, style, noscript')) out.add(n.textContent.trim().slice(0, 50));
    for (const el of document.querySelectorAll('[aria-label], [title], [placeholder]'))
      for (const a of ['aria-label', 'title', 'placeholder']) { const v = el.getAttribute(a); if (v && /[\u0600-\u06FF]/.test(v) && !own(el)) out.add(`@${a}: ${v.slice(0, 50)}`); }
    if (/[\u0600-\u06FF]/.test(document.title)) out.add(`@title: ${document.title}`);
    return [...out];
  });
}

const CHAPTERS = ['bernoulli', 'binomial', 'hypergeometric', 'poisson', 'exponential', 'gamma', 'geometric', 'negbin', 'uniform', 'normal', 'chisquare', 't'];
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
    // الطباعة والتأكيد لا يفتحان نوافذ أثناء الضغط الآلي على الأزرار
    await ctx.addInitScript(() => { window.print = () => {}; window.confirm = () => false; });
    const page = await ctx.newPage();
    page.on('console', (m) => m.type() === 'error' && fail(`[${tag}] console: ${m.text()}`));
    page.on('pageerror', (e) => fail(`[${tag}] pageerror: ${e.message}`));
    await page.goto(BASE + '#/');
    await page.evaluate(() => localStorage.clear());
    for (const route of ['#/', ...CHAPTERS.map((c) => '#/d/' + c), ...GENERAL]) {
      await page.goto(BASE + route);
      await page.waitForSelector('main h1');
      await page.waitForTimeout(400);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (sw > 0) fail(`[${tag}] ${route}: تمرير أفقي ${sw}px`);
      await texOverflow(page, tag, route);
      // الأزرار الملوّنة بلون الصفحة: خلفية فعلية (لا شفافة) خلف النص الأبيض
      const invisible = await page.evaluate(() => [...document.querySelectorAll('main .seg-tab.on, main .btn-c, main .pk')]
        .filter((e) => e.getBoundingClientRect().width && /rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(e).backgroundColor))
        .map((e) => e.textContent.trim().slice(0, 20)));
      invisible.forEach((t) => fail(`[${tag}] ${route}: زر بلا خلفية (نص أبيض على الورق): «${t}»`));
    }

    // الواجهة الإنجليزية: كل الصفحات العامة، مع كشف ما يظهر بعد التفاعل
    // اللغة تُقرأ عند تحميل الصفحة، والتنقل بالـ hash لا يعيد التحميل: نعيده صراحة ونتأكد من الاتجاه
    await page.evaluate(() => localStorage.setItem('hikayat:lang', 'en'));
    for (const route of ['#/', ...GENERAL, '#/nope']) {
      await page.goto(BASE + route);
      await page.reload();
      await page.waitForSelector('main h1');
      if ((await page.evaluate(() => document.documentElement.dir)) !== 'ltr') fail(`[${tag}] EN ${route}: الصفحة لم تتحول إلى الإنجليزية`);
      await page.waitForTimeout(400);
      const seen = new Set(await arabicLeaks(page));
      if (tag === 'mobile') {
        // جولات: افتح المطويات واضغط كل زر وخيار ظاهر (عدا التنقل والطباعة والمسح)، واجمع ما يظهر
        for (let round = 0; round < 8; round++) {
          await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
          const radios = await page.locator('main input[type=radio]:not([disabled])').all();
          for (const r of radios.slice(0, 40)) await r.check({ timeout: 500 }).catch(() => {});
          const btns = await page.locator('main button:not([disabled])').all();
          for (const b of btns.slice(0, 60)) {
            const t = ((await b.textContent().catch(() => '')) || '').trim();
            if (/print|clear|reset|start over|again/i.test(t)) continue;
            await b.click({ timeout: 500 }).catch(() => {});
          }
          (await arabicLeaks(page)).forEach((l) => seen.add(l));
        }
      }
      seen.forEach((l) => fail(`[${tag}] EN ${route}: نص عربي في الواجهة الإنجليزية: «${l}»`));
      const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (sw > 0) fail(`[${tag}] EN ${route}: تمرير أفقي ${sw}px`);
      await texOverflow(page, tag, 'EN ' + route);
    }

    // الفصول المترجمة: بعد كشف كل شيء، لا يبقى نص عربي إلا ما وُسم lang="ar" عمدًا (الاسم العربي بجانب الإنجليزي)
    if (tag === 'mobile') {
      for (const ch of CHAPTERS) {
        await page.goto(BASE + '#/d/' + ch);
        await page.reload();
        await page.waitForSelector('main h1');
        for (let round = 0; round < 6; round++) {
          await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
          const radios = await page.locator('#scene-3 fieldset.predict input[type=radio]:not([disabled])').all();
          if (!radios.length) break;
          await radios[0].check();
          await page.locator('#scene-3 fieldset.predict .check-btn').first().click();
        }
        for (const tab of await page.locator('#scene-4 .seg-tab').all()) {
          await tab.click();
          const full = page.getByRole('button', { name: 'Show the full solution' });
          if (await full.count()) await full.click();
        }
        await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
        const leaks = await arabicLeaks(page);
        leaks.forEach((l) => fail(`[${tag}] EN #/d/${ch}: نص عربي في الواجهة الإنجليزية: «${l}»`));
        const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (sw > 0) fail(`[${tag}] EN #/d/${ch}: تمرير أفقي ${sw}px`);
        await texOverflow(page, tag, 'EN #/d/' + ch);
      }
      // الإجابات المحفوظة هنا لا تمتد إلى فحوص الفصول العربية بعدها
      await page.evaluate(() => { localStorage.clear(); localStorage.setItem('hikayat:lang', 'en'); });
      await page.reload();
    }

    // الشجرة بالعربية والإنجليزية: لا تتقاطع التسميات مع الأسماء أو الدوائر أو الخطوط
    for (const lang of ['ar', 'en']) {
    await page.evaluate((l) => localStorage.setItem('hikayat:lang', l), lang);
    await page.goto(BASE + '#/');
    await page.reload();
    await page.waitForSelector('.tree-svg');
    if ((await page.evaluate(() => document.documentElement.lang)) !== lang) fail(`[${tag}] الشجرة: لم تتحول إلى ${lang}`);
    await page.waitForTimeout(300);
    // كل لوحة من لوحات الشجرة على حدة
    const tabs = page.locator('.tree-tabs .seg-tab');
    for (let ti = 0; ti < Math.max(1, await tabs.count()); ti++) {
    if (await tabs.count()) { await tabs.nth(ti).click(); await page.waitForTimeout(150); }
    const overlaps = await page.evaluate(() => {
      const box = (el) => el.getBoundingClientRect();
      const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      const labels = [...document.querySelectorAll('.t-label')].map((e) => [e.textContent, box(e), e.closest('.t-edge')]);
      const others = [...document.querySelectorAll('.t-name, .t-node circle')].map((e) => [e.textContent || 'دائرة', box(e)]);
      const out = [];
      for (const [lt, lb] of labels) for (const [ot, ob] of others) if (hit(lb, ob)) out.push(`${lt} × ${ot}`);
      // التسمية لا يقطعها خط سهم آخر (نأخذ نقاطًا على كل خط ظاهر ونتحقق أنها خارج مستطيل التسمية بعد تضييقه قليلًا)
      for (const [lt, lb, g] of labels) {
        for (const ln of document.querySelectorAll('.t-edge line.ln')) {
          if (ln.closest('.t-edge') === g) continue;
          const m = ln.getScreenCTM();
          const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map((a) => +ln.getAttribute(a));
          for (let k = 0; k <= 40; k++) {
            const pt = new DOMPoint(x1 + ((x2 - x1) * k) / 40, y1 + ((y2 - y1) * k) / 40).matrixTransform(m);
            if (pt.x > lb.left + 2 && pt.x < lb.right - 2 && pt.y > lb.top + 2 && pt.y < lb.bottom - 2) { out.push(`${lt} × خط سهم`); break; }
          }
        }
      }
      for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) if (hit(labels[i][1], labels[j][1])) out.push(`${labels[i][0]} × ${labels[j][0]}`);
      return out;
    });
    overlaps.forEach((o) => fail(`[${tag}] الشجرة ${lang} (لوحة ${ti + 1}): تداخل ${o}`));
    // لا يخرج أي اسم أو تسمية عن حدود الرسم
    const outside = await page.evaluate(() => {
      // حدود منطقة الرسم (viewBox) على الشاشة، لا حدود عنصر svg الذي قد يكون أعرض منها
      const el = document.querySelector('.tree-svg'), vb = el.viewBox.baseVal, m = el.getScreenCTM();
      const a = new DOMPoint(vb.x, vb.y).matrixTransform(m), b = new DOMPoint(vb.x + vb.width, vb.y + vb.height).matrixTransform(m);
      const svg = { left: a.x, top: a.y, right: b.x, bottom: b.y };
      return [...document.querySelectorAll('.t-label, .t-name')].filter((e) => { const r = e.getBoundingClientRect(); return r.left < svg.left - 1 || r.right > svg.right + 1 || r.top < svg.top - 1 || r.bottom > svg.bottom + 1; }).map((e) => e.textContent);
    });
    outside.forEach((o) => fail(`[${tag}] الشجرة ${lang} (لوحة ${ti + 1}): «${o}» خارج الرسم`));
    const tabBg = await page.evaluate(() => { const e = document.querySelector('.tree-tabs .seg-tab.on'); return e ? getComputedStyle(e).backgroundColor : 'none'; });
    if (/rgba\(0, 0, 0, 0\)|transparent/.test(tabBg)) fail(`[${tag}] الشجرة ${lang} (لوحة ${ti + 1}): زر اللوحة المختار بلا خلفية`);
    }
    }
    await page.evaluate(() => localStorage.removeItem('hikayat:lang'));
    await page.reload();

    if (tag === 'mobile') {
      for (const ch of CHAPTERS) {
        await page.goto(BASE + '#/');
        await page.evaluate(() => localStorage.clear());
        await page.goto(BASE + '#/d/' + ch);
        await page.waitForSelector('main h1');
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
        await page.locator('#scene-4').getByRole('button', { name: 'ورّني الحل كامل' }).click();
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
