from pathlib import Path
from PIL import Image
import sys

def halve_luminance(input_dir: str, output_dir: str):
    src = Path(input_dir)
    dst = Path(output_dir)
    dst.mkdir(parents=True, exist_ok=True)

    for png in sorted(src.glob("*.png")):
        img = Image.open(png).convert("RGBA")
        pixels = list(img.getdata())

        out_pixels = []
        for r, g, b, a in pixels:
            r = max(0, min(255, int(round(r * 0.5))))
            g = max(0, min(255, int(round(g * 0.5))))
            b = max(0, min(255, int(round(b * 0.5))))
            out_pixels.append((r, g, b, a))

        out = Image.new("RGBA", img.size)
        out.putdata(out_pixels)
        out.save(dst / png.name)
        print(f"wrote {dst / png.name}")

halve_luminance(".", ".")
