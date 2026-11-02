// Renders the three synthetic screenshots (390 × 844 at 3×, like a phone) into shots/out/.
// Usage (from design/film): node shots/render.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { launch } from "../../../scripts/e2e/cdp.mjs";

const here = fileURLToPath(new URL(".", import.meta.url));
mkdirSync(`${here}out`, { recursive: true });
const b = await launch({ width: 390, height: 844 });
try {
  await b.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  for (const part of [1, 2, 3]) {
    await b.goto(`file://${here}chat.html?part=${part}`);
    writeFileSync(`${here}out/chat-${part}.png`, await b.screenshot());
    console.log(`shots/out/chat-${part}.png`);
  }
} finally { b.close(); }
