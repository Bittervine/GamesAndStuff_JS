import base64
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
HTML = ROOT / "Rogue_JS.html"
OUT = ROOT / "Glyph_Candidate_Comparison.png"

CELL = 128
COLS = 10

HEADERS = [
    "Color Emoji",
    "Color Text",
    "Mono Emoji",
    "Mono Text",
]

# label, codepoint hex (all from existing atlas-backed symbols)
CANDIDATES = [
    ("Chain A", "26A1"),   # bolt
    ("Chain B", "2726"),   # spark/star
    ("Chain C", "2605"),   # black star
    ("Chain D", "2733"),   # web/star burst
    ("Chain E", "2694"),   # crossed swords
    ("Poison A", "2733"),  # web/star burst
    ("Poison B", "1F52E"), # crystal ball
    ("Poison C", "1F4A7"), # droplet
    ("Poison D", "1F525"), # fire
    ("Poison E", "1F4DC"), # scroll
]


def cp(code_hex: str) -> str:
    return chr(int(code_hex, 16))


def glyph_from_key(key: str) -> str:
    parts = key.split("-")
    return "".join(cp(p) for p in parts)


def read_text() -> str:
    return HTML.read_text(encoding="utf-8")


def extract_data_png(text: str, var_name: str) -> Image.Image:
    m = re.search(rf"var\s+{var_name}\s*=\s*'data:image/png;base64,([^']+)';", text, re.DOTALL)
    if not m:
        raise RuntimeError(f"Missing {var_name}")
    data = base64.b64decode(m.group(1).replace("\n", "").replace("\r", ""))
    return Image.open(__import__("io").BytesIO(data)).convert("RGBA")


def extract_index_map(text: str) -> dict:
    # BITMAP_GLYPH_INDEX block, entries like: '2605': 27,
    block = re.search(r"var\s+BITMAP_GLYPH_INDEX\s*=\s*\{(.*?)\};", text, re.DOTALL)
    if not block:
        raise RuntimeError("Missing BITMAP_GLYPH_INDEX")
    out = {}
    for key, idx in re.findall(r"'([0-9A-F\-]+)'\s*:\s*(\d+)", block.group(1), re.IGNORECASE):
        out[key.upper()] = int(idx)
    return out


def key_for(glyph: str) -> str:
    parts = []
    i = 0
    while i < len(glyph):
        c = ord(glyph[i])
        if 0xD800 <= c <= 0xDBFF and i + 1 < len(glyph):
            c2 = ord(glyph[i + 1])
            if 0xDC00 <= c2 <= 0xDFFF:
                code = 0x10000 + ((c - 0xD800) << 10) + (c2 - 0xDC00)
                parts.append(f"{code:X}")
                i += 2
                continue
        parts.append(f"{c:X}")
        i += 1
    return "-".join(parts)


def glyph_forms(code_hex: str):
    # Build emoji/text-coded forms from base codepoint.
    code = int(code_hex, 16)
    ch = cp(code_hex)
    if code <= 0xFFFF:
        emoji = ch + cp("FE0F")
        text = ch + cp("FE0E")
    else:
        emoji = ch
        text = ch
    return emoji, text


def crop_bounds(tile: Image.Image):
    alpha = tile.split()[-1]
    bbox = alpha.getbbox()
    if not bbox:
        return (0, 0, tile.width, tile.height)
    return bbox


def tile_for(index_map: dict, atlas: Image.Image, glyph: str):
    k = key_for(glyph)
    if k not in index_map:
        return None, k
    idx = index_map[k]
    sx = (idx % COLS) * CELL
    sy = (idx // COLS) * CELL
    tile = atlas.crop((sx, sy, sx + CELL, sy + CELL))
    return tile, k


def draw_scaled_center(dst: Image.Image, src: Image.Image, box):
    x0, y0, x1, y1 = box
    bw = x1 - x0
    bh = y1 - y0
    b = crop_bounds(src)
    cut = src.crop(b)
    if cut.width < 1 or cut.height < 1:
        return
    scale = min((bw - 10) / cut.width, (bh - 10) / cut.height)
    nw = max(1, int(cut.width * scale))
    nh = max(1, int(cut.height * scale))
    rs = cut.resize((nw, nh), Image.Resampling.NEAREST)
    px = x0 + (bw - nw) // 2
    py = y0 + (bh - nh) // 2
    dst.alpha_composite(rs, (px, py))


def main():
    text = read_text()
    idx_map = extract_index_map(text)
    atlas_color = extract_data_png(text, "BITMAP_ATLAS_COLOR_PNG")
    atlas_mono = extract_data_png(text, "BITMAP_ATLAS_MONO_PNG")

    font = ImageFont.load_default()
    row_h = 220
    col_w = 230
    left_w = 250
    top_h = 56
    w = left_w + col_w * 4
    h = top_h + row_h * len(CANDIDATES)
    sheet = Image.new("RGBA", (w, h), (245, 245, 245, 255))
    d = ImageDraw.Draw(sheet)

    # headers
    d.rectangle((0, 0, w, top_h), fill=(30, 30, 30, 255))
    for ci, head in enumerate(HEADERS):
        x = left_w + ci * col_w + 10
        d.text((x, 18), head, font=font, fill=(255, 255, 255, 255))
    d.text((10, 18), "Candidate / Codepoint", font=font, fill=(255, 255, 255, 255))

    for ri, (label, hx) in enumerate(CANDIDATES):
        y0 = top_h + ri * row_h
        y1 = y0 + row_h
        bg = (255, 255, 255, 255) if ri % 2 == 0 else (236, 236, 236, 255)
        d.rectangle((0, y0, w, y1), fill=bg)
        d.line((0, y0, w, y0), fill=(180, 180, 180, 255), width=1)
        d.text((10, y0 + 12), f"{label}", font=font, fill=(0, 0, 0, 255))
        d.text((10, y0 + 34), f"U+{hx}", font=font, fill=(70, 70, 70, 255))

        g_emoji, g_text = glyph_forms(hx)
        cells = [
            (atlas_color, g_emoji),
            (atlas_color, g_text),
            (atlas_mono, g_emoji),
            (atlas_mono, g_text),
        ]
        for ci, (atlas, glyph) in enumerate(cells):
            x0 = left_w + ci * col_w + 10
            x1 = x0 + col_w - 20
            gy0 = y0 + 52
            gy1 = y1 - 18
            d.rectangle((x0, gy0, x1, gy1), outline=(170, 170, 170, 255), width=1)
            tile, key = tile_for(idx_map, atlas, glyph)
            fallback = False
            if tile is None:
                # If FE0E/FE0F variant missing, fallback to atlas base glyph.
                base = cp(hx)
                tile, key = tile_for(idx_map, atlas, base)
                fallback = tile is not None
            if tile is None:
                d.text((x0 + 8, gy0 + 8), f"missing: {key}", font=font, fill=(160, 0, 0, 255))
                continue
            draw_scaled_center(sheet, tile, (x0, gy0, x1, gy1))
            suffix = " (fallback)" if fallback else ""
            d.text((x0 + 8, gy1 - 12), key + suffix, font=font, fill=(100, 100, 100, 255))

    d.line((0, h - 1, w, h - 1), fill=(160, 160, 160, 255), width=1)
    sheet.save(OUT)
    print(str(OUT))


if __name__ == "__main__":
    main()
