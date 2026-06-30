#!/usr/bin/env python3
"""Build a compact project update archive without source artwork files."""

from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from pathlib import Path

EXCLUDED_EXTENSIONS = {".png", ".xcf"}
EXCLUDED_DIRECTORIES = {".git", ".build", "dist", "node_modules", "__pycache__"}
EXCLUDED_FILENAMES = {".DS_Store"}
RETIRED_FILES = {
    "IgnatiusRocketfrock_SIM.js",
    "IgnatiusRocketfrock_RENDER.js",
    "IgnatiusRocketfrock_GAME.js",
    "IgnatiusRocketfrock_INPUT.js",
    "asset_tool.html",
    "level_editor.html",
    "character_tool.html",
    "renderer_smoke.html",
    "src/presentation/level-color-map.js",
    "src/presentation/rocket-glow-cache.js",
    "devel/old/ct_char_enemy_004.json",
    "generate_level002_temp.mjs",
}

REQUIRED_FILES = {
    "AGENTS.md",
    "ARCHITECTURE.md",
    "GameManual.html",
    "IMPLEMENTATION_CHECKLIST.md",
    "PLAN.md",
    "game.html",
    "level-editor.html",
    "package.json",
    "devel/run_generator_tests.mjs",
    "src/browser/game-bootstrap.js",
    "src/core/simulation.js",
    "tests/testbench.mjs",
}


def _finite_number(value: object, fallback: float) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return fallback
    return number if number == number and abs(number) != float("inf") else fallback


def _stable_profile_number(value: object, fallback: float = 0) -> float:
    return round(_finite_number(value, fallback), 3)


def _profile_number_text(value: object) -> str:
    number = _stable_profile_number(value)
    return str(int(number)) if number.is_integer() else f"{number:g}"


def _enemy_navigation_profile(entity: dict[str, object]) -> dict[str, float]:
    scale = max(0.05, _finite_number(entity.get("scale"), 1))
    body_width = max(8, _stable_profile_number(_finite_number(entity.get("w", entity.get("width")), 72) * scale))
    body_height = max(24, _stable_profile_number(_finite_number(entity.get("h", entity.get("height")), 148) * scale))
    return {
        "bodyWidth": body_width,
        "bodyHeight": body_height,
        "runSpeed": max(1, _stable_profile_number(entity.get("runSpeed"), 160)),
        "groundAcceleration": max(1, _stable_profile_number(entity.get("runAcceleration"), 950)),
        "jumpHeight": max(0, _stable_profile_number(entity.get("jumpHeight"), 120)),
        "gravity": max(1, _stable_profile_number(entity.get("jumpGravity"), 1200)),
        "maxFallDistance": max(0, _stable_profile_number(entity.get("maxFallDistance"), 320)),
        "maxStepHeight": max(0, _stable_profile_number(entity.get("maxStepHeight"), 28)),
        "maxStepGap": max(10, min(28, _stable_profile_number(body_width * 0.32))),
    }


def _enemy_navigation_profile_key(profile: dict[str, object]) -> str:
    return "_".join((
        f"w{_profile_number_text(profile.get('bodyWidth'))}",
        f"h{_profile_number_text(profile.get('bodyHeight'))}",
        f"r{_profile_number_text(profile.get('runSpeed'))}",
        f"a{_profile_number_text(profile.get('groundAcceleration'))}",
        f"j{_profile_number_text(profile.get('jumpHeight'))}",
        f"g{_profile_number_text(profile.get('gravity'))}",
        f"f{_profile_number_text(profile.get('maxFallDistance'))}",
        f"s{_profile_number_text(profile.get('maxStepHeight'))}",
        f"q{_profile_number_text(profile.get('maxStepGap'))}",
    ))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("revision", type=int, help="revision number embedded in labels and archive name")
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="project directory to archive (defaults to this script's project root)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="output zip path (defaults beside the project directory)",
    )
    return parser.parse_args()


def archive_candidates(project_root: Path, output: Path) -> list[Path]:
    files: list[Path] = []
    for path in project_root.rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(project_root)
        if any(part in EXCLUDED_DIRECTORIES for part in relative.parts[:-1]):
            continue
        if path.name in EXCLUDED_FILENAMES:
            continue
        if path.suffix.lower() in EXCLUDED_EXTENSIONS:
            continue
        if path.resolve() == output.resolve():
            continue
        files.append(path)
    return sorted(files, key=lambda item: item.relative_to(project_root).as_posix())


def validate_project(project_root: Path, revision: int) -> None:
    missing = sorted(path for path in REQUIRED_FILES if not (project_root / path).is_file())
    if missing:
        raise ValueError(f"missing required project files: {', '.join(missing)}")

    retired = sorted(path for path in RETIRED_FILES if (project_root / path).exists())
    if retired:
        raise ValueError(f"retired project files have reappeared: {', '.join(retired)}")

    bootstrap = (project_root / "src/browser/game-bootstrap.js").read_text(encoding="utf-8")
    editor = (project_root / "level-editor.html").read_text(encoding="utf-8")
    if not re.search(rf'const GAME_REVISION = "{revision}";', bootstrap):
        raise ValueError(f"game bootstrap revision label is not {revision}")
    if f"Level Editor <small>rev {revision}</small>" not in editor:
        raise ValueError(f"Level Editor revision label is not {revision}")

    for level_path in sorted((project_root / "assets").glob("level_*.json")):
        level = json.loads(level_path.read_text(encoding="utf-8"))
        hunters = [
            entity for entity in level.get("entities", [])
            if entity.get("type") == "characterEnemy" and str(entity.get("strategy", "")).lower() == "hunter"
        ]
        profiles = level.get("navigationGraphs", {}).get("profiles", [])
        if hunters and not profiles:
            raise ValueError(
                f"{level_path.name} contains {len(hunters)} hunter enemies but no baked navigation profiles"
            )
        available_profile_keys = {
            str(graph.get("id", ""))
            for graph in profiles
            if isinstance(graph, dict)
        }
        available_profile_keys.update(
            _enemy_navigation_profile_key(graph.get("profile", {}))
            for graph in profiles
            if isinstance(graph, dict) and isinstance(graph.get("profile"), dict)
        )
        missing_profile_keys = sorted({
            _enemy_navigation_profile_key(_enemy_navigation_profile(entity))
            for entity in hunters
            if _enemy_navigation_profile_key(_enemy_navigation_profile(entity)) not in available_profile_keys
        })
        if missing_profile_keys:
            raise ValueError(
                f"{level_path.name} has hunter mobility profiles without an exact bake: {', '.join(missing_profile_keys)}"
            )


def build_archive(project_root: Path, output: Path, revision: int) -> int:
    project_root = project_root.resolve()
    output = output.resolve()
    validate_project(project_root, revision)
    files = archive_candidates(project_root, output)
    if not files:
        raise ValueError("no files selected for archive")

    output.parent.mkdir(parents=True, exist_ok=True)
    output.unlink(missing_ok=True)
    archive_root = project_root.name
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in files:
            relative = path.relative_to(project_root).as_posix()
            archive.write(path, f"{archive_root}/{relative}")

    with zipfile.ZipFile(output, "r") as archive:
        bad_member = archive.testzip()
        if bad_member:
            raise ValueError(f"archive integrity check failed at {bad_member}")
        forbidden = [
            name for name in archive.namelist()
            if Path(name).suffix.lower() in EXCLUDED_EXTENSIONS
        ]
        if forbidden:
            raise ValueError(f"archive contains excluded artwork: {', '.join(forbidden)}")
    return len(files)


def main() -> int:
    args = parse_args()
    project_root = args.project_root.resolve()
    output = args.output or project_root.parent / f"IgnatiusRocketfrock_{args.revision}.zip"
    try:
        file_count = build_archive(project_root, output, args.revision)
    except (OSError, ValueError, zipfile.BadZipFile) as error:
        print(f"Packaging failed: {error}", file=sys.stderr)
        return 1
    print(f"Created {output.resolve()} with {file_count} files; PNG and XCF files excluded.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
