// S1: up to 10 screenshots. Read in parts of 3 (2 at a time), joined in order with the
// overlap at each seam listed once; a failed part keeps the others (retry only sends what
// failed, or continue without it); limits, large images, Back/Next. All /api/* mocked.
//   node scripts/e2e/s1-shots.mjs <width> <en|vi>
import { launch, HELPERS } from "./cdp.mjs";

const width = Number(process.argv[2] ?? 390);
const lang = process.argv[3] ?? "en";
const L = {
  en: { start: "I have the chat", next: "Continue", back: "Back", retry: "Try those again", without: "Continue without them", again: "Read it again", added: (n) => `${n}/10 screenshots added`, partial: "Screenshots 4–6 couldn't be read", skipped: "Screenshots 4–6 weren't read", tooMany: "so 2 weren't added", large: "too large even after shrinking", rate: "Too many tries", merged: "listed once" },
  vi: { start: "Có sẵn cuộc trò chuyện", next: "Tiếp tục", back: "Quay lại", retry: "Thử đọc lại các ảnh đó", without: "Tiếp tục mà không có các ảnh đó", again: "Đọc lại", added: (n) => `Đã thêm ${n}/10 ảnh`, partial: "Chưa đọc được ảnh 4–6", skipped: "Ảnh 4–6 chưa được đọc", tooMany: "nên 2 ảnh chưa được thêm", large: "vẫn quá lớn", rate: "nhiều lần quá", merged: "liệt kê một lần" },
}[lang];

// The fake model: screenshot n shows 3 lines and repeats the previous screenshot's last
// line at its top. Inside one request it merges that overlap itself, as the real prompt asks.
const index = new Map(); // image fingerprint → screenshot number (1-based)
const fail = new Set(); // screenshot numbers whose part answers an error
let failWith = { __status: 502, __body: { error: "upstream" } };
const lines = (n) => [...(n > 1 ? [`line ${n - 1}.3 said by Jordan`] : []), `line ${n}.1 said by Jordan`, `line ${n}.2 said by Alex`, `line ${n}.3 said by Jordan`];
const speakerOf = (text) => (/by Jordan/.test(text) ? "J" : "A");
const fp = (url) => url; // whole data URL: JPEG endings of similar images can be identical
const body = (req) => JSON.parse(req.postData ?? Buffer.concat((req.postDataEntries ?? []).map((e) => Buffer.from(e.bytes, "base64"))).toString());
const extract = (req) => {
  const shots = body(req).images.map((u) => index.get(fp(u)));
  if (shots.some((n) => fail.has(n))) return failWith;
  const texts = shots.flatMap(lines).filter((t, i, all) => t !== all[i - 1]);
  // Odd parts number the speakers the other way round, as a separate model call may.
  const swap = shots[0] % 2 === 0;
  const key = (who) => ((who === "J") !== swap ? "S1" : "S2");
  return { extraction: {
    speakers: [{ key: key("J"), displayedName: "Jordan", side: "left" }, { key: key("A"), displayedName: null, side: "right" }].sort((a, b) => a.key.localeCompare(b.key)),
    messages: texts.map((text) => ({ speaker: key(speakerOf(text)), text, legibility: "clear" })), notes: [] } };
};

const b = await launch({ width, mocks: { "/api/extract": extract } });
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
const calls = () => b.api.filter((p) => p === "/api/extract").length;
try {
  await b.goto("http://localhost:3123/");
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
  const fresh = async () => {
    await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.lang", ${JSON.stringify(lang)}); location.reload()`);
    await b.sleep(1500);
    await step(`$click(".lp-cta"); $wait(300)`);
    await step(`$click("[role=radio]", ${JSON.stringify(L.start)}); $wait(200)`);
  };
  // Drops numbered test images (n = screenshot label; the same label twice = the same file).
  const drop = (labels, opts = {}) => step(`(async () => {
    const mk = async (n) => { const c = document.createElement("canvas"); c.width = ${opts.w ?? 160}; c.height = ${opts.h ?? 320}; const g = c.getContext("2d");
      if (${!!opts.noise}) { const d = g.createImageData(c.width, c.height); for (let i = 0; i < d.data.length; i++) d.data[i] = Math.random() * 255; g.putImageData(d, 0, 0); }
      else { g.fillStyle = "hsl(" + n * 33 + " 70% 60%)"; g.fillRect(0, 0, c.width, c.height); g.fillStyle = "#000"; g.font = "bold 80px sans-serif"; g.fillText(String(n), 30, 120); }
      return new File([await new Promise((r) => c.toBlob(r, "image/png"))], n + ".png", { type: "image/png" }); };
    const dt = new DataTransfer(); for (const n of ${JSON.stringify(labels)}) dt.items.add(await mk(n));
    document.querySelector(".app-drop").dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
    await $wait(${opts.wait ?? 400 + labels.length * 120}); return true; })()`);
  // Registers the thumbnails on screen as screenshots 1..n for the fake model.
  const register = async (labels) => {
    const fps = await step(`[...document.querySelectorAll(".app-shot img")].map((i) => i.src)`);
    fps.forEach((f, i) => index.set(f, labels[i]));
    return fps.length;
  };
  const read = async () => {
    await step(`(() => { const c = document.querySelector(".app-panel .im-check input"); if (!c.checked) c.click(); })(); $wait(100)`);
    await step(`$click(".app-actions button", ${JSON.stringify(L.next)}); $wait(1500)`);
  };
  const bubbles = () => step(`[...document.querySelectorAll(".app-rv-bubble")].map((e) => (e.textContent.match(/line \\d+\\.\\d/) ?? ["?"])[0])`);
  const expected = (n) => Array.from({ length: n }, (_, i) => [1, 2, 3].map((k) => `line ${i + 1}.${k}`)).flat();
  const noOverflow = () => step(`document.documentElement.scrollWidth <= innerWidth`);

  for (const n of [1, 3, 5, 10]) {
    await fresh();
    const labels = Array.from({ length: n }, (_, i) => i + 1);
    await drop(labels);
    await register(labels);
    check(`${n}: counter shows ${n}/10`, await step(`document.body.innerText.includes(${JSON.stringify(L.added(n))})`));
    const before = calls();
    await read();
    const got = await bubbles();
    check(`${n}: ${Math.ceil(n / 3)} extract call(s), ${3 * n} messages in order, seams merged`, calls() - before === Math.ceil(n / 3) && JSON.stringify(got) === JSON.stringify(expected(n)), `${calls() - before} calls; ${got.length} msgs`);
    check(`${n}: two people across parts`, await step(`document.querySelectorAll(".app-who__opt").length === 2`));
    if (n > 3) check(`${n}: overlap note shown`, await step(`document.body.innerText.includes(${JSON.stringify(L.merged)})`));
    if (n === 10) {
      check("10: no horizontal overflow on Review", await noOverflow());
      // Back keeps all 10 in order; unchanged → Review again with no call.
      await step(`$click("button", ${JSON.stringify(L.back)}); $wait(400)`);
      const kept = await step(`[...document.querySelectorAll(".app-shot img")].map((i) => i.src)`);
      check("10: Back keeps the 10 screenshots in order", kept.length === 10 && kept.every((f, i) => index.get(f) === i + 1));
      check("10: Add button off at the limit, no overflow", await step(`[...document.querySelectorAll(".app-drop button")].every((x) => x.disabled)`) && await noOverflow());
      const c0 = calls();
      await step(`$click(".app-actions button", ${JSON.stringify(L.next)}); $wait(600)`);
      check("10: Next again → same Review, no new call", calls() === c0 && (await bubbles()).length === 30);
      // Lightbox walks all 10.
      await step(`$click("button", ${JSON.stringify(L.back)}); $wait(400)`);
      await step(`document.querySelectorAll(".app-shot__open")[9].click(); $wait(300)`);
      check("10: lightbox opens screenshot 10 of 10", await step(`/10\\D+10/.test(document.querySelector(".app-lb__count").textContent)`));
      await step(`document.querySelector(".app-lb").close(); $wait(200)`);
      // Remove one → 9/10, adding is possible again.
      await step(`document.querySelectorAll(".app-shot__tools button")[2].click(); $wait(200)`);
      check("10: remove → 9/10 and Add is back", await step(`document.body.innerText.includes(${JSON.stringify(L.added(9))}) && !document.querySelector(".app-drop button").disabled`));
    }
  }

  // Same screenshot twice across a seam (3 and 4 are the same file): listed once.
  await fresh();
  await drop([1, 2, 3, 3, 4, 5]);
  await register([1, 2, 3, 3, 4, 5]);
  await read();
  const dup = await bubbles();
  check("duplicate screenshot across a seam: messages listed once", JSON.stringify(dup) === JSON.stringify(expected(5)), dup.join(","));

  // Part 2 (screenshots 4–6) fails: the rest is kept; retry sends only that part.
  await fresh();
  const ten = Array.from({ length: 10 }, (_, i) => i + 1);
  await drop(ten); await register(ten);
  fail.add(5);
  let c0 = calls();
  await read();
  check("partial failure: notice names screenshots 4–6, stays on Add", await step(`!!$t(".app-partial", ${JSON.stringify(L.partial)}) && !document.querySelector(".app-rv-thread")`), `${calls() - c0} calls`);
  check("partial failure: 4 calls, no overflow", calls() - c0 === 4 && await noOverflow());
  fail.clear();
  c0 = calls();
  await step(`$click(".app-partial button", ${JSON.stringify(L.retry)}); $wait(1200)`);
  check("retry sends only the failed part → full Review", calls() - c0 === 1 && JSON.stringify(await bubbles()) === JSON.stringify(expected(10)), `${calls() - c0} calls`);

  // Same failure, then continue without: Review says what's missing; Back + read again fills it.
  await fresh();
  await drop(ten); await register(ten);
  fail.add(5);
  await read();
  await step(`$click(".app-partial button", ${JSON.stringify(L.without)}); $wait(600)`);
  const partial = await bubbles();
  // Screenshots 1–3 and 7–10: 7 × 3 lines, plus line 6.3 that screenshot 7 repeats at its top.
  check("continue without: Review with 7 screenshots' messages and a notice", partial.length === 22 && await step(`document.body.innerText.includes(${JSON.stringify(L.skipped)})`), `${partial.length} msgs`);
  fail.clear();
  await step(`$click("button", ${JSON.stringify(L.back)}); $wait(400)`);
  c0 = calls();
  await read(); // consent is asked again on a new visit to Add
  const asked = await step(`!!document.querySelector(".app-panel .im-notice button")`);
  if (asked) await step(`$click(".app-panel .im-notice button", ${JSON.stringify(L.again)}); $wait(1200)`);
  check("Back + read again: only the missing part is sent, Review complete", calls() - c0 === 1 && JSON.stringify(await bubbles()) === JSON.stringify(expected(10)), `asked ${asked}, ${calls() - c0} calls`);

  // Rate limited: no more parts are sent after the refusal.
  await fresh();
  await drop(ten); await register(ten);
  failWith = { __status: 429, __body: { error: "rate_limited" } };
  ten.forEach((n) => fail.add(n));
  c0 = calls();
  await read();
  check("rate limited: stops after the parts in flight (≤ 2 calls), says why", calls() - c0 <= 2 && await step(`document.body.innerText.includes(${JSON.stringify(L.rate)})`), `${calls() - c0} calls`);
  fail.clear();
  failWith = { __status: 502, __body: { error: "upstream" } };

  // 12 at once → 10 kept, the message says 2 were left out.
  await fresh();
  await drop(Array.from({ length: 12 }, (_, i) => i + 1));
  check("12 dropped → 10 added, 2 left out explained", await step(`document.querySelectorAll(".app-shot").length === 10 && document.body.innerText.includes(${JSON.stringify(L.tooMany)})`));

  // Large images: a huge plain one is shrunk and kept; a huge noisy one is refused, others stay.
  await fresh();
  await drop([1], { w: 4000, h: 9000, wait: 4000 });
  const big = await step(`(() => { const i = document.querySelector(".app-shot img"); return i ? i.src.length : 0; })()`);
  check("4000×9000 screenshot shrunk under 1.2 MB and kept", big > 0 && big <= 1_200_000, `${Math.round(big / 1024)} KB`);
  await drop([2], { w: 1280, h: 4096, noise: true, wait: 5000 });
  check("an image too large even after shrinking: explained, the first one kept", await step(`document.querySelectorAll(".app-shot").length === 1 && document.body.innerText.includes(${JSON.stringify(L.large)})`));
  check("no horizontal overflow on Add", await noOverflow());
  check("no API call before consent + Continue (only extract was ever called)", b.api.every((p) => p === "/api/extract"));
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width} ${lang}\n` + results.join("\n") + `\nAPI requests: ${b.api.length} (${[...new Set(b.api)].join(", ")})`);
  b.close();
}
