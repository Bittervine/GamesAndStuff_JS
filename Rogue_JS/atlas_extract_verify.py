import base64
import hashlib
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
HTML = ROOT / "Rogue_JS.html"


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def extract_data_uri_payload(text: str, var_name: str) -> bytes:
    pattern = re.compile(
        rf"var\s+{re.escape(var_name)}\s*=\s*'data:image/png;base64,([^']+)';",
        re.DOTALL,
    )
    match = pattern.search(text)
    if not match:
        raise RuntimeError(f"Could not find {var_name} in {HTML}")
    b64 = match.group(1).replace("\r", "").replace("\n", "")
    return base64.b64decode(b64)


def verify_one(var_name: str, out_name: str, ref_name: str) -> None:
    text = HTML.read_text(encoding="utf-8")
    png_bytes = extract_data_uri_payload(text, var_name)

    out_path = ROOT / out_name
    out_path.write_bytes(png_bytes)

    ref_path = ROOT / ref_name
    out_hash = sha256_bytes(png_bytes)
    print(f"{out_name} sha256: {out_hash}")

    if ref_path.exists():
        ref_bytes = ref_path.read_bytes()
        ref_hash = sha256_bytes(ref_bytes)
        print(f"{ref_name} sha256: {ref_hash}")
        print(f"match: {'YES' if ref_bytes == png_bytes else 'NO'}")
    else:
        print(f"{ref_name} not found; wrote {out_name}.")

    print("-" * 48)


def main() -> None:
    verify_one(
        "BITMAP_ATLAS_COLOR_PNG",
        "_atlas_color_rebuilt_from_html.png",
        "_atlas_color_extracted.png",
    )
    verify_one(
        "BITMAP_ATLAS_MONO_PNG",
        "_atlas_mono_rebuilt_from_html.png",
        "_atlas_mono_extracted.png",
    )


if __name__ == "__main__":
    main()
