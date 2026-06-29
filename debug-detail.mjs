import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();

// Intercept the detail API response
const detailResponses = [];
page.on('response', async res => {
    if (res.url().includes('/detail')) {
        try {
            const json = await res.json();
            detailResponses.push({ url: res.url(), data: json });
        } catch {}
    }
});

await page.goto('http://127.0.0.1:8000/telescope-dashboard/#/queries', { waitUntil: 'networkidle0', timeout: 20000 });
await new Promise(r => setTimeout(r, 2500));

// Click first row to trigger detail fetch
const rows = await page.$$('tbody tr');
if (rows.length) await rows[0].click();
await new Promise(r => setTimeout(r, 1500));

console.log('Detail API responses:');
detailResponses.forEach(r => {
    console.log('URL:', r.url);
    console.log('Data:', JSON.stringify(r.data, null, 2));
});

await browser.close();
