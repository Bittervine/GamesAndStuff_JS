from __future__ import annotations

import math
from pathlib import Path

try:
    from PIL import Image
except Exception as exc:
    raise SystemExit('Pillow is required: ' + str(exc))


OUT = Path(__file__).resolve().parent.parent / 'assets' / 'players_aura.png'
SIZE = 196
C = (SIZE - 1) * 0.5


def clamp(v: float, lo: float, hi: float) -> float:
    return lo if v < lo else hi if v > hi else v


def smoothstep(e0: float, e1: float, x: float) -> float:
    t = clamp((x - e0) / max(1e-6, (e1 - e0)), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def profile(d: float) -> tuple[float, float, float]:
    # Blue outer field + white inner body, with immediate falloff from center.
    blue = 0.0
    white = 0.0

    # White inner emission
    white += max(0.0, 1.0 - d / 0.18) ** 1.55
    white += clamp(1.0 - smoothstep(0.16, 0.68, d), 0.0, 1.0) * 0.08

    # Blue mid / outer emission
    blue += clamp(1.0 - smoothstep(0.04, 0.92, d), 0.0, 1.0) * 0.85
    blue += max(0.0, 1.0 - d / 0.55) ** 2.0 * 0.18

    # Strong center drop so no hard disk reads.
    center_cut = clamp(d / 0.05, 0.0, 1.0)
    white *= center_cut

    white = clamp(white, 0.0, 1.0)
    blue = clamp(blue, 0.0, 1.0)

    return white, 0.0, blue


def main() -> None:
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    px = img.load()
    for y in range(SIZE):
      dy = (y - C) / (SIZE * 0.5)
      for x in range(SIZE):
        dx = (x - C) / (SIZE * 0.5)
        d = math.hypot(dx, dy)
        w, g, b = profile(d)
        a = clamp(max(w, b), 0.0, 1.0)
        if a <= 0:
            continue
        # Premultiply colors manually for a softer baked sprite.
        px[x, y] = (
            int(round(255 * w)),
            int(round(255 * g)),
            int(round(255 * b)),
            int(round(255 * a)),
        )
    img.save(OUT)
    print(OUT)


if __name__ == '__main__':
    main()
