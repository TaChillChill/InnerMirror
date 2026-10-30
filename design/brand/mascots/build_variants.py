"""Build mascot display variants from the Founder's source PNGs.

Usage (from repo root, needs Pillow + numpy):
    python3 design/brand/mascots/build_variants.py

source/<code>.png  exact copies of the approved 1024x1024 transparent PNGs. Never edited.
full/<code>-512.png, full/<code>-256.png
    Full body on a square transparent canvas. All five share one crop size, so the
    characters keep their relative scale (Child mascots stay smaller and rounder).
badge/<code>-128.png
    Square head crop for circular badges (28-64px). Per-mascot box around the face,
    keeping the identifying prop where it fits (NP's heart, A's magnifier).

Cleanup applied to variants only: detached specks under MAX_SPECK px (export leftovers,
e.g. a thin arc above FC and AC) are made transparent. The artwork itself is untouched.
"""
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
CODES = ["cp", "np", "a", "fc", "ac"]
VISIBLE = 24          # alpha above this counts as visible ink
MAX_SPECK = 300       # detached components smaller than this are export leftovers
FULL_SIDE = 680       # shared crop side on the 1024 canvas; NP (widest, 614px) keeps ~5% padding
# Face-centered badge boxes on the 1024 canvas: (center_x, center_y, side).
BADGE = {
    "cp": (476, 450, 480),
    "np": (492, 450, 520),
    "a": (488, 440, 480),
    "fc": (505, 480, 430),
    "ac": (482, 490, 420),
}


def remove_specks(img: Image.Image) -> Image.Image:
    rgba = np.array(img)
    visible = rgba[..., 3] > VISIBLE
    seen = np.zeros_like(visible)
    h, w = visible.shape
    for y0, x0 in zip(*np.nonzero(visible)):
        if seen[y0, x0]:
            continue
        queue, pixels = deque([(y0, x0)]), []
        seen[y0, x0] = True
        while queue:
            y, x = queue.popleft()
            pixels.append((y, x))
            for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= ny < h and 0 <= nx < w and visible[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    queue.append((ny, nx))
        if len(pixels) < MAX_SPECK:
            ys, xs = zip(*pixels)
            # Clear the speck plus its 2px anti-aliased fringe.
            rgba[max(min(ys) - 2, 0):max(ys) + 3, max(min(xs) - 2, 0):max(xs) + 3, 3] = 0
    return Image.fromarray(rgba)


def square_crop(img: Image.Image, cx: int, cy: int, side: int) -> Image.Image:
    half = side // 2
    return img.crop((cx - half, cy - half, cx - half + side, cy - half + side))


def save(img: Image.Image, path: Path, size: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.resize((size, size), Image.LANCZOS).save(path, optimize=True)


def main() -> None:
    for code in CODES:
        src = Image.open(ROOT / "source" / f"{code}.png").convert("RGBA")
        clean = remove_specks(src)
        box = clean.getchannel("A").point(lambda v: 255 if v > VISIBLE else 0).getbbox()
        cx, cy = (box[0] + box[2]) // 2, (box[1] + box[3]) // 2
        full = square_crop(clean, cx, cy, FULL_SIDE)
        save(full, ROOT / "full" / f"{code}-512.png", 512)
        save(full, ROOT / "full" / f"{code}-256.png", 256)
        bx, by, side = BADGE[code]
        save(square_crop(clean, bx, by, side), ROOT / "badge" / f"{code}-128.png", 128)
        print(f"{code}: ink box {box}, full centered at ({cx}, {cy})")


if __name__ == "__main__":
    main()
