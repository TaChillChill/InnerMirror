// Browser-only: prepares a screenshot for upload. Re-drawing on a canvas downsizes it and
// drops EXIF metadata (location, device); the original file never leaves the device.
export const MAX_IMAGES = 10; // per conversation; sent 3 per request (src/lib/shot-batches.ts)
export const MAX_DIM = { width: 1280, height: 4096 };
const MAX_BYTES_EACH = 1_200_000; // 3 images (one request) stay under Vercel's 4.5 MB body limit as base64

export type ImageError = "format" | "decode" | "large";

export async function prepareImage(file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) throw new Error("format" satisfies ImageError);
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); } catch { throw new Error("decode" satisfies ImageError); }
  // Only shrink: small screenshots are kept at their size so text stays sharp.
  const scale = Math.min(1, MAX_DIM.width / bitmap.width, MAX_DIM.height / bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("decode" satisfies ImageError);
  ctx.fillStyle = "#fff"; // transparent PNGs would turn black as JPEG
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  try {
    for (const quality of [0.85, 0.7, 0.55]) {
      const url = canvas.toDataURL("image/jpeg", quality);
      if (url.length <= MAX_BYTES_EACH) return url;
    }
    throw new Error("large" satisfies ImageError);
  } finally {
    // iOS Safari caps total canvas memory and frees it late; with 10 screenshots of ~12 MB
    // each, releasing every canvas right away keeps a second batch of picks from failing.
    canvas.width = canvas.height = 0;
  }
}
