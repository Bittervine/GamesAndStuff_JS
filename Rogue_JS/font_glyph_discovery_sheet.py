from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
FONTS = {
    "NotoColorEmoji": ROOT / "fonts" / "NotoColorEmoji_WindowsCompatible.ttf",
    "SegoeEmoji": Path(r"C:\Windows\Fonts\seguiemj.ttf"),
}

OUT = ROOT / "Font_Glyph_Discovery.png"

# label, codepoint
CANDIDATES = [
    ("Chain 1", 0x26A1),   # ⚡
    ("Chain 2", 0x2726),   # ✦
    ("Chain 3", 0x2605),   # ★
    ("Chain 4", 0x2733),   # ✳
    ("Chain 5", 0x1F4AB),  # 💫
    ("Chain 6", 0x1F300),  # 🌀
    ("Chain 7", 0x1F329),  # 🌩
    ("Chain 8", 0x26C8),   # ⛈
    ("Poison 1", 0x2623),  # ☣
    ("Poison 2", 0x2620),  # ☠
    ("Poison 3", 0x2697),  # ⚗
    ("Poison 4", 0x1F9EA), # 🧪
    ("Poison 5", 0x1FAB0), # 🪰
    ("Poison 6", 0x1F571), # 🕱
    ("Poison 7", 0x1F32B), # 🌫
    ("Poison 8", 0x1F4A8), # 💨
]


def cp(n: int) -> str:
    return chr(n)


def render_cell(draw: ImageDraw.ImageDraw, img: Image.Image, rect, font, glyph: str, color):
    x0, y0, x1, y1 = rect
    draw.rectangle((x0, y0, x1, y1), outline=(170, 170, 170), width=1)
    try:
        bbox = draw.textbbox((0, 0), glyph, font=font, embedded_color=True)
    except Exception:
        bbox = draw.textbbox((0, 0), glyph, font=font)
    w = max(1, bbox[2] - bbox[0])
    h = max(1, bbox[3] - bbox[1])
    cx = x0 + (x1 - x0 - w) // 2 - bbox[0]
    cy = y0 + (y1 - y0 - h) // 2 - bbox[1]
    try:
        draw.text((cx, cy), glyph, font=font, embedded_color=True)
    except Exception:
        draw.text((cx, cy), glyph, font=font, fill=color)


def main():
    # Layout
    left_w = 190
    col_w = 210
    top_h = 54
    row_h = 140
    headers = [
        "Color: Noto FE0F",
        "Color: Noto FE0E",
        "Mono: Segoe FE0E",
        "Mono: Segoe FE0F",
    ]
    width = left_w + col_w * len(headers)
    height = top_h + row_h * len(CANDIDATES)

    # Fonts
    def load_font(path: Path, preferred):
        # Some color emoji fonts only expose fixed strike sizes.
        for sz in preferred:
            try:
                return ImageFont.truetype(str(path), sz, layout_engine=ImageFont.Layout.BASIC), sz
            except OSError:
                continue
        raise OSError(f"No supported strike size for {path}")

    noto, _ = load_font(FONTS["NotoColorEmoji"], [136, 128, 109, 96, 72, 64, 48, 40, 32, 24, 20, 16])
    segoe, _ = load_font(FONTS["SegoeEmoji"], [136, 128, 109, 96, 88, 80, 72, 64, 56, 48, 40, 32])
    ui = ImageFont.load_default()

    img = Image.new("RGBA", (width, height), (244, 244, 244, 255))
    d = ImageDraw.Draw(img)

    d.rectangle((0, 0, width, top_h), fill=(35, 35, 35, 255))
    d.text((8, 18), "Candidate", font=ui, fill=(255, 255, 255, 255))
    for i, h in enumerate(headers):
        d.text((left_w + i * col_w + 8, 18), h, font=ui, fill=(255, 255, 255, 255))

    for r, (label, code) in enumerate(CANDIDATES):
        y0 = top_h + r * row_h
        y1 = y0 + row_h
        bg = (255, 255, 255, 255) if r % 2 == 0 else (236, 236, 236, 255)
        d.rectangle((0, y0, width, y1), fill=bg)
        d.text((8, y0 + 10), label, font=ui, fill=(0, 0, 0, 255))
        d.text((8, y0 + 28), f"U+{code:04X}", font=ui, fill=(70, 70, 70, 255))

        base = cp(code)
        fe0f = base + cp(0xFE0F)
        fe0e = base + cp(0xFE0E)

        cells = [
            (noto, fe0f, (20, 20, 20, 255)),
            (noto, fe0e, (20, 20, 20, 255)),
            (segoe, fe0e, (20, 20, 20, 255)),
            (segoe, fe0f, (20, 20, 20, 255)),
        ]
        for c, (font, glyph, fallback_color) in enumerate(cells):
            x0 = left_w + c * col_w + 10
            x1 = x0 + col_w - 20
            gy0 = y0 + 10
            gy1 = y1 - 28
            render_cell(d, img, (x0, gy0, x1, gy1), font, glyph, fallback_color)
            d.text((x0 + 4, y1 - 20), "-".join(f"{ord(ch):04X}" for ch in glyph), font=ui, fill=(90, 90, 90, 255))

    img.save(OUT)
    print(str(OUT))


if __name__ == "__main__":
    main()
