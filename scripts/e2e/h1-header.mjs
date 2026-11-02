// Regression (Founder 2026-11-02): on My Reflection, the state cloud's mascots (inline z-index
// up to 10) drew over the sticky header (z-index 10) when scrolled under it. Scrolls each cloud
// under the header and checks that the header is the topmost element there. No API calls.
import { launch, HELPERS } from "./cdp.mjs";
import { seedCollections } from "../../design/film/record/seed.mjs";

const width = Number(process.argv[2] ?? 1280);
const theme = process.argv[3] ?? "dark";
const b = await launch({ width, height: 800 });
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
try {
  await b.goto("http://localhost:3123/");
  await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.lang", "en"); localStorage.setItem("innermirror.theme", ${JSON.stringify(theme)});
    localStorage.setItem("innermirror.collections.v1", ${JSON.stringify(JSON.stringify(seedCollections()))}); location.reload()`);
  await b.sleep(1500);
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
  await step(`document.querySelector(".app-bar__mirror").click(); $wait(600)`);
  const clouds = await step(`document.querySelectorAll(".app-cloud").length`);
  check("My Reflection shows state clouds", clouds > 0, `${clouds}`);
  // Sweep the page so every cloud passes under the sticky header; wherever a mascot crosses
  // the header, the header must be what is painted on top.
  const over = JSON.parse(await step(`(async () => {
    const header = document.querySelector(".app-header");
    const hits = new Set(); let tested = 0;
    const cloudTop = Math.min(...[...document.querySelectorAll(".app-cloud")].map((c) => c.getBoundingClientRect().top + scrollY));
    for (let y0 = Math.max(0, cloudTop - 400); y0 <= cloudTop + 300; y0 += 16) {
      window.scrollTo(0, y0);
      await $wait(30);
      const hb = header.getBoundingClientRect();
      for (const m of document.querySelectorAll(".app-cloud > *")) {
        const r = m.getBoundingClientRect();
        const top = Math.max(r.top, hb.top), bottom = Math.min(r.bottom, hb.bottom);
        const x = r.left + r.width / 2;
        if (bottom - top < 8 || x < 0 || x > innerWidth) continue;
        tested++;
        const el = document.elementFromPoint(x, (top + bottom) / 2);
        if (!header.contains(el)) hits.add(el ? el.tagName.toLowerCase() + "." + String(el.className).slice(0, 30) : "nothing");
      }
    }
    return JSON.stringify({ hits: [...hits], tested });
  })()`));
  check("cloud mascots could be scrolled under the header", over.tested > 0, `${over.tested}`);
  check("header stays above every cloud mascot when scrolled", over.hits.length === 0, over.hits.join(", "));
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width} ${theme}\n` + results.join("\n") + `\nAPI requests: ${JSON.stringify(b.api)}`);
  b.close();
}
