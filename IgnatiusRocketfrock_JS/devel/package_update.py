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
FORBIDDEN_GENERATED_DIRECTORIES = {".nyc_output", ".pytest_cache", "coverage", "playwright-report", "test-results"}
FORBIDDEN_GENERATED_SUFFIXES = {".bak", ".log", ".orig", ".rej", ".tmp", ".zip"}
FORBIDDEN_GENERATED_FILENAMES = {"npm-debug.log", "yarn-error.log"}
EXPECTED_PROJECT_DIRECTORY = "IgnatiusRocketfrock_JS"
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
    "DEVELOPER_MANUAL.md",
    "GameManual.html",
    "IMPLEMENTATION_CHECKLIST.md",
    "PLAN.md",
    "game.html",
    "favicon.ico",
    "level-editor.html",
    "level-renderer-baseline.html",
    "package.json",
    "devel/audit_renderer_boundary.mjs",
    "devel/enemy-hit-effect-lab.html",
    "devel/enemy-hit-effect-lab.js",
    "devel/inspect_editor_stress_fixture.mjs",
    "devel/run_generator_tests.mjs",
    "devel/run_test_gate.mjs",
    "devel/test-gate-runner.mjs",
    "src/browser/game-bootstrap.js",
    "src/core/simulation.js",
    "src/presentation/webgl2-renderer.js",
    "src/tools/level-renderer-baseline.js",
    "tests/fixtures/level-editor-stress.json",
    "tests/test-gate-manifest.mjs",
    "tests/testbench.mjs",
    "EDITOR_STRESS_BASELINE.md",
    "RENDERER_BOUNDARY_AUDIT.md",
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


def _forbidden_generated_paths(project_root: Path) -> list[str]:
    forbidden: list[str] = []
    for path in project_root.rglob("*"):
        relative = path.relative_to(project_root)
        if any(part in FORBIDDEN_GENERATED_DIRECTORIES for part in relative.parts):
            forbidden.append(relative.as_posix())
            continue
        if not path.is_file():
            continue
        if path.name in FORBIDDEN_GENERATED_FILENAMES or path.suffix.lower() in FORBIDDEN_GENERATED_SUFFIXES:
            forbidden.append(relative.as_posix())
    return sorted(set(forbidden))


def validate_project(project_root: Path, revision: int) -> None:
    if project_root.name != EXPECTED_PROJECT_DIRECTORY:
        raise ValueError(f"project directory must be named {EXPECTED_PROJECT_DIRECTORY}, found {project_root.name}")

    missing = sorted(path for path in REQUIRED_FILES if not (project_root / path).is_file())
    if missing:
        raise ValueError(f"missing required project files: {', '.join(missing)}")

    retired = sorted(path for path in RETIRED_FILES if (project_root / path).exists())
    if retired:
        raise ValueError(f"retired project files have reappeared: {', '.join(retired)}")

    generated = _forbidden_generated_paths(project_root)
    if generated:
        raise ValueError(f"unexpected generated artifacts are present: {', '.join(generated)}")

    package_metadata = json.loads((project_root / "package.json").read_text(encoding="utf-8"))
    scripts = package_metadata.get("scripts", {})
    expected_scripts = {
        "test": "npm run test:release",
        "test:release": "node devel/run_test_gate.mjs release",
        "test:smoke": "node devel/run_test_gate.mjs smoke",
        "test:shared": "node devel/run_test_gate.mjs shared",
        "test:editor": "node devel/run_test_gate.mjs editor",
        "test:game": "node devel/run_test_gate.mjs game",
        "test:generator": "node devel/run_generator_tests.mjs",
    }
    mismatched_scripts = [
        name for name, command in expected_scripts.items()
        if scripts.get(name) != command
    ]
    if mismatched_scripts:
        raise ValueError(f"package test-gate scripts are missing or stale: {', '.join(mismatched_scripts)}")

    bootstrap = (project_root / "src/browser/game-bootstrap.js").read_text(encoding="utf-8")
    editor = (project_root / "level-editor.html").read_text(encoding="utf-8")
    if not re.search(rf'const GAME_REVISION = "{revision}";', bootstrap):
        raise ValueError(f"game bootstrap revision label is not {revision}")
    if f"Level Editor <small>rev {revision}</small>" not in editor:
        raise ValueError(f"Level Editor revision label is not {revision}")

    for documentation_name in ("PLAN.md", "ARCHITECTURE.md", "IMPLEMENTATION_CHECKLIST.md"):
        documentation = (project_root / documentation_name).read_text(encoding="utf-8")
        if f"Revision {revision}" not in documentation:
            raise ValueError(f"{documentation_name} has no Revision {revision} release note")

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
    expected_output_name = f"IgnatiusRocketfrock_{revision}.zip"
    if output.name != expected_output_name:
        raise ValueError(f"output archive must be named {expected_output_name}, found {output.name}")
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
        names = archive.namelist()
        if len(names) != len(set(names)):
            raise ValueError("archive contains duplicate member names")
        unsafe = [
            name for name in names
            if name.startswith(("/", "\\")) or ".." in Path(name).parts
        ]
        if unsafe:
            raise ValueError(f"archive contains unsafe member paths: {', '.join(unsafe)}")
        wrong_root = [name for name in names if not name.startswith(f"{archive_root}/")]
        if wrong_root:
            raise ValueError(f"archive members escaped the project root: {', '.join(wrong_root)}")
        forbidden = [
            name for name in names
            if Path(name).suffix.lower() in EXCLUDED_EXTENSIONS
        ]
        if forbidden:
            raise ValueError(f"archive contains excluded artwork: {', '.join(forbidden)}")
        generated = [
            name for name in names
            if any(part in FORBIDDEN_GENERATED_DIRECTORIES for part in Path(name).parts)
            or Path(name).name in FORBIDDEN_GENERATED_FILENAMES
            or Path(name).suffix.lower() in FORBIDDEN_GENERATED_SUFFIXES
        ]
        if generated:
            raise ValueError(f"archive contains generated artifacts: {', '.join(generated)}")
        archived_relative = {name.removeprefix(f"{archive_root}/") for name in names}
        missing_required = sorted(REQUIRED_FILES - archived_relative)
        if missing_required:
            raise ValueError(f"archive omitted required files: {', '.join(missing_required)}")
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
