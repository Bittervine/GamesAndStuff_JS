from pathlib import Path
from typing import Dict, List, Tuple

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "Spell_Icon_Candidate_Wide.png"

FONT_COLOR = ROOT / "fonts" / "NotoColorEmoji_WindowsCompatible.ttf"
FONT_MONO = Path(r"C:\Windows\Fonts\seguisym.ttf")
UI_FONT = Path(r"C:\Windows\Fonts\segoeui.ttf")


# Spell -> (label, candidates as codepoints)
SPELL_CANDIDATES: Dict[str, Tuple[str, List[int]]] = {
    "stone_skin": (
        "Earth Shield / Stone Skin",
        [0x1F6E1, 0x1FAA8, 0x1F9F1, 0x26F0, 0x1F5FF, 0x26AB, 0x25A0, 0x25C6],
    ),
    "poison_cloud": (
        "Poison Cloud",
        [0x2623, 0x2620, 0x2697, 0x1F9EA, 0x1F32B, 0x1F4A8, 0x1F578, 0x2733],
    ),
    "teleport": (
        "Teleport",
        [0x1F300, 0x2605, 0x2726, 0x2728, 0x1F573, 0x1F6AA, 0x27A6, 0x1F4AB],
    ),
    "chain_storm": (
        "Lightning Storm / Chain Storm",
        [0x1F329, 0x26A1, 0x26C8, 0x1F4A5, 0x2733, 0x223F, 0x1F300, 0x1F4A1],
    ),
    "mana_tide": (
        "Mana Tide",
        [0x1F30A, 0x1F4A7, 0x2652, 0x1F4A6, 0x1FAE7, 0x1F537, 0x1F53C, 0x223F],
    ),
    "heal": (
        "Heal (etc)",
        [0x2695, 0x2764, 0x2726, 0x2694, 0x2729, 0x1FA79, 0x1FA78, 0x271A],
    ),
}


def cp(n: int) -> str:
    return chr(n)


def load_font(path: Path, sizes: List[int]):
    last = None
    for s in sizes:
        try:
            return ImageFont.truetype(str(path), s, layout_engine=ImageFont.Layout.BASIC)
        except Exception as exc:  # noqa: BLE001
            last = exc
    raise RuntimeError(f"Cannot load {path} at supported sizes: {last}")


def draw_centered_glyph(
    draw: ImageDraw.ImageDraw,
    img: Image.Image,
    box: Tuple[int, int, int, int],
    glyph: str,
    font: ImageFont.FreeTypeFont,
    color: Tuple[int, int, int, int],
    use_embedded_color: bool,
):
    x0, y0, x1, y1 = box
    draw.rectangle((x0, y0, x1, y1), outline=(170, 170, 170, 255), width=1)
    bw = max(1, x1 - x0)
    bh = max(1, y1 - y0)

    # Render on a large scratch surface, crop glyph bounds, then scale into the target box.
    scratch = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    sd = ImageDraw.Draw(scratch)
    try:
        if use_embedded_color:
            sd.text((256, 256), glyph, font=font, embedded_color=True, anchor="mm")
        else:
            sd.text((256, 256), glyph, font=font, fill=color, anchor="mm")
    except Exception:
        try:
            if use_embedded_color:
                sd.text((190, 190), glyph, font=font, embedded_color=True)
            else:
                sd.text((190, 190), glyph, font=font, fill=color)
        except Exception:
            return

    bbox = scratch.split()[-1].getbbox()
    if not bbox:
        return
    glyph_img = scratch.crop(bbox)
    gw, gh = glyph_img.size
    if gw < 1 or gh < 1:
        return

    pad = 6
    max_w = max(1, bw - (pad * 2))
    max_h = max(1, bh - (pad * 2))
    scale = min(max_w / gw, max_h / gh)
    nw = max(1, int(gw * scale))
    nh = max(1, int(gh * scale))
    glyph_img = glyph_img.resize((nw, nh), Image.Resampling.NEAREST)

    tile = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
    tx = (bw - nw) // 2
    ty = (bh - nh) // 2
    tile.alpha_composite(glyph_img, (tx, ty))
    img.alpha_composite(tile, (x0, y0))


def main():
    color_font = load_font(FONT_COLOR, [136, 128, 109, 96, 88, 80, 72, 64, 56, 48, 40, 32])
    mono_font = load_font(FONT_MONO, [136, 128, 120, 109, 96, 88, 80, 72, 64, 56, 48, 40, 32])
    ui_font = load_font(UI_FONT, [22, 20, 18, 16, 14, 12])
    code_font = load_font(UI_FONT, [14, 12, 11])

    candidates_per_spell = 8
    spell_rows = len(SPELL_CANDIDATES)

    left_w = 330
    pair_w = 280  # each pair is color + mono
    col_gap = 18
    top_h = 70
    row_h = 210

    width = left_w + candidates_per_spell * pair_w + (candidates_per_spell + 1) * col_gap
    height = top_h + spell_rows * row_h + 12

    img = Image.new("RGBA", (width, height), (242, 242, 242, 255))
    draw = ImageDraw.Draw(img)

    # header
    draw.rectangle((0, 0, width, top_h), fill=(32, 32, 32, 255))
    draw.text((12, 22), "Spell / Codepoint", font=ui_font, fill=(255, 255, 255, 255))
    x = left_w + col_gap
    for i in range(candidates_per_spell):
        draw.text((x + 18, 14), f"C{i+1}", font=ui_font, fill=(235, 235, 235, 255))
        draw.text((x + 8, 40), "Color", font=code_font, fill=(255, 220, 120, 255))
        draw.text((x + 88, 40), "Mono", font=code_font, fill=(220, 220, 220, 255))
        x += pair_w + col_gap

    # rows
    for r, (_spell_id, (label, candidates)) in enumerate(SPELL_CANDIDATES.items()):
        y0 = top_h + r * row_h
        y1 = y0 + row_h
        bg = (255, 255, 255, 255) if r % 2 == 0 else (234, 234, 234, 255)
        draw.rectangle((0, y0, width, y1), fill=bg)
        draw.line((0, y0, width, y0), fill=(190, 190, 190, 255), width=1)

        draw.text((12, y0 + 16), label, font=ui_font, fill=(0, 0, 0, 255))

        x = left_w + col_gap
        for code in candidates:
            base = cp(code)
            emoji = base + cp(0xFE0F)
            mono_base = base

            # color cell (emoji style)
            c_box = (x + 6, y0 + 18, x + 132, y0 + 150)
            draw_centered_glyph(
                draw,
                img,
                c_box,
                emoji,
                color_font,
                (30, 30, 30, 255),
                use_embedded_color=True,
            )
            # mono cell (seguisym, text style)
            m_box = (x + 148, y0 + 18, x + 274, y0 + 150)
            draw_centered_glyph(
                draw,
                img,
                m_box,
                mono_base,
                mono_font,
                (20, 20, 20, 255),
                use_embedded_color=False,
            )

            draw.text((x + 92, y0 + 165), f"U+{code:04X}", font=code_font, fill=(90, 90, 90, 255))
            x += pair_w + col_gap

    img.save(OUT)
    print(str(OUT))


if __name__ == "__main__":
    main()
