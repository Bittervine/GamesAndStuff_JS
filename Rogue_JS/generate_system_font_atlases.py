import argparse
import re
from pathlib import Path
from typing import List, Tuple

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
HTML_PATH = ROOT / "Rogue_JS.html"
OUT_DIR = ROOT / "system_font_atlases"

CELL = 128
COLS = 10
ROWS = 15
SIZE_CANDIDATES = [136, 128, 120, 109, 104, 96, 88, 80, 72, 64, 56, 48, 40, 32, 24, 20, 16]


def parse_bitmap_index(html_text: str) -> List[Tuple[int, str]]:
    block = re.search(r"var\s+BITMAP_GLYPH_INDEX\s*=\s*\{(.*?)\};", html_text, re.DOTALL)
    if not block:
        raise RuntimeError("BITMAP_GLYPH_INDEX not found in Rogue_JS.html")
    items: List[Tuple[int, str]] = []
    for key, idx in re.findall(r"'([0-9A-F\-]+)'\s*:\s*(\d+)", block.group(1), re.IGNORECASE):
        items.append((int(idx), key.upper()))
    items.sort(key=lambda t: t[0])
    return items


def cp(hex_code: str) -> str:
    return chr(int(hex_code, 16))


def key_to_glyph(key: str) -> str:
    return "".join(cp(part) for part in key.split("-"))


def to_text_variant(glyph: str) -> str:
    vs16 = chr(0xFE0F)
    vs15 = chr(0xFE0E)
    out = glyph.replace(vs16, vs15)
    if vs15 not in out:
        out += vs15
    return out


def sanitize_name(path: Path) -> str:
    s = path.stem
    s = re.sub(r"[^A-Za-z0-9._-]+", "_", s)
    return s or "font"


def load_font_any_size(font_path: Path, preferred_sizes: List[int], index: int = 0):
    last_err = None
    for size in preferred_sizes:
        try:
            f = ImageFont.truetype(str(font_path), size=size, index=index, layout_engine=ImageFont.Layout.BASIC)
            return f, size
        except Exception as exc:  # noqa: BLE001
            last_err = exc
    raise RuntimeError(f"Could not load font {font_path} (index={index}) with known sizes: {last_err}")


def render_atlas(font_path: Path, glyph_keys: List[Tuple[int, str]], out_path: Path, style: str) -> Tuple[int, int]:
    font, size = load_font_any_size(font_path, SIZE_CANDIDATES, index=0)
    total_cells = COLS * ROWS
    img = Image.new("RGBA", (COLS * CELL, ROWS * CELL), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    rendered = 0
    missing = 0

    for idx, key in glyph_keys:
        if idx < 0 or idx >= total_cells:
            continue
        glyph = key_to_glyph(key)
        if style == "plain":
            glyph = to_text_variant(glyph)
        elif style == "base":
            # Base: keep glyph exactly as mapped by BITMAP_GLYPH_INDEX, no selector rewrite.
            glyph = glyph

        x0 = (idx % COLS) * CELL
        y0 = (idx // COLS) * CELL
        x1 = x0 + CELL
        y1 = y0 + CELL

        # Render glyph centered. If the font has no glyph, this often yields empty bbox.
        try:
            bbox = draw.textbbox((0, 0), glyph, font=font, embedded_color=True)
        except Exception:
            try:
                bbox = draw.textbbox((0, 0), glyph, font=font)
            except Exception:
                bbox = None

        if not bbox:
            missing += 1
            continue

        gw = max(1, bbox[2] - bbox[0])
        gh = max(1, bbox[3] - bbox[1])
        if gw < 2 or gh < 2:
            missing += 1
            continue

        cx = x0 + (CELL - gw) // 2 - bbox[0]
        cy = y0 + (CELL - gh) // 2 - bbox[1]

        # Try color glyph render first, then monochrome fallback.
        ok = False
        try:
            draw.text((cx, cy), glyph, font=font, embedded_color=True)
            ok = True
        except Exception:
            pass
        if not ok:
            try:
                draw.text((cx, cy), glyph, font=font, fill=(0, 0, 0, 255))
                ok = True
            except Exception:
                ok = False

        if ok:
            rendered += 1
        else:
            missing += 1

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path)
    return rendered, missing


def collect_font_files(roots: List[Path]) -> List[Path]:
    exts = {".ttf", ".otf", ".ttc"}
    out: List[Path] = []
    seen = set()
    for root in roots:
        if not root.exists():
            continue
        for p in root.rglob("*"):
            if not p.is_file():
                continue
            if p.suffix.lower() not in exts:
                continue
            key = str(p).lower()
            if key in seen:
                continue
            seen.add(key)
            out.append(p)
    out.sort(key=lambda x: str(x).lower())
    return out


def main():
    parser = argparse.ArgumentParser(description="Generate atlas-style PNG sheets for each system font.")
    parser.add_argument(
        "--roots",
        nargs="*",
        default=[r"C:\Windows\Fonts", r"C:\Portable\GamesAndStuff_JS\Rogue_JS\fonts"],
        help="Font root directories to scan recursively.",
    )
    parser.add_argument(
        "--styles",
        nargs="*",
        default=["emoji", "plain", "base"],
        choices=["emoji", "plain", "base"],
        help="Which variants to generate per font.",
    )
    parser.add_argument("--limit", type=int, default=0, help="Process only first N fonts (0 = all).")
    parser.add_argument("--out", default=str(OUT_DIR), help="Output directory.")
    args = parser.parse_args()

    html_text = HTML_PATH.read_text(encoding="utf-8")
    glyph_keys = parse_bitmap_index(html_text)

    roots = [Path(r) for r in args.roots]
    fonts = collect_font_files(roots)
    if args.limit and args.limit > 0:
        fonts = fonts[: args.limit]

    out_root = Path(args.out)
    out_root.mkdir(parents=True, exist_ok=True)

    report_lines = []
    report_lines.append(f"fonts={len(fonts)} styles={','.join(args.styles)}")

    for i, font_path in enumerate(fonts, start=1):
        safe = sanitize_name(font_path)
        for style in args.styles:
            out_name = f"{safe}_{style}_FullRefSheet.png"
            out_path = out_root / out_name
            try:
                rendered, missing = render_atlas(font_path, glyph_keys, out_path, style=style)
                report_lines.append(
                    f"[{i}/{len(fonts)}] {font_path} style={style} size={CELL} rendered={rendered} missing={missing} -> {out_name}"
                )
                print(report_lines[-1])
            except Exception as exc:  # noqa: BLE001
                msg = f"[{i}/{len(fonts)}] {font_path} style={style} ERROR: {exc}"
                report_lines.append(msg)
                print(msg)

    report_path = out_root / "_generation_report.txt"
    report_path.write_text("\n".join(report_lines), encoding="utf-8")
    print(f"report: {report_path}")


if __name__ == "__main__":
    main()
