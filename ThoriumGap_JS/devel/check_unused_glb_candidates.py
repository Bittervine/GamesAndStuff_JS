from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = ROOT / "models"

# Keep sw.js out of the scan for now, per request.
IGNORED_PATHS = {
    Path(__file__).resolve(),
    ROOT / "sw.js",
}

# Candidate list from the current cleanup pass.
CANDIDATES = [
    "Ship_Crosspanel_12.glb",
    "Ship_Crosspanel_13.glb",
    "Ship_Crosspanel_14.glb",
    "Ship_Crosspanel_15.glb",
    "Ship_Crosspanel_17.glb",
    "Ship_Crosspanel_19.glb",
    "Ship_Crosspanel_20.glb",
    "Ship_Crosspanel_8.glb",
    "Ship_Crosspanel_9.glb",
    "Ship_DeltaWing_917855.glb",
    "Ship_DeltaWing_954387.glb",
    "Ship_DeltaWing_978618.glb",
    "Ship_FlyingSaucer_779051.glb",
    "Ship_FlyingSaucer_910512.glb",
    "Ship_Hooper_828008.glb",
    "Ship_Hooper_900396.glb",
    "Ship_Longwing_10.glb",
    "Ship_Longwing_9.glb",
    "Ship_LunarCourier_993089.glb",
    "Ship_ManraRay_873301.glb",
    "Ship_ManraRay_892974.glb",
    "Ship_Orca_743275.glb",
    "Ship_Orca_809222.glb",
    "Ship_Orca_915833.glb",
    "Ship_Pirate_8.glb",
    "Ship_Pirate_9.glb",
    "Ship_Pirate_940914.glb",
    "Ship_PyramidLifter_855868.glb",
    "Ship_PyramidLifter_950535.glb",
    "Ship_Standard_15.glb",
    "Ship_Standard_16.glb",
    "Ship_Standard_18.glb",
    "Ship_Standard_19.glb",
    "Ship_Talonhunter_812238.glb",
    "Ship_Talonhunter_903666.glb",
    "Ship_Talonhunter_960664.glb",
    "Ship_TigerWing_10.glb",
    "Ship_TigerWing_8.glb",
    "Ship_TigerWing_9.glb",
    "Ship_TwoHoop_795072.glb",
    "Ship_TwoHoop_940914.glb",
    "Ship_TwoHoop_961380.glb",
]

TEXT_SUFFIXES = {
    ".css",
    ".html",
    ".js",
    ".json",
    ".md",
    ".mjs",
    ".py",
    ".sh",
    ".ts",
    ".tsx",
    ".txt",
    ".xml",
    ".yaml",
    ".yml",
}


def iter_text_files(root: Path):
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if path in IGNORED_PATHS:
            continue
        if path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        yield path


def main() -> int:
    file_texts = []
    for path in iter_text_files(ROOT):
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        file_texts.append((path, text))

    used = []
    unused = []
    for candidate in CANDIDATES:
        needle = candidate.lower()
        found_in = []
        for path, text in file_texts:
            if needle in text.lower():
                found_in.append(path)
        if found_in:
            used.append((candidate, found_in))
        else:
            unused.append(candidate)

    print("Unused candidates:")
    for name in unused:
        print(name)

    print()
    print("Candidates still referenced somewhere other than sw.js:")
    for name, paths in used:
        print(name)
        for path in paths:
            print(f"  {path.relative_to(ROOT)}")

    return 0 if unused else 1


if __name__ == "__main__":
    raise SystemExit(main())
