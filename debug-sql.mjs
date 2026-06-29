import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8000/telescope-dashboard/#/queries', { waitUntil: 'networkidle0', timeout: 20000 });
await new Promise(r => setTimeout(r, 2500));

const rows = await page.$$('tbody tr');
console.log('rows:', rows.length);
if (rows.length) {
    await rows[0].click();
    await new Promise(r => setTimeout(r, 1200));

    const rowsAfter = await page.$$('tbody tr');
    console.log('rows after expand:', rowsAfter.length);

    if (rowsAfter.length > rows.length) {
        const detail = await rowsAfter[1].evaluate(el => el.innerText.trim());
        console.log('detail row text:\n' + detail);
    }
}

await browser.close();
