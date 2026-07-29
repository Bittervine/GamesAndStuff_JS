#!/usr/bin/env python3
"""Import music files from devel/temp into resources/music/music_###.ogg.

Expected layout when run from the project tree:

    IgnatiusRocketfrock_JS/
      resources/
        music/
      devel/
        import_music_from_temp.py
        ffmpeg.exe       # optional, Windows
        ffprobe.exe      # optional, Windows, used for metadata if present
        temp/
          some tune.mp3
          another tune.wav

The script scans resources/music/ for existing music_001.ogg, music_002.ogg, ... files,
then converts every .mp3, .wav, and .ogg in devel/temp to the next available
numbered asset. It preserves input metadata where FFmpeg can map it, chooses a
reasonable title from metadata or filename, and updates resources/music/music.json.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

SUPPORTED_INPUT_SUFFIXES = {".mp3", ".wav", ".ogg"}
MUSIC_FILE_RE = re.compile(r"^music_(\d{3})\.ogg$", re.IGNORECASE)
DEFAULT_QUALITY = 5.0


@dataclass(frozen=True)
class SourceMetadata:
    title: str | None
    tags: dict[str, str]
    duration: float | None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--project-root",
        type=Path,
        default=None,
        help="Project root. Defaults to the parent directory of this script.",
    )
    parser.add_argument(
        "--temp-dir",
        type=Path,
        default=None,
        help="Source folder. Defaults to devel/temp.",
    )
    parser.add_argument(
        "--music-dir",
        type=Path,
        default=None,
        help="Music resource folder. Defaults to PROJECT_ROOT/resources/music.",
    )
    parser.add_argument(
        "--quality",
        type=float,
        default=DEFAULT_QUALITY,
        help="Ogg Vorbis quality passed to FFmpeg -q:a. Default: 5.",
    )
    parser.add_argument(
        "--allow-duplicates",
        action="store_true",
        help="Import files even when their SHA-256 already exists in music.json.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned imports without writing Ogg files or music.json.",
    )
    parser.add_argument(
        "--ffmpeg",
        type=Path,
        default=None,
        help="Path to ffmpeg. Defaults to ffmpeg/ffmpeg.exe beside this script, then PATH.",
    )
    parser.add_argument(
        "--ffprobe",
        type=Path,
        default=None,
        help="Path to ffprobe. Defaults to ffprobe/ffprobe.exe beside this script, then PATH.",
    )
    return parser.parse_args()


def script_dir() -> Path:
    return Path(__file__).resolve().parent


def resolve_tool(explicit: Path | None, base_dir: Path, names: tuple[str, ...]) -> str | None:
    if explicit:
        return str(explicit.resolve())
    for name in names:
        candidate = base_dir / name
        if candidate.is_file():
            return str(candidate)
    for name in names:
        found = shutil.which(name)
        if found:
            return found
    return None


def utc_now_text() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalized_tag_dict(tags: dict[str, Any] | None) -> dict[str, str]:
    if not isinstance(tags, dict):
        return {}
    result: dict[str, str] = {}
    for key, value in tags.items():
        key_text = str(key).strip()
        if not key_text:
            continue
        if value is None:
            continue
        value_text = str(value).strip()
        if value_text:
            result[key_text] = value_text
    return result


def read_metadata(ffprobe: str | None, path: Path) -> SourceMetadata:
    if not ffprobe:
        return SourceMetadata(title=None, tags={}, duration=None)
    command = [
        ffprobe,
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        str(path),
    ]
    try:
        completed = subprocess.run(command, check=True, capture_output=True, text=True)
        payload = json.loads(completed.stdout or "{}")
    except (subprocess.CalledProcessError, json.JSONDecodeError, OSError):
        return SourceMetadata(title=None, tags={}, duration=None)

    fmt = payload.get("format") if isinstance(payload, dict) else {}
    tags = normalized_tag_dict(fmt.get("tags") if isinstance(fmt, dict) else {})
    lower_tags = {key.casefold(): value for key, value in tags.items()}
    title = lower_tags.get("title") or lower_tags.get("tracktitle") or lower_tags.get("name")
    duration: float | None = None
    if isinstance(fmt, dict):
        try:
            duration = float(fmt.get("duration"))
        except (TypeError, ValueError):
            duration = None
    return SourceMetadata(title=clean_title(title) if title else None, tags=tags, duration=duration)


def clean_title(value: str | None) -> str | None:
    if value is None:
        return None
    title = re.sub(r"\s+", " ", value).strip(" \t\r\n-_.,")
    return title or None


def guess_title_from_filename(path: Path) -> str:
    stem = path.stem
    stem = re.sub(r"^music[_\-\s]*\d+[_\-\s]*", "", stem, flags=re.IGNORECASE)
    stem = re.sub(r"^[\d\s._-]+", "", stem)
    stem = re.sub(r"[_\-]+", " ", stem)
    stem = re.sub(r"\s+", " ", stem).strip()
    if not stem:
        stem = path.stem

    # Title-case plain lowercase filenames, but avoid mangling names that already
    # contain deliberate capitals such as "Mozart K550" or "Bach BWV 565".
    letters = [char for char in stem if char.isalpha()]
    if letters and sum(1 for char in letters if char.isupper()) <= max(1, len(letters) // 8):
        stem = stem.title()
        replacements = {
            " In ": " in ",
            " Of ": " of ",
            " The ": " the ",
            " And ": " and ",
            " A ": " a ",
            " An ": " an ",
            " To ": " to ",
        }
        for before, after in replacements.items():
            stem = stem.replace(before, after)
        stem = stem[:1].upper() + stem[1:]
    return clean_title(stem) or path.stem


def load_music_json(path: Path) -> dict[str, Any]:
    if not path.is_file():
        return {"schemaVersion": 1, "tracks": []}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        raise ValueError(f"{path} is not valid JSON: {error}") from error

    if isinstance(payload, dict) and isinstance(payload.get("tracks"), list):
        payload.setdefault("schemaVersion", 1)
        return payload

    # Friendly migration for a simple old shape such as {"music_001": "Title"}.
    if isinstance(payload, dict):
        tracks: list[dict[str, Any]] = []
        for key, value in sorted(payload.items()):
            if isinstance(value, str) and key.startswith("music_"):
                tracks.append({"id": key, "file": f"{key}.ogg", "title": value})
        return {"schemaVersion": 1, "tracks": tracks}

    if isinstance(payload, list):
        return {"schemaVersion": 1, "tracks": payload}

    raise ValueError(f"Unsupported music.json shape in {path}")


def find_existing_asset_numbers(music_dir: Path) -> set[int]:
    numbers: set[int] = set()
    if not music_dir.is_dir():
        return numbers
    for path in music_dir.iterdir():
        if not path.is_file():
            continue
        match = MUSIC_FILE_RE.match(path.name)
        if match:
            numbers.add(int(match.group(1)))
    return numbers


def next_available_number(used: set[int]) -> int:
    number = 1
    while number in used:
        number += 1
    return number


def build_track_index(manifest: dict[str, Any]) -> dict[str, dict[str, Any]]:
    tracks = manifest.setdefault("tracks", [])
    if not isinstance(tracks, list):
        raise ValueError("music.json field 'tracks' must be a list")
    index: dict[str, dict[str, Any]] = {}
    for item in tracks:
        if not isinstance(item, dict):
            continue
        track_id = str(item.get("id") or Path(str(item.get("file", ""))).stem)
        if track_id:
            item["id"] = track_id
            item.setdefault("file", f"{track_id}.ogg")
            index[track_id] = item
    return index


def known_source_hashes(manifest: dict[str, Any]) -> set[str]:
    hashes: set[str] = set()
    for item in manifest.get("tracks", []):
        if not isinstance(item, dict):
            continue
        source_hash = item.get("sourceSha256")
        if isinstance(source_hash, str) and source_hash:
            hashes.add(source_hash.casefold())
    return hashes


def ensure_existing_assets_in_manifest(
    manifest: dict[str, Any],
    music_dir: Path,
    used_numbers: set[int],
    ffprobe: str | None,
) -> None:
    index = build_track_index(manifest)
    tracks = manifest.setdefault("tracks", [])
    now = utc_now_text()
    for number in sorted(used_numbers):
        track_id = f"music_{number:03d}"
        filename = f"{track_id}.ogg"
        if track_id in index:
            index[track_id].setdefault("file", filename)
            index[track_id].setdefault("title", guess_title_from_filename(Path(filename)))
            continue
        asset_path = music_dir / filename
        metadata = read_metadata(ffprobe, asset_path)
        title = metadata.title or guess_title_from_filename(asset_path)
        tracks.append({
            "id": track_id,
            "file": filename,
            "title": title,
            "source": "existing_asset_scan",
            "metadataTitle": metadata.title,
            "addedAt": now,
        })


def source_files(temp_dir: Path) -> list[Path]:
    if not temp_dir.is_dir():
        return []
    return sorted(
        [path for path in temp_dir.iterdir() if path.is_file() and path.suffix.lower() in SUPPORTED_INPUT_SUFFIXES],
        key=lambda item: item.name.casefold(),
    )


def convert_to_ogg(
    ffmpeg: str,
    source: Path,
    target: Path,
    title: str,
    track_id: str,
    quality: float,
    dry_run: bool,
) -> None:
    command = [
        ffmpeg,
        "-y",
        "-hide_banner",
        "-loglevel", "warning",
        "-i", str(source),
        "-map", "0:a:0",
        "-map_metadata", "0",
        "-vn",
        "-sn",
        "-dn",
        "-c:a", "libvorbis",
        "-q:a", f"{quality:g}",
        "-metadata", f"title={title}",
        "-metadata", f"ignatius_id={track_id}",
        "-metadata", f"source_filename={source.name}",
        str(target),
    ]
    print(" ".join(f'"{part}"' if " " in part else part for part in command))
    if dry_run:
        return
    completed = subprocess.run(command)
    if completed.returncode != 0:
        raise RuntimeError(f"FFmpeg failed for {source.name} with exit code {completed.returncode}")


def write_music_json(path: Path, manifest: dict[str, Any]) -> None:
    tracks = manifest.get("tracks", [])
    if isinstance(tracks, list):
        tracks.sort(key=lambda item: str(item.get("id", "")) if isinstance(item, dict) else "")
    manifest["schemaVersion"] = int(manifest.get("schemaVersion") or 1)
    manifest["updatedAt"] = utc_now_text()
    path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> int:
    args = parse_args()
    base_dir = script_dir()
    project_root = (args.project_root or base_dir.parent).resolve()
    temp_dir = (args.temp_dir or base_dir / "temp").resolve()
    music_dir = (args.music_dir or project_root / "resources" / "music").resolve()
    music_json_path = music_dir / "music.json"

    ffmpeg = resolve_tool(args.ffmpeg, base_dir, ("ffmpeg.exe", "ffmpeg"))
    ffprobe = resolve_tool(args.ffprobe, base_dir, ("ffprobe.exe", "ffprobe"))
    if not ffmpeg:
        print("ERROR: Could not find ffmpeg.exe/ffmpeg beside the script or on PATH.", file=sys.stderr)
        return 1

    if args.quality < -1 or args.quality > 10:
        print("ERROR: Vorbis quality should normally be between -1 and 10.", file=sys.stderr)
        return 1

    music_dir.mkdir(parents=True, exist_ok=True)
    temp_dir.mkdir(parents=True, exist_ok=True)

    manifest = load_music_json(music_json_path)
    used_numbers = find_existing_asset_numbers(music_dir)
    ensure_existing_assets_in_manifest(manifest, music_dir, used_numbers, ffprobe)
    known_hashes = known_source_hashes(manifest)
    tracks = manifest.setdefault("tracks", [])

    inputs = source_files(temp_dir)
    if not inputs:
        print(f"No .mp3, .wav, or .ogg files found in {temp_dir}")
        if not args.dry_run:
            write_music_json(music_json_path, manifest)
            print(f"Updated {music_json_path} with any existing music files that were missing from the index.")
        return 0

    imported = 0
    skipped = 0
    failures: list[str] = []
    print(f"Scanning {temp_dir}")
    print(f"Writing numbered Ogg files to {music_dir}")
    print(f"Updating {music_json_path}")
    if not ffprobe:
        print("Note: ffprobe was not found, so title guessing will use filenames only.")
    print("")

    for source in inputs:
        try:
            source_hash = sha256_file(source)
            if not args.allow_duplicates and source_hash.casefold() in known_hashes:
                print(f"SKIP duplicate source hash: {source.name}")
                skipped += 1
                continue

            metadata = read_metadata(ffprobe, source)
            guessed_title = guess_title_from_filename(source)
            title = metadata.title or guessed_title
            number = next_available_number(used_numbers)
            used_numbers.add(number)
            track_id = f"music_{number:03d}"
            target = music_dir / f"{track_id}.ogg"

            print(f"IMPORT {source.name} -> {target.name}")
            print(f"       title: {title}")
            if metadata.title and metadata.title != guessed_title:
                print(f"       metadata title used; filename guess was: {guessed_title}")

            convert_to_ogg(ffmpeg, source, target, title, track_id, args.quality, args.dry_run)

            tracks.append({
                "id": track_id,
                "file": target.name,
                "title": title,
                "sourceFileName": source.name,
                "sourceExtension": source.suffix.lower(),
                "sourceSha256": source_hash,
                "metadataTitle": metadata.title,
                "guessedTitle": guessed_title,
                "durationSeconds": round(metadata.duration, 3) if metadata.duration is not None else None,
                "importedAt": utc_now_text(),
            })
            known_hashes.add(source_hash.casefold())
            imported += 1
            print("")
        except Exception as error:  # Continue importing other files; report all failures at end.
            failures.append(f"{source.name}: {error}")
            print(f"FAILED {source.name}: {error}", file=sys.stderr)
            print("")

    if not args.dry_run:
        write_music_json(music_json_path, manifest)
        print(f"Wrote {music_json_path}")
    else:
        print("Dry run: no files were written.")

    print(f"Imported: {imported}; skipped duplicates: {skipped}; failed: {len(failures)}")
    if failures:
        print("Failures:", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
