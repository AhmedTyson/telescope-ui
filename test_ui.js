const puppeteer = require("puppeteer");
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    let apiResponse = null;
    page.on("response", async resp => {
        if (resp.url().includes("/api/entries")) {
            try { apiResponse = await resp.json(); } catch(e) {}
        }
    });

    await page.goto("http://127.0.0.1:8000/telescope-dashboard/#/commands", { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 3000));

    console.log("API data count:", apiResponse?.data?.length ?? "N/A");
    console.log("API has_more:", apiResponse?.has_more);
    if (apiResponse?.data?.length > 0) {
        console.log("First entry keys:", Object.keys(apiResponse.data[0]).join(", "));
        console.log("First entry type:", apiResponse.data[0].type);
    } else {
        console.log("Full API response:", JSON.stringify(apiResponse).substring(0, 500));
    }

    // Check DOM
    const dom = await page.evaluate(() => {
        const tbl = document.querySelector("table");
        if (!tbl) return "NO TABLE";
        const rows = tbl.querySelectorAll("tbody tr");
        return { rows: rows.length, headers: Array.from(tbl.querySelectorAll("th")).map(h => h.innerText) };
    });
    console.log("DOM:", JSON.stringify(dom));

    await page.screenshot({ path: "screenshot.png" });
    await browser.close();
})();
