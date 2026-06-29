import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8000/telescope-dashboard/', { waitUntil: 'networkidle0', timeout: 20000 });
await new Promise(r => setTimeout(r, 1500));

// Collapse sidebar first (like the test does)
const collapseBtn = await page.$('button.p-1');
if (collapseBtn) {
    console.log('collapse btn found');
    await collapseBtn.click();
    await new Promise(r => setTimeout(r, 500));
    await collapseBtn.click(); // restore
    await new Promise(r => setTimeout(r, 300));
} else {
    console.log('no p-1 button');
}

// Now find all buttons and their titles
const btns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.textContent.trim().slice(0, 30),
        title: b.title,
        visible: b.offsetWidth > 0 && b.offsetHeight > 0,
    }));
});
console.log(JSON.stringify(btns, null, 2));

await browser.close();
