import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:8000/telescope-dashboard/', { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1500));

    // Check for #app
    const appId = await page.evaluate(() => {
        const app = document.getElementById('app');
        return app ? { found: true, tag: app.tagName, childCount: app.children.length } : { found: false };
    });
    console.log('app div:', JSON.stringify(appId));

    // List all buttons
    const btns = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).map(b => ({
            text: b.textContent.trim().slice(0, 40),
            title: b.title,
            aria: b.getAttribute('aria-label'),
            classes: b.className.slice(0, 60),
        }));
    });
    console.log('buttons:', JSON.stringify(btns, null, 2));

    // Sidebar info
    const sidebar = await page.evaluate(() => {
        const els = ['aside', 'nav', '.sidebar'];
        for (const sel of els) {
            const s = document.querySelector(sel);
            if (s) return { sel, tag: s.tagName, w: s.offsetWidth, classes: s.className.slice(0, 80) };
        }
        // Try any element with sidebar in class
        const all = document.querySelectorAll('*');
        for (const el of all) {
            if (el.className && typeof el.className === 'string' && el.className.toLowerCase().includes('sidebar')) {
                return { sel: 'className', tag: el.tagName, w: el.offsetWidth, classes: el.className.slice(0, 80) };
            }
        }
        return null;
    });
    console.log('sidebar:', JSON.stringify(sidebar));

    // Filter panel
    await page.goto('http://127.0.0.1:8000/telescope-dashboard/#/queries', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    const filterInfo = await page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        return Array.from(forms).map(f => ({
            tag: f.tagName,
            display: getComputedStyle(f).display,
            h: f.offsetHeight,
            classes: f.className.slice(0, 80),
            id: f.id,
        }));
    });
    console.log('forms on queries page:', JSON.stringify(filterInfo, null, 2));

    await browser.close();
})();
