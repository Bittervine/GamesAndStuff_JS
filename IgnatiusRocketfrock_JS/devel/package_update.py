#!/usr/bin/env python3
"""Build a compact project update archive without source artwork files."""

from __future__ import annotations

import argparse
import re
import sys
import zipfile
from pathlib import Path

EXCLUDED_EXTENSIONS = {".png", ".xcf"}
EXCLUDED_DIRECTORIES = {".git", ".build", "dist", "node_modules", "__pycache__"}
EXCLUDED_FILENAMES = {".DS_Store"}
REQUIRED_FILES = {
    "AGENTS.md",
    "ARCHITECTURE.md",
    "GameManual.html",
    "IMPLEMENTATION_CHECKLIST.md",
    "PLAN.md",
    "game.html",
    "level-editor.html",
    "package.json",
    "src/browser/game-bootstrap.js",
    "src/core/simulation.js",
    "tests/testbench.mjs",
}


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

    bootstrap = (project_root / "src/browser/game-bootstrap.js").read_text(encoding="utf-8")
    editor = (project_root / "level-editor.html").read_text(encoding="utf-8")
    if not re.search(rf'const GAME_REVISION = "{revision}";', bootstrap):
        raise ValueError(f"game bootstrap revision label is not {revision}")
    if f"Level Editor <small>rev {revision}</small>" not in editor:
        raise ValueError(f"Level Editor revision label is not {revision}")


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
