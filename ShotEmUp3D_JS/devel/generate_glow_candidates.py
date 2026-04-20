from __future__ import annotations

import math
from pathlib import Path

try:
    from PIL import Image
except Exception as exc:
    raise SystemExit('Pillow is required: ' + str(exc))

OUT_DIR = Path(__file__).resolve().parent.parent / 'assets'
SIZE = 256
CENTER = (SIZE - 1) * 0.5


def clamp(v: float, lo: float, hi: float) -> float:
    return lo if v < lo else hi if v > hi else v


def smoothstep(edge0: float, edge1: float, x: float) -> float:
    if edge0 == edge1:
        return 0.0 if x < edge0 else 1.0
    t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def falloff_profile(name: str, d: float) -> float:
    if name == 'a':
        core = 0.07; mid = 0.62; outer = 1.00; curve = 1.55; halo_boost = 0.10
    elif name == 'b':
        core = 0.05; mid = 0.56; outer = 1.05; curve = 1.85; halo_boost = 0.07
    elif name == 'c':
        core = 0.03; mid = 0.50; outer = 1.12; curve = 2.10; halo_boost = 0.05
    elif name == 'e':
        core = 0.00; mid = 0.28; outer = 1.18; curve = 1.95; halo_boost = 0.02
    else:
        core = 0.02; mid = 0.44; outer = 1.20; curve = 2.45; halo_boost = 0.03

    if d <= core:
        return 1.0
    if d >= outer:
        return 0.0

    t = smoothstep(core, outer, d)
    body = (1.0 - t) ** curve
    halo = clamp(1.0 - smoothstep(mid, outer, d), 0.0, 1.0) * halo_boost
    return clamp(body + halo, 0.0, 1.0)


def tint_for(name: str) -> tuple[int, int, int]:
    return {'white': (255, 255, 255), 'red': (255, 64, 48), 'green': (88, 255, 136), 'blue': (0, 0, 255)}[name]


def make_image(profile: str, tint_name: str) -> Image.Image:
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    px = img.load()
    tr, tg, tb = tint_for(tint_name)
    base_radius = 96.0
    alpha_scale = {'a': 1.00, 'b': 0.92, 'c': 0.80, 'd': 0.68, 'e': 0.72}[profile]
    for y in range(SIZE):
        dy = y - CENTER
        for x in range(SIZE):
            dx = x - CENTER
            d = math.hypot(dx, dy) / base_radius
            a = falloff_profile(profile, d) * alpha_scale
            if a <= 0.0:
                continue
            a = a ** 0.94
            px[x, y] = (int(tr), int(tg), int(tb), int(round(255.0 * clamp(a, 0.0, 1.0))))
    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for profile in 'abcde':
        for tint in ('white', 'red', 'green', 'blue'):
            img = make_image(profile, tint)
            out = OUT_DIR / f'glow_{profile}_{tint}.png'
            img.save(out)
            print(out)


if __name__ == '__main__':
    main()
