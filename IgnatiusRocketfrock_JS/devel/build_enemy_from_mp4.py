#!/usr/bin/env python3
"""
Build one Ignatius Rocketfrock enemy from one or more MP4 animation clips.

Store this file as:

    IgnatiusRocketfrock_JS/devel/build_enemy_from_mp4.py

Install dependencies:

    python -m pip install opencv-python pillow

The script:

  * extracts configured frame ranges from one or more MP4 files;
  * decodes each source MP4 only once;
  * registers all clips around a common anchor;
  * packs every frame into one fixed-cell PNG atlas;
  * writes atlas, rig, animation, and character JSON files;
  * can optionally add or replace an entry in ct_enemies_001.json.

The atlas deliberately uses fixed-size cells. After generation, you may open
it in GIMP and remove the background without invalidating the JSON, provided
that you do not resize the atlas or move imagery between cells.
"""

from __future__ import annotations

import copy
import json
import math
import os
import re
import shutil
import tempfile

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Any

try:
    import cv2
    from PIL import Image
except ImportError as exc:
    raise SystemExit(
        "Missing dependency. Run:\n"
        "  python -m pip install opencv-python pillow"
    ) from exc


# =============================================================================
# EDIT THESE SETTINGS
# =============================================================================

OUTPUT_PREFIX = "CT_Enemy_004"
OUTPUT_NAME = "Cave Goblin"

# Used when an animation does not specify its own "mp4" value.
DEFAULT_MP4 = "goblin.mp4"

# Source frame numbers in ANIMATIONS use this convention.
# Set to 1 when the first frame should be called frame 1.
FRAME_NUMBERING_BASE = 1

# The first animation is used by default unless DEFAULT_ANIMATION is set.
DEFAULT_ANIMATION = "idle"
DEFAULT_FACING = "right"
MIRRORABLE = True

# Each dictionary key becomes an animation slot and filename suffix.
#
# Required:
#     start
#     end
#
# Optional:
#     mp4
#     step
#     loop
#     fps
#     crop
#     scale
#     anchor_x
#     anchor_y
#     reverse
#     ping_pong
#
# anchor_x / anchor_y identify the same anatomical point in every animation.
#
# For grounded enemies, the point between the feet is usually suitable:
#
#     anchor_x = 0.5
#     anchor_y = 0.9
#
# For flying enemies, the centre of the torso is often more suitable:
#
#     anchor_x = 0.5
#     anchor_y = 0.5
#
ANIMATIONS = {
    "idle": {
        "start": 1,
        "end": 24,
        "step": 2,
        "loop": True,
        "anchor_x": 0.5,
        "anchor_y": 0.9,
    },

    "walk": {
        "start": 30,
        "end": 77,
        "step": 2,
        "loop": True,
        "anchor_x": 0.5,
        "anchor_y": 0.9,
    },

    "attack": {
        "start": 85,
        "end": 111,
        "step": 1,
        "loop": False,
        "fps": 24,
        "anchor_x": 0.5,
        "anchor_y": 0.9,
    },

    # Example using a different MP4:
    #
    # "death": {
    #     "mp4": "goblin_death.mp4",
    #     "start": 1,
    #     "end": 42,
    #     "step": 2,
    #     "loop": False,
    #     "anchor_x": 0.5,
    #     "anchor_y": 0.9,
    # },
}


# =============================================================================
# DEFAULT ANIMATION SETTINGS
# =============================================================================

# Individual animations may override any of these.

DEFAULT_FRAME_STEP = 1
DEFAULT_LOOP = True

# None means:
#
#     source video FPS / frame step
#
# Example:
#
#     Source video: 40 FPS
#     Frame step:   2
#     Result:       20 FPS
#
DEFAULT_ANIMATION_FPS = None

# Crop rectangle:
#
#     (left, top, width, height)
#
DEFAULT_CROP = None

DEFAULT_SCALE = 1.0

DEFAULT_ANCHOR_X = 0.5
DEFAULT_ANCHOR_Y = 0.5

DEFAULT_REVERSE = False
DEFAULT_PING_PONG = False


# =============================================================================
# ATLAS SETTINGS
# =============================================================================

ATLAS_MAX_WIDTH = 2048
ATLAS_MAX_HEIGHT = 8192

# None chooses as many columns as will fit inside ATLAS_MAX_WIDTH.
ATLAS_COLUMNS = None

# Transparent spacing between atlas cells.
ATLAS_PADDING = 2

# Transparent margin inside every cell.
CELL_MARGIN = 2


# =============================================================================
# RIG AND RENDER SETTINGS
# =============================================================================

# This is the rendered height of the entire common atlas cell.
TARGET_RENDER_HEIGHT = 96.0

# The common anchor becomes the rig origin.
#
# For a grounded enemy whose anchor is between its feet, 0 is usually correct.
RIG_OFFSET_X_PIXELS = 0.0
RIG_OFFSET_Y_PIXELS = 0.0

OVERWRITE_EXISTING_FILES = False


# =============================================================================
# ENEMY CATALOG SETTINGS
# =============================================================================

UPDATE_ENEMY_CATALOG = True

OVERWRITE_EXISTING_CATALOG_ENTRY = False
BACKUP_ENEMY_CATALOG = True

# When set to an existing enemy key, that catalog entry is copied.
#
# This is useful when the new enemy should use the same gameplay behaviour as
# an existing enemy.
#
# Example:
#
#     CATALOG_TEMPLATE_ENEMY_KEY = "enemy_003"
#
# Set to None to create a neutral generated entry.
#
CATALOG_TEMPLATE_ENEMY_KEY = None

CATALOG_ICON = "??"

CATALOG_DESCRIPTION = (
    "Generated from one or more MP4 frame sequences. "
    "Tune gameplay values in Puppet Forge."
)

DEFAULT_HITBOX_WIDTH = 64
DEFAULT_HITBOX_HEIGHT = 64

CATALOG_RENDER_SCALE = 1.0
CATALOG_HEALTH = 1

CATALOG_PATROL_DISTANCE = 120
CATALOG_MOVEMENT_SPEED = 70

CATALOG_FLIGHT_AMPLITUDE = 0
CATALOG_FLIGHT_CYCLES_PER_SECOND = 0


# =============================================================================
# PATHS
# =============================================================================

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent

ASSETS_DIR = PROJECT_ROOT / "assets"
CATALOG_PATH = ASSETS_DIR / "ct_enemies_001.json"


# =============================================================================
# DATA TYPES
# =============================================================================

@dataclass(frozen=True)
class ClipSpec:
    name: str
    slot: str

    mp4_path: Path

    start_index: int
    end_index: int
    step: int

    loop: bool
    fps_override: float | None

    crop: tuple[int, int, int, int] | None
    scale: float

    anchor_x: float
    anchor_y: float

    reverse: bool
    ping_pong: bool


@dataclass
class ProcessedFrame:
    frame_id: str
    clip_slot: str
    source_index: int

    image: Image.Image

    anchor_x_pixels: float
    anchor_y_pixels: float


@dataclass
class ClipBuild:
    spec: ClipSpec

    source_fps: float

    base_frame_ids: list[str]
    playback_frame_ids: list[str]

    animation_fps: float


# =============================================================================
# GENERAL HELPERS
# =============================================================================

def die(message: str) -> None:
    raise SystemExit(f"ERROR: {message}")


def check(condition: bool, message: str) -> None:
    if not condition:
        die(message)


def as_float(
    value: Any,
    label: str,
    minimum: float | None = None,
) -> float:
    try:
        result = float(value)
    except (TypeError, ValueError):
        die(f"{label} must be numeric.")

    check(
        math.isfinite(result),
        f"{label} must be finite.",
    )

    if minimum is not None:
        check(
            result >= minimum,
            f"{label} must be at least {minimum}.",
        )

    return result


def as_int(
    value: Any,
    label: str,
    minimum: int | None = None,
) -> int:
    check(
        not isinstance(value, bool),
        f"{label} must be an integer.",
    )

    try:
        result = int(value)
    except (TypeError, ValueError):
        die(f"{label} must be an integer.")

    check(
        result == value,
        f"{label} must be an integer.",
    )

    if minimum is not None:
        check(
            result >= minimum,
            f"{label} must be at least {minimum}.",
        )

    return result


def clean_number(
    value: float,
    digits: int = 8,
) -> int | float:
    value = round(float(value), digits)

    if abs(value - round(value)) < 10 ** (-digits):
        return int(round(value))

    return value


def slug(text: str) -> str:
    result = re.sub(
        r"[^a-z0-9]+",
        "_",
        str(text).lower(),
    ).strip("_")

    return result or "animation"


def read_json(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(
            path.read_text(encoding="utf-8")
        )
    except FileNotFoundError:
        die(f"Missing required file: {path}")
    except json.JSONDecodeError as exc:
        die(f"Invalid JSON in {path}: {exc}")

    check(
        isinstance(data, dict),
        f"Expected a JSON object in {path}",
    )

    return data


def json_bytes(data: dict[str, Any]) -> bytes:
    return (
        json.dumps(
            data,
            ensure_ascii=False,
            indent=4,
        )
        + "\n"
    ).encode("utf-8")


def png_bytes(image: Image.Image) -> bytes:
    stream = BytesIO()

    image.save(
        stream,
        format="PNG",
        optimize=True,
    )

    return stream.getvalue()


def write_atomic(
    path: Path,
    payload: bytes,
    backup: bool = False,
) -> None:
    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    previous_mode = (
        path.stat().st_mode & 0o777
        if path.exists()
        else 0o644
    )

    if backup and path.exists():
        backup_path = path.with_name(
            path.name + ".bak"
        )

        shutil.copy2(
            path,
            backup_path,
        )

    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.",
        suffix=".tmp",
        dir=path.parent,
    )

    temporary_path = Path(temporary_name)

    try:
        with os.fdopen(
            descriptor,
            "wb",
        ) as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())

        os.replace(
            temporary_path,
            path,
        )

        os.chmod(
            path,
            previous_mode,
        )

    finally:
        temporary_path.unlink(
            missing_ok=True
        )


def build_names() -> dict[str, str]:
    match = re.search(
        r"(\d+)\s*$",
        OUTPUT_PREFIX,
    )

    check(
        match is not None,
        "OUTPUT_PREFIX must end in a number, "
        "such as CT_Enemy_004.",
    )

    suffix = match.group(1).zfill(3)

    return {
        "suffix": suffix,

        "enemy_key": f"enemy_{suffix}",

        "atlas_id": f"ct_atlas_enemy_{suffix}",
        "rig_id": f"ct_rig_enemy_{suffix}",
        "character_id": f"ct_char_enemy_{suffix}",

        "atlas_png": f"ct_atlas_enemy_{suffix}.png",
        "atlas_json": f"ct_atlas_enemy_{suffix}.json",
        "rig_json": f"ct_rig_enemy_{suffix}.json",
        "character_json": f"ct_char_enemy_{suffix}.json",
    }


def resolve_input_path(filename: str) -> Path:
    source = Path(filename).expanduser()

    candidates = (
        [source]
        if source.is_absolute()
        else [
            SCRIPT_DIR / source,
            PROJECT_ROOT / source,
        ]
    )

    for candidate in candidates:
        if candidate.is_file():
            return candidate.resolve()

    die(
        f"Could not find MP4 {filename!r}. Checked:\n  "
        + "\n  ".join(
            str(candidate)
            for candidate in candidates
        )
    )


# =============================================================================
# CONFIGURATION PARSING
# =============================================================================

def parse_crop(
    value: Any,
    label: str,
) -> tuple[int, int, int, int] | None:
    if value is None:
        return None

    check(
        isinstance(value, (tuple, list))
        and len(value) == 4,
        f"{label} must be "
        "(left, top, width, height) or None.",
    )

    left = as_int(
        value[0],
        f"{label}[0]",
        0,
    )

    top = as_int(
        value[1],
        f"{label}[1]",
        0,
    )

    width = as_int(
        value[2],
        f"{label}[2]",
        1,
    )

    height = as_int(
        value[3],
        f"{label}[3]",
        1,
    )

    return (
        left,
        top,
        width,
        height,
    )


def validate_global_settings() -> None:
    check(
        ASSETS_DIR.is_dir(),
        f"Expected assets directory at {ASSETS_DIR}",
    )

    check(
        FRAME_NUMBERING_BASE in (0, 1),
        "FRAME_NUMBERING_BASE must be 0 or 1.",
    )

    check(
        DEFAULT_FACING in ("left", "right"),
        'DEFAULT_FACING must be "left" or "right".',
    )

    check(
        isinstance(ANIMATIONS, dict)
        and ANIMATIONS,
        "ANIMATIONS must be a non-empty dictionary.",
    )

    as_float(
        TARGET_RENDER_HEIGHT,
        "TARGET_RENDER_HEIGHT",
        0.000001,
    )

    as_float(
        RIG_OFFSET_X_PIXELS,
        "RIG_OFFSET_X_PIXELS",
    )

    as_float(
        RIG_OFFSET_Y_PIXELS,
        "RIG_OFFSET_Y_PIXELS",
    )

    as_int(
        ATLAS_MAX_WIDTH,
        "ATLAS_MAX_WIDTH",
        1,
    )

    as_int(
        ATLAS_MAX_HEIGHT,
        "ATLAS_MAX_HEIGHT",
        1,
    )

    as_int(
        ATLAS_PADDING,
        "ATLAS_PADDING",
        0,
    )

    as_int(
        CELL_MARGIN,
        "CELL_MARGIN",
        0,
    )

    if ATLAS_COLUMNS is not None:
        as_int(
            ATLAS_COLUMNS,
            "ATLAS_COLUMNS",
            1,
        )


def parse_clips() -> list[ClipSpec]:
    validate_global_settings()

    clips: list[ClipSpec] = []
    used_slots: set[str] = set()

    for display_name, raw in ANIMATIONS.items():
        check(
            isinstance(raw, dict),
            f"ANIMATIONS[{display_name!r}] "
            "must be a dictionary.",
        )

        slot = slug(display_name)

        check(
            slot not in used_slots,
            "Two animation names reduce to "
            f"the same slot: {slot!r}.",
        )

        used_slots.add(slot)

        filename = str(
            raw.get(
                "mp4",
                DEFAULT_MP4,
            )
        ).strip()

        check(
            bool(filename),
            f"Animation {display_name!r} "
            "has no MP4 filename.",
        )

        start_number = as_int(
            raw.get("start"),
            f"{display_name}.start",
        )

        end_number = as_int(
            raw.get("end"),
            f"{display_name}.end",
        )

        check(
            end_number >= start_number,
            f"{display_name}.end must not precede start.",
        )

        check(
            start_number >= FRAME_NUMBERING_BASE,
            f"{display_name}.start is below "
            "FRAME_NUMBERING_BASE.",
        )

        step = as_int(
            raw.get(
                "step",
                DEFAULT_FRAME_STEP,
            ),
            f"{display_name}.step",
            1,
        )

        scale = as_float(
            raw.get(
                "scale",
                DEFAULT_SCALE,
            ),
            f"{display_name}.scale",
            0.000001,
        )

        anchor_x = as_float(
            raw.get(
                "anchor_x",
                DEFAULT_ANCHOR_X,
            ),
            f"{display_name}.anchor_x",
        )

        anchor_y = as_float(
            raw.get(
                "anchor_y",
                DEFAULT_ANCHOR_Y,
            ),
            f"{display_name}.anchor_y",
        )

        check(
            0 <= anchor_x <= 1,
            f"{display_name}.anchor_x "
            "must be between 0 and 1.",
        )

        check(
            0 <= anchor_y <= 1,
            f"{display_name}.anchor_y "
            "must be between 0 and 1.",
        )

        fps_value = raw.get(
            "fps",
            DEFAULT_ANIMATION_FPS,
        )

        fps_override = (
            None
            if fps_value is None
            else as_float(
                fps_value,
                f"{display_name}.fps",
                0.000001,
            )
        )

        clips.append(
            ClipSpec(
                name=str(display_name),
                slot=slot,

                mp4_path=resolve_input_path(
                    filename
                ),

                start_index=(
                    start_number
                    - FRAME_NUMBERING_BASE
                ),

                end_index=(
                    end_number
                    - FRAME_NUMBERING_BASE
                ),

                step=step,

                loop=bool(
                    raw.get(
                        "loop",
                        DEFAULT_LOOP,
                    )
                ),

                fps_override=fps_override,

                crop=parse_crop(
                    raw.get(
                        "crop",
                        DEFAULT_CROP,
                    ),
                    f"{display_name}.crop",
                ),

                scale=scale,

                anchor_x=anchor_x,
                anchor_y=anchor_y,

                reverse=bool(
                    raw.get(
                        "reverse",
                        DEFAULT_REVERSE,
                    )
                ),

                ping_pong=bool(
                    raw.get(
                        "ping_pong",
                        DEFAULT_PING_PONG,
                    )
                ),
            )
        )

    requested_default = (
        slug(DEFAULT_ANIMATION)
        if DEFAULT_ANIMATION
        else clips[0].slot
    )

    check(
        requested_default
        in {
            clip.slot
            for clip in clips
        },
        f"DEFAULT_ANIMATION {DEFAULT_ANIMATION!r} "
        "is not present in ANIMATIONS.",
    )

    return clips


# =============================================================================
# VIDEO DECODING
# =============================================================================

def inspect_video(
    path: Path,
) -> tuple[float, int]:
    capture = cv2.VideoCapture(
        str(path)
    )

    check(
        capture.isOpened(),
        f"OpenCV could not open {path}",
    )

    try:
        fps = float(
            capture.get(
                cv2.CAP_PROP_FPS
            )
        )

        frame_count = int(
            round(
                capture.get(
                    cv2.CAP_PROP_FRAME_COUNT
                )
            )
        )

    finally:
        capture.release()

    check(
        math.isfinite(fps)
        and fps > 0,
        f"{path.name} does not report a usable FPS.",
    )

    check(
        frame_count > 0,
        f"{path.name} does not report "
        "a usable frame count.",
    )

    return (
        fps,
        frame_count,
    )


def decode_requested_frames(
    path: Path,
    requested_indices: set[int],
) -> tuple[float, dict[int, Any]]:
    fps, frame_count = inspect_video(
        path
    )

    highest = max(
        requested_indices
    )

    check(
        highest < frame_count,
        "Requested frame "
        f"{highest + FRAME_NUMBERING_BASE} "
        f"exceeds {path.name}'s "
        f"{frame_count} frames.",
    )

    capture = cv2.VideoCapture(
        str(path)
    )

    check(
        capture.isOpened(),
        f"OpenCV could not reopen {path}",
    )

    decoded: dict[int, Any] = {}
    index = 0

    try:
        while index <= highest:
            ok, frame = capture.read()

            if not ok:
                break

            if index in requested_indices:
                decoded[index] = frame.copy()

            index += 1

    finally:
        capture.release()

    missing = sorted(
        requested_indices
        - decoded.keys()
    )

    check(
        not missing,
        f"Could not decode all requested frames "
        f"from {path.name}. Missing: "
        + ", ".join(
            str(
                index
                + FRAME_NUMBERING_BASE
            )
            for index in missing[:20]
        ),
    )

    return (
        fps,
        decoded,
    )


# =============================================================================
# IMAGE PROCESSING
# =============================================================================

def crop_and_scale(
    frame_bgr: Any,
    spec: ClipSpec,
) -> Image.Image:
    frame = frame_bgr[:, :, :3]

    source_height, source_width = (
        frame.shape[:2]
    )

    if spec.crop is not None:
        left, top, width, height = (
            spec.crop
        )

        check(
            left + width <= source_width
            and top + height <= source_height,
            f"Crop for animation {spec.name!r} "
            f"exceeds source size "
            f"{source_width}x{source_height}.",
        )

        frame = frame[
            top:top + height,
            left:left + width,
        ]

    if abs(spec.scale - 1.0) > 1e-9:
        output_width = max(
            1,
            round(
                frame.shape[1]
                * spec.scale
            ),
        )

        output_height = max(
            1,
            round(
                frame.shape[0]
                * spec.scale
            ),
        )

        interpolation = (
            cv2.INTER_AREA
            if spec.scale < 1
            else cv2.INTER_CUBIC
        )

        frame = cv2.resize(
            frame,
            (
                output_width,
                output_height,
            ),
            interpolation=interpolation,
        )

    rgba = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGBA,
    )

    return Image.fromarray(
        rgba
    )


def build_processed_frames(
    clips: list[ClipSpec],
) -> tuple[
    list[ProcessedFrame],
    list[ClipBuild],
]:
    clips_by_video: dict[
        Path,
        list[ClipSpec],
    ] = {}

    for clip in clips:
        clips_by_video.setdefault(
            clip.mp4_path,
            [],
        ).append(clip)

    decoded_by_video: dict[
        Path,
        dict[int, Any],
    ] = {}

    fps_by_video: dict[
        Path,
        float,
    ] = {}

    # Decode each source video only once.
    for path, video_clips in clips_by_video.items():
        requested: set[int] = set()

        for clip in video_clips:
            requested.update(
                range(
                    clip.start_index,
                    clip.end_index + 1,
                    clip.step,
                )
            )

        fps, decoded = decode_requested_frames(
            path,
            requested,
        )

        fps_by_video[path] = fps
        decoded_by_video[path] = decoded

    processed: list[ProcessedFrame] = []
    clip_builds: list[ClipBuild] = []

    for clip in clips:
        indices = list(
            range(
                clip.start_index,
                clip.end_index + 1,
                clip.step,
            )
        )

        digits = max(
            3,
            len(
                str(
                    len(indices)
                )
            ),
        )

        base_ids: list[str] = []

        for ordinal, source_index in enumerate(
            indices,
            start=1,
        ):
            source_frame = (
                decoded_by_video[
                    clip.mp4_path
                ][source_index]
            )

            image = crop_and_scale(
                source_frame,
                clip,
            )

            frame_id = (
                f"{clip.slot}_"
                f"{ordinal:0{digits}d}"
            )

            anchor_x_pixels = (
                clip.anchor_x
                * image.width
            )

            anchor_y_pixels = (
                clip.anchor_y
                * image.height
            )

            processed.append(
                ProcessedFrame(
                    frame_id=frame_id,
                    clip_slot=clip.slot,
                    source_index=source_index,
                    image=image,
                    anchor_x_pixels=anchor_x_pixels,
                    anchor_y_pixels=anchor_y_pixels,
                )
            )

            base_ids.append(
                frame_id
            )

        if clip.reverse:
            playback = list(
                reversed(base_ids)
            )
        else:
            playback = list(
                base_ids
            )

        # Example:
        #
        #     1, 2, 3, 4
        #
        # becomes:
        #
        #     1, 2, 3, 4, 3, 2
        #
        if (
            clip.ping_pong
            and len(playback) > 2
        ):
            playback = (
                playback
                + playback[-2:0:-1]
            )

        source_fps = fps_by_video[
            clip.mp4_path
        ]

        animation_fps = (
            clip.fps_override
            or (
                source_fps
                / clip.step
            )
        )

        clip_builds.append(
            ClipBuild(
                spec=clip,

                source_fps=source_fps,

                base_frame_ids=base_ids,
                playback_frame_ids=playback,

                animation_fps=animation_fps,
            )
        )

    return (
        processed,
        clip_builds,
    )


# =============================================================================
# COMMON FRAME REGISTRATION
# =============================================================================

def register_frames_to_common_cell(
    frames: list[ProcessedFrame],
) -> tuple[
    list[
        tuple[
            ProcessedFrame,
            Image.Image,
        ]
    ],
    int,
    int,
    float,
    float,
]:
    check(
        bool(frames),
        "No processed frames were produced.",
    )

    left_extent = max(
        frame.anchor_x_pixels
        for frame in frames
    )

    right_extent = max(
        frame.image.width
        - frame.anchor_x_pixels
        for frame in frames
    )

    top_extent = max(
        frame.anchor_y_pixels
        for frame in frames
    )

    bottom_extent = max(
        frame.image.height
        - frame.anchor_y_pixels
        for frame in frames
    )

    common_anchor_x = (
        math.ceil(left_extent)
        + CELL_MARGIN
    )

    common_anchor_y = (
        math.ceil(top_extent)
        + CELL_MARGIN
    )

    cell_width = (
        math.ceil(
            left_extent
            + right_extent
        )
        + CELL_MARGIN * 2
    )

    cell_height = (
        math.ceil(
            top_extent
            + bottom_extent
        )
        + CELL_MARGIN * 2
    )

    check(
        cell_width > 0
        and cell_height > 0,
        "Calculated atlas cell size is invalid.",
    )

    registered: list[
        tuple[
            ProcessedFrame,
            Image.Image,
        ]
    ] = []

    for frame in frames:
        cell = Image.new(
            "RGBA",
            (
                cell_width,
                cell_height,
            ),
            (
                0,
                0,
                0,
                0,
            ),
        )

        paste_x = round(
            common_anchor_x
            - frame.anchor_x_pixels
        )

        paste_y = round(
            common_anchor_y
            - frame.anchor_y_pixels
        )

        check(
            paste_x >= 0
            and paste_y >= 0
            and (
                paste_x
                + frame.image.width
                <= cell_width
            )
            and (
                paste_y
                + frame.image.height
                <= cell_height
            ),
            f"Internal registration error "
            f"for {frame.frame_id}.",
        )

        cell.alpha_composite(
            frame.image,
            (
                paste_x,
                paste_y,
            ),
        )

        registered.append(
            (
                frame,
                cell,
            )
        )

    return (
        registered,
        cell_width,
        cell_height,
        common_anchor_x,
        common_anchor_y,
    )


# =============================================================================
# ATLAS GENERATION
# =============================================================================

def build_atlas(
    registered_frames: list[
        tuple[
            ProcessedFrame,
            Image.Image,
        ]
    ],
    cell_width: int,
    cell_height: int,
) -> tuple[
    Image.Image,
    dict[
        str,
        dict[str, int],
    ],
    int,
    int,
]:
    check(
        cell_width <= ATLAS_MAX_WIDTH,
        "One atlas cell is wider than "
        f"ATLAS_MAX_WIDTH={ATLAS_MAX_WIDTH}.",
    )

    if ATLAS_COLUMNS is None:
        columns = max(
            1,
            (
                ATLAS_MAX_WIDTH
                + ATLAS_PADDING
            )
            // (
                cell_width
                + ATLAS_PADDING
            ),
        )

    else:
        columns = int(
            ATLAS_COLUMNS
        )

    columns = min(
        columns,
        len(registered_frames),
    )

    rows = math.ceil(
        len(registered_frames)
        / columns
    )

    atlas_width = (
        columns * cell_width
        + (
            columns - 1
        ) * ATLAS_PADDING
    )

    atlas_height = (
        rows * cell_height
        + (
            rows - 1
        ) * ATLAS_PADDING
    )

    check(
        atlas_width <= ATLAS_MAX_WIDTH,
        f"Atlas width {atlas_width} exceeds "
        f"ATLAS_MAX_WIDTH={ATLAS_MAX_WIDTH}.",
    )

    check(
        atlas_height <= ATLAS_MAX_HEIGHT,
        f"Atlas height {atlas_height} exceeds "
        f"ATLAS_MAX_HEIGHT={ATLAS_MAX_HEIGHT}. "
        "Reduce source crop/scale or increase "
        "the atlas limit.",
    )

    atlas = Image.new(
        "RGBA",
        (
            atlas_width,
            atlas_height,
        ),
        (
            0,
            0,
            0,
            0,
        ),
    )

    rectangles: dict[
        str,
        dict[str, int],
    ] = {}

    for index, (
        frame,
        cell,
    ) in enumerate(
        registered_frames
    ):
        x = (
            index % columns
        ) * (
            cell_width
            + ATLAS_PADDING
        )

        y = (
            index // columns
        ) * (
            cell_height
            + ATLAS_PADDING
        )

        atlas.alpha_composite(
            cell,
            (
                x,
                y,
            ),
        )

        rectangles[
            frame.frame_id
        ] = {
            "x": x,
            "y": y,
            "w": cell_width,
            "h": cell_height,
        }

    return (
        atlas,
        rectangles,
        columns,
        rows,
    )


# =============================================================================
# JSON FILENAMES
# =============================================================================

def animation_filename(
    suffix: str,
    slot: str,
) -> str:
    return (
        f"ct_anim_enemy_"
        f"{suffix}_{slot}.json"
    )


def animation_id(
    suffix: str,
    slot: str,
) -> str:
    return (
        f"ct_anim_enemy_"
        f"{suffix}_{slot}"
    )


# =============================================================================
# ATLAS JSON
# =============================================================================

def build_atlas_json(
    names: dict[str, str],
    frame_ids: list[str],
    rectangles: dict[
        str,
        dict[str, int],
    ],
) -> dict[str, Any]:
    return {
        "meta": {
            "version": 1,

            "note": (
                "Generated by "
                "devel/build_enemy_from_mp4.py. "
                "Frames use common fixed-size, "
                "anchor-registered cells."
            ),
        },

        "atlasId": names[
            "atlas_id"
        ],

        "image": names[
            "atlas_png"
        ],

        "frames": rectangles,

        "objects": {
            frame_id: {
                "id": frame_id,
                "frame": frame_id,

                "type": "characterPart",
                "layer": "character",

                "mirrorable": bool(
                    MIRRORABLE
                ),

                "tags": [
                    "frameAnimation",
                    names["enemy_key"],
                    frame_id.rsplit(
                        "_",
                        1,
                    )[0],
                ],
            }
            for frame_id in frame_ids
        },
    }


# =============================================================================
# RIG JSON
# =============================================================================

def build_rig_json(
    names: dict[str, str],
    frame_ids: list[str],

    cell_width: int,
    cell_height: int,

    common_anchor_x: float,
    common_anchor_y: float,

    default_frame_id: str,
) -> dict[str, Any]:
    pivot_x = (
        common_anchor_x
        / cell_width
    )

    pivot_y = (
        common_anchor_y
        / cell_height
    )

    global_scale = (
        as_float(
            TARGET_RENDER_HEIGHT,
            "TARGET_RENDER_HEIGHT",
            0.000001,
        )
        / cell_height
    )

    offset_x = as_float(
        RIG_OFFSET_X_PIXELS,
        "RIG_OFFSET_X_PIXELS",
    )

    offset_y = as_float(
        RIG_OFFSET_Y_PIXELS,
        "RIG_OFFSET_Y_PIXELS",
    )

    return {
        "meta": {
            "version": 1,

            "note": (
                "Generated multi-animation "
                "frame-swapped rig."
            ),
        },

        "rigId": names[
            "rig_id"
        ],

        "atlasId": names[
            "atlas_id"
        ],

        "atlasManifest": names[
            "atlas_json"
        ],

        "drawOrder": frame_ids,

        "global": {
            "scale": clean_number(
                global_scale
            ),

            "lean": 0,

            "rootX": 0,
            "rootYOffsetFromGround": 0,
            "groundOffset": 0,

            "debugPivots": False,
        },

        "anchors": {},

        "pivots": {
            frame_id: {
                "x": clean_number(
                    pivot_x
                ),

                "y": clean_number(
                    pivot_y
                ),
            }
            for frame_id in frame_ids
        },

        "parts": {
            frame_id: {
                "frame": frame_id,

                "role": "animationFrame",

                "tags": [
                    "frameAnimation",
                    frame_id.rsplit(
                        "_",
                        1,
                    )[0],
                ],

                "offset": {
                    "x": clean_number(
                        offset_x
                    ),

                    "y": clean_number(
                        offset_y
                    ),
                },

                "scale": 1,

                "targetHeight": (
                    cell_height
                ),

                "alpha": (
                    1
                    if frame_id
                    == default_frame_id
                    else 0
                ),
            }
            for frame_id in frame_ids
        },
    }


# =============================================================================
# ANIMATION JSON
# =============================================================================

def build_animation_json(
    names: dict[str, str],
    clip: ClipBuild,
    all_frame_ids: list[str],
) -> dict[str, Any]:
    playback = (
        clip.playback_frame_ids
    )

    frame_duration = (
        1.0
        / clip.animation_fps
    )

    times = [
        clean_number(
            index
            * frame_duration
        )
        for index in range(
            len(playback)
        )
    ]

    initial_frame = playback[0]

    reference_pose = {
        frame_id: {
            "x": clean_number(
                RIG_OFFSET_X_PIXELS
            ),

            "y": clean_number(
                RIG_OFFSET_Y_PIXELS
            ),

            "rotation": 0,
            "scale": 1,

            "alpha": (
                1
                if frame_id
                == initial_frame
                else 0
            ),
        }
        for frame_id in all_frame_ids
    }

    current_frame_set = set(
        clip.base_frame_ids
    )

    tracks: dict[
        str,
        dict[
            str,
            list[
                dict[str, Any]
            ],
        ],
    ] = {}

    for frame_id in all_frame_ids:
        if frame_id in current_frame_set:
            tracks[frame_id] = {
                "alpha": [
                    {
                        "time": time,

                        "value": (
                            1
                            if visible_frame_id
                            == frame_id
                            else 0
                        ),

                        "easing": "step",
                    }
                    for (
                        time,
                        visible_frame_id,
                    ) in zip(
                        times,
                        playback,
                        strict=True,
                    )
                ]
            }

        else:
            tracks[frame_id] = {
                "alpha": [
                    {
                        "time": 0,
                        "value": 0,
                        "easing": "step",
                    }
                ]
            }

    # Validate that exactly one clip frame is visible
    # at each animation key.
    for key_index in range(
        len(playback)
    ):
        visible_count = sum(
            tracks[
                frame_id
            ]["alpha"][
                key_index
            ]["value"]
            for frame_id
            in clip.base_frame_ids
        )

        check(
            visible_count == 1,
            f"Animation {clip.spec.slot!r}, "
            f"key {key_index}, does not display "
            "exactly one frame.",
        )

    return {
        "meta": {
            "version": 1,

            "note": (
                f"Generated from "
                f"{clip.spec.mp4_path.name}; "
                f"source FPS "
                f"{clean_number(clip.source_fps)}, "
                f"animation FPS "
                f"{clean_number(clip.animation_fps)}."
            ),
        },

        "animationId": animation_id(
            names["suffix"],
            clip.spec.slot,
        ),

        "duration": clean_number(
            len(playback)
            / clip.animation_fps
        ),

        "loop": bool(
            clip.spec.loop
        ),

        "mirrorable": bool(
            MIRRORABLE
        ),

        "referencePose": (
            reference_pose
        ),

        "tracks": tracks,

        "presentation": {
            "mode": (
                "exclusive_frame_parts"
            ),

            "parts": (
                clip.base_frame_ids
            ),
        },
    }


# =============================================================================
# CHARACTER JSON
# =============================================================================

def build_character_json(
    names: dict[str, str],
    clip_builds: list[ClipBuild],
) -> dict[str, Any]:
    return {
        "meta": {
            "version": 1,

            "note": (
                "Generated by "
                "devel/build_enemy_from_mp4.py."
            ),
        },

        "characterId": names[
            "character_id"
        ],

        "displayName": OUTPUT_NAME,

        "rig": names[
            "rig_json"
        ],

        "defaultFacing": (
            DEFAULT_FACING
        ),

        "mirrorable": bool(
            MIRRORABLE
        ),

        "animationMap": {
            clip.spec.slot: (
                animation_filename(
                    names["suffix"],
                    clip.spec.slot,
                )
            )
            for clip in clip_builds
        },
    }


# =============================================================================
# ENEMY CATALOG
# =============================================================================

def make_neutral_catalog_entry(
    names: dict[str, str],
    default_slot: str,
) -> dict[str, Any]:
    movement_speed = as_float(
        CATALOG_MOVEMENT_SPEED,
        "CATALOG_MOVEMENT_SPEED",
        0,
    )

    return {
        "label": OUTPUT_NAME,

        "icon": CATALOG_ICON,

        "description": (
            CATALOG_DESCRIPTION
        ),

        "characterId": names[
            "character_id"
        ],

        "defaultSize": {
            "w": as_int(
                DEFAULT_HITBOX_WIDTH,
                "DEFAULT_HITBOX_WIDTH",
                1,
            ),

            "h": as_int(
                DEFAULT_HITBOX_HEIGHT,
                "DEFAULT_HITBOX_HEIGHT",
                1,
            ),
        },

        "defaults": {
            "facing": -1,

            "locomotion": "ground",

            "patrolDistance": as_float(
                CATALOG_PATROL_DISTANCE,
                "CATALOG_PATROL_DISTANCE",
                0,
            ),

            "walkSpeed": (
                movement_speed
            ),

            "idleDuration": 0,
            "turnPause": 0,

            "groundSnapDistance": 24,
            "maxStepHeight": 16,
            "maxDropDistance": 48,

            "renderScale": as_float(
                CATALOG_RENDER_SCALE,
                "CATALOG_RENDER_SCALE",
                0.000001,
            ),

            "health": as_float(
                CATALOG_HEALTH,
                "CATALOG_HEALTH",
                0.000001,
            ),

            "animationSlot": (
                default_slot
            ),

            "targetAnchor": {
                "x": 0.5,
                "y": 0.5,
            },

            "showTargetMarker": False,

            "attackDamage": 0,
            "attackRange": 1,
            "attackVerticalRange": 1,

            "attackDuration": 0.1,
            "attackHitTime": 0,
            "attackCooldown": 0,

            "awarenessRange": 0,
            "awarenessHoldDuration": 0,

            "attackLungeDistance": 0,
            "attackLungeSpeed": 0,

            "strategy": "simple_patrol",

            "runSpeed": (
                movement_speed
            ),

            "jumpHeight": 0,

            "unreachableGlareDuration": 0,

            "awarenessViewHalfAngle": 60,

            "flightAmplitude": as_float(
                CATALOG_FLIGHT_AMPLITUDE,
                "CATALOG_FLIGHT_AMPLITUDE",
                0,
            ),

            "flightCyclesPerSecond": as_float(
                CATALOG_FLIGHT_CYCLES_PER_SECOND,
                "CATALOG_FLIGHT_CYCLES_PER_SECOND",
                0,
            ),

            "deathFlightSpeed": 520,
            "deathFlightLift": 210,
            "deathFlightGravity": 90,
            "deathFlyOffDistance": 720,

            "corpseHoldDuration": 0,
            "corpseFadeDuration": 0,

            "renderOffsetX": 0,
            "renderOffsetY": 0,
        },
    }


def prepare_catalog(
    names: dict[str, str],
    default_slot: str,
) -> dict[str, Any] | None:
    if not UPDATE_ENEMY_CATALOG:
        return None

    catalog = read_json(
        CATALOG_PATH
    )

    enemies = catalog.setdefault(
        "enemies",
        {},
    )

    check(
        isinstance(enemies, dict),
        "Enemy catalog has no valid "
        "enemies object.",
    )

    if (
        names["enemy_key"] in enemies
        and not OVERWRITE_EXISTING_CATALOG_ENTRY
    ):
        die(
            "Catalog already contains "
            f"{names['enemy_key']}. Set "
            "OVERWRITE_EXISTING_CATALOG_ENTRY=True "
            "to replace it."
        )

    if CATALOG_TEMPLATE_ENEMY_KEY is not None:
        check(
            CATALOG_TEMPLATE_ENEMY_KEY
            in enemies,
            "Catalog template "
            f"{CATALOG_TEMPLATE_ENEMY_KEY!r} "
            "was not found.",
        )

        entry = copy.deepcopy(
            enemies[
                CATALOG_TEMPLATE_ENEMY_KEY
            ]
        )

        check(
            isinstance(entry, dict),
            "Catalog template entry "
            "is not an object.",
        )

        entry["label"] = (
            OUTPUT_NAME
        )

        entry["icon"] = (
            CATALOG_ICON
        )

        entry["description"] = (
            CATALOG_DESCRIPTION
        )

        entry["characterId"] = (
            names["character_id"]
        )

        defaults = entry.setdefault(
            "defaults",
            {},
        )

        if isinstance(defaults, dict):
            defaults[
                "animationSlot"
            ] = default_slot

    else:
        entry = make_neutral_catalog_entry(
            names,
            default_slot,
        )

    enemies[
        names["enemy_key"]
    ] = entry

    meta = catalog.setdefault(
        "meta",
        {},
    )

    if isinstance(meta, dict):
        try:
            meta["version"] = max(
                1,
                int(
                    meta.get(
                        "version",
                        0,
                    )
                )
                + 1,
            )

        except (TypeError, ValueError):
            meta["version"] = 1

        meta["lastGenerator"] = (
            "devel/build_enemy_from_mp4.py"
        )

        meta["lastGeneratedEnemy"] = (
            names["enemy_key"]
        )

    return catalog


# =============================================================================
# MAIN
# =============================================================================

def main() -> None:
    names = build_names()
    clips = parse_clips()

    default_slot = (
        slug(DEFAULT_ANIMATION)
        if DEFAULT_ANIMATION
        else clips[0].slot
    )

    output_paths: dict[
        str,
        Path,
    ] = {
        "atlas_png": (
            ASSETS_DIR
            / names["atlas_png"]
        ),

        "atlas_json": (
            ASSETS_DIR
            / names["atlas_json"]
        ),

        "rig_json": (
            ASSETS_DIR
            / names["rig_json"]
        ),

        "character_json": (
            ASSETS_DIR
            / names["character_json"]
        ),
    }

    for clip in clips:
        output_paths[
            f"animation_{clip.slot}"
        ] = (
            ASSETS_DIR
            / animation_filename(
                names["suffix"],
                clip.slot,
            )
        )

    existing = [
        path
        for path
        in output_paths.values()
        if path.exists()
    ]

    if (
        existing
        and not OVERWRITE_EXISTING_FILES
    ):
        die(
            "Refusing to overwrite existing files:\n  "
            + "\n  ".join(
                str(path)
                for path in existing
            )
            + "\nSet OVERWRITE_EXISTING_FILES=True "
            "only after checking OUTPUT_PREFIX."
        )

    # Validate catalog collisions before doing
    # the more expensive video processing.
    catalog = prepare_catalog(
        names,
        default_slot,
    )

    print(
        "Configured animations:"
    )

    for clip in clips:
        print(
            f"  {clip.slot:12} "
            f"{clip.mp4_path.name} "
            f"frames "
            f"{clip.start_index + FRAME_NUMBERING_BASE}"
            f"-"
            f"{clip.end_index + FRAME_NUMBERING_BASE} "
            f"step {clip.step}"
        )

    (
        processed_frames,
        clip_builds,
    ) = build_processed_frames(
        clips
    )

    (
        registered,
        cell_width,
        cell_height,
        common_anchor_x,
        common_anchor_y,
    ) = register_frames_to_common_cell(
        processed_frames
    )

    (
        atlas,
        rectangles,
        columns,
        rows,
    ) = build_atlas(
        registered,
        cell_width,
        cell_height,
    )

    all_frame_ids = [
        frame.frame_id
        for frame in processed_frames
    ]

    default_clip = next(
        clip
        for clip in clip_builds
        if clip.spec.slot
        == default_slot
    )

    default_frame_id = (
        default_clip
        .playback_frame_ids[0]
    )

    atlas_json = build_atlas_json(
        names,
        all_frame_ids,
        rectangles,
    )

    rig_json = build_rig_json(
        names,
        all_frame_ids,

        cell_width,
        cell_height,

        common_anchor_x,
        common_anchor_y,

        default_frame_id,
    )

    character_json = (
        build_character_json(
            names,
            clip_builds,
        )
    )

    animation_jsons = {
        clip.spec.slot: (
            build_animation_json(
                names,
                clip,
                all_frame_ids,
            )
        )
        for clip in clip_builds
    }

    # Confirm that every document can be serialized
    # before writing any output files.
    for document in [
        atlas_json,
        rig_json,
        character_json,
        *animation_jsons.values(),
    ]:
        json.dumps(
            document,
            ensure_ascii=False,
        )

    write_atomic(
        output_paths[
            "atlas_png"
        ],
        png_bytes(
            atlas
        ),
    )

    write_atomic(
        output_paths[
            "atlas_json"
        ],
        json_bytes(
            atlas_json
        ),
    )

    write_atomic(
        output_paths[
            "rig_json"
        ],
        json_bytes(
            rig_json
        ),
    )

    write_atomic(
        output_paths[
            "character_json"
        ],
        json_bytes(
            character_json
        ),
    )

    for slot, document in (
        animation_jsons.items()
    ):
        write_atomic(
            output_paths[
                f"animation_{slot}"
            ],
            json_bytes(
                document
            ),
        )

    if catalog is not None:
        write_atomic(
            CATALOG_PATH,
            json_bytes(
                catalog
            ),
            backup=(
                BACKUP_ENEMY_CATALOG
            ),
        )

    print(
        "\nBuild complete"
    )

    print(
        "  Enemy:         "
        f"{names['enemy_key']} / "
        f"{names['character_id']}"
    )

    print(
        "  Animations:    "
        f"{len(clip_builds)}"
    )

    print(
        "  Atlas frames:  "
        f"{len(all_frame_ids)}"
    )

    print(
        "  Cell size:     "
        f"{cell_width}x{cell_height}"
    )

    print(
        "  Common anchor: "
        f"("
        f"{clean_number(common_anchor_x)}, "
        f"{clean_number(common_anchor_y)}"
        f")"
    )

    print(
        "  Atlas:         "
        f"{atlas.width}x{atlas.height}, "
        f"{columns} columns x "
        f"{rows} rows"
    )

    for clip in clip_builds:
        duration = (
            len(
                clip.playback_frame_ids
            )
            / clip.animation_fps
        )

        print(
            f"  {clip.spec.slot:12} "
            f"{len(clip.base_frame_ids)} "
            f"atlas frames, "
            f"{len(clip.playback_frame_ids)} "
            f"playback frames, "
            f"{clean_number(clip.animation_fps)} fps, "
            f"{clean_number(duration)} seconds"
        )

    for path in output_paths.values():
        print(
            "  Wrote:         "
            f"{path.relative_to(PROJECT_ROOT)}"
        )

    if catalog is not None:
        print(
            "  Updated:       "
            f"{CATALOG_PATH.relative_to(PROJECT_ROOT)}"
        )

    print(
        "\nNext: remove the atlas background in GIMP."
    )

    print(
        "Do not resize the atlas or move imagery "
        "between its fixed cells."
    )

    print(
        "If animation changes visibly jump, adjust "
        "each clip's anchor_x and anchor_y so they "
        "identify the same anatomical point."
    )


if __name__ == "__main__":
    main()
    
