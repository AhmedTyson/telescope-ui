/**
 * Telescope Dashboard - Toggle / Interaction Test Suite
 * Run: node test-toggles.mjs
 */

import puppeteer from 'puppeteer';

const BASE = 'http://127.0.0.1:8000/telescope-dashboard/';
const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const INFO = '\x1b[33m→\x1b[0m';

let browser, page;
const consoleErrors = [];
const networkErrors = [];
const results = [];

function log(status, name, detail = '') {
    const sym = status === 'pass' ? PASS : status === 'fail' ? FAIL : INFO;
    console.log(`  ${sym} ${name}${detail ? ': ' + detail : ''}`);
    if (status !== 'info') results.push({ status, name, detail });
}

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function setup() {
    browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push('PAGE ERROR: ' + err.message));
    page.on('requestfailed', req => {
        // Only flag navigation-level failures, not background fetch aborts from page unload
        const url = req.url();
        const err = req.failure()?.errorText;
        if (err && err !== 'net::ERR_ABORTED' && (url.includes('127.0.0.1') || url.includes('localhost'))) {
            networkErrors.push(`FAIL ${err} ${url}`);
        }
    });
    page.on('response', async res => {
        const url = res.url();
        const status = res.status();
        if (status >= 400 && status < 600 && (url.includes('telescope') || url.includes('127.0.0.1'))) {
            // Ignore 419 (CSRF) for toggle-recording in headless — it needs session
            if (url.includes('toggle-recording') && status === 419) return;
            networkErrors.push(`HTTP ${status} ${url}`);
        }
    });
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

async function testPageLoad() {
    console.log('\n[1] Page load');
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 20000 });
    await wait(1500);

    const title = await page.title();
    log('info', 'title', title);

    // Vue mounts on #telescope-dashboard
    const hasMountPoint = (await page.$('#telescope-dashboard')) !== null;
    log(hasMountPoint ? 'pass' : 'fail', '#telescope-dashboard mount point exists');

    const bodyText = await page.evaluate(() => document.body.innerText.trim());
    log(bodyText.length > 20 ? 'pass' : 'fail', 'page has visible content', bodyText.slice(0, 60).replace(/\n/g, ' '));
}

async function testSidebarCollapse() {
    console.log('\n[2] Sidebar collapse toggle');

    const sidebar = await page.$('aside');
    if (!sidebar) { log('fail', 'aside element not found'); return; }

    const before = await sidebar.evaluate(el => el.offsetWidth);
    log('info', 'sidebar width before', `${before}px`);

    // First button in the page (the hamburger/collapse icon at top of sidebar)
    const collapseBtn = await page.$('button.p-1, button[class*="p-1"]');
    if (!collapseBtn) {
        // Try first button with only an SVG (icon-only)
        const btns = await page.$$('button');
        let found = null;
        for (const btn of btns) {
            const hasText = await btn.evaluate(el => el.textContent.trim().length > 0);
            if (!hasText) { found = btn; break; }
        }
        if (!found) { log('fail', 'collapse button not found'); return; }
        await found.click();
    } else {
        await collapseBtn.click();
    }

    await wait(500);
    const after = await sidebar.evaluate(el => el.offsetWidth);
    log('info', 'sidebar width after', `${after}px`);
    log(after !== before ? 'pass' : 'fail', 'sidebar width changed');

    // Restore
    const collapseBtn2 = await page.$('button.p-1, button[class*="p-1"]');
    if (collapseBtn2) { await collapseBtn2.click(); await wait(300); }
}

async function testThemeToggle() {
    console.log('\n[3] Theme toggle');
    // Navigate fresh so sidebar collapse state doesn't affect button visibility
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 20000 });
    await wait(1000);

    const getTheme = () => page.evaluate(() => ({
        isDark: document.documentElement.classList.contains('dark'),
    }));

    const before = await getTheme();
    log('info', 'theme before', `isDark=${before.isDark}`);

    // Theme button: in expanded sidebar has span text "Light mode"/"Dark mode"; in collapsed has title
    const themeBtnHandle = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => {
            const text = b.innerText.trim().toLowerCase();
            const title = (b.title || '').toLowerCase();
            return text.includes('light mode') || text.includes('dark mode') ||
                   title.includes('light mode') || title.includes('dark mode');
        }) || null;
    });
    const themeBtn = themeBtnHandle.asElement();
    if (!themeBtn) { log('fail', 'theme button not found'); return; }

    const titleBefore = await themeBtn.evaluate(el => el.title);
    log('info', 'theme button title', titleBefore);

    await themeBtn.click();
    await wait(400);

    const after = await getTheme();
    log('info', 'theme after', `isDark=${after.isDark}`);
    log(after.isDark !== before.isDark ? 'pass' : 'fail', 'theme toggled');

    // Restore
    await themeBtn.click();
    await wait(300);
}

async function testFilterPanel() {
    console.log('\n[4] Filter panel toggle');
    await page.goto(BASE + '#/queries', { waitUntil: 'networkidle0', timeout: 20000 });
    await wait(1500);

    // The filter panel uses v-show on a <form>
    const formInfo = await page.evaluate(() => {
        const form = document.querySelector('form');
        return form ? { display: getComputedStyle(form).display, h: form.offsetHeight } : null;
    });
    log('info', 'filter form before', JSON.stringify(formInfo));

    // Click the Filters button — find by innerText containing "Filters" (SVG icon + text)
    const filterBtnHandle = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.innerText.trim().includes('Filters')) || null;
    });
    const filterBtn = filterBtnHandle.asElement();
    if (!filterBtn) { log('fail', 'Filters button not found'); return; }

    await filterBtn.click();
    await wait(500);

    const formAfter = await page.evaluate(() => {
        const form = document.querySelector('form');
        return form ? { display: getComputedStyle(form).display, h: form.offsetHeight } : null;
    });
    log('info', 'filter form after', JSON.stringify(formAfter));
    log(JSON.stringify(formInfo) !== JSON.stringify(formAfter) ? 'pass' : 'fail', 'filter panel toggled');

    // Restore
    await filterBtn.click();
    await wait(300);
}

async function testRowExpandChevron() {
    console.log('\n[5] Row expand chevron');
    await page.goto(BASE + '#/queries', { waitUntil: 'networkidle0', timeout: 20000 });
    await wait(2500);

    const rowsBefore = await page.$$('tbody tr');
    log('info', 'rows before', rowsBefore.length);

    if (rowsBefore.length === 0) {
        log('fail', 'no rows — cannot test chevron');
        return;
    }

    await rowsBefore[0].click();
    await wait(1200);

    const rowsAfter = await page.$$('tbody tr');
    log('info', 'rows after click', rowsAfter.length);
    log(rowsAfter.length > rowsBefore.length ? 'pass' : 'fail', 'detail row appeared after row click');

    if (rowsAfter.length > rowsBefore.length) {
        const detailContent = await page.evaluate(() => {
            const rows = document.querySelectorAll('tbody tr');
            return rows[1] ? rows[1].innerText.trim().replace(/\n/g, ' ').slice(0, 120) : '';
        });
        log('info', 'detail row preview', detailContent);
        log(detailContent.length > 0 ? 'pass' : 'fail', 'detail row has content');
    }
}

async function testPauseRecordingButtons() {
    console.log('\n[6] Pause + Recording buttons');
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 20000 });
    await wait(1000);

    // Pause button: title "Pause Polling (Space)"
    const pauseBtn = await page.$('button[title="Pause Polling (Space)"]');
    if (!pauseBtn) {
        log('fail', 'Pause button not found (title="Pause Polling (Space)")');
    } else {
        await pauseBtn.click();
        await wait(300);
        const titleAfter = await pauseBtn.evaluate(el => el.title);
        log('info', 'pause button title after click', titleAfter);
        // isPaused toggles - the button stays same title but class changes
        const isActive = await pauseBtn.evaluate(el => el.className.includes('text-telescope-accent'));
        log(isActive ? 'pass' : 'fail', 'pause button became active (accent class)');
        await pauseBtn.click(); // restore
        await wait(300);
        log('pass', 'pause button found and clickable');
    }

    // Recording button: title "Toggle Recording"
    const recordingBtn = await page.$('button[title="Toggle Recording"]');
    log(recordingBtn !== null ? 'pass' : 'fail', 'Recording button found (title="Toggle Recording")');
}

async function testDetailPageNavigation() {
    console.log('\n[7] Entry detail page navigation');
    await page.goto(BASE + '#/queries', { waitUntil: 'networkidle0', timeout: 20000 });
    await wait(2500);

    // Find "Detail" text link
    const links = await page.$$('a');
    let detailLink = null;
    for (const a of links) {
        const txt = await a.evaluate(el => el.textContent.trim());
        if (txt === 'Detail') { detailLink = a; break; }
    }

    if (!detailLink) { log('fail', 'Detail link not found'); return; }

    await detailLink.click();
    await wait(2000);

    const url = page.url();
    log('info', 'navigated to', url);
    log(url.includes('/queries/') ? 'pass' : 'fail', 'navigated to entry detail URL');
}

async function dumpErrors() {
    console.log('\n[Console Errors Captured]');
    if (consoleErrors.length === 0) {
        log('pass', 'zero console errors');
    } else {
        consoleErrors.slice(0, 20).forEach(e => log('fail', 'console error', e));
    }

    console.log('\n[Network Errors Captured]');
    if (networkErrors.length === 0) {
        log('pass', 'zero network errors');
    } else {
        networkErrors.slice(0, 20).forEach(e => log('fail', 'network error', e));
    }
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    console.log('Telescope Dashboard Toggle Tests');
    console.log('================================\n');
    console.log('Target:', BASE);

    await setup();

    try {
        await testPageLoad();
        await testSidebarCollapse();
        await testThemeToggle();
        await testFilterPanel();
        await testRowExpandChevron();
        await testPauseRecordingButtons();
        await testDetailPageNavigation();
        await dumpErrors();
    } catch (err) {
        console.error('\nFATAL:', err.message);
        console.error(err.stack);
    } finally {
        await browser.close();
    }

    console.log('\n================================');
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    console.log(`Results: ${PASS} ${passed} passed  ${FAIL} ${failed} failed`);

    if (failed > 0) {
        console.log('\nFailed:');
        results.filter(r => r.status === 'fail').forEach(r =>
            console.log(`  - [${r.name}] ${r.detail}`)
        );
        process.exit(1);
    }
}

main();
