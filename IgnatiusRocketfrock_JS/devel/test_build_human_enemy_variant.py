#!/usr/bin/env python3
"""Regression tests for the articulated human variant authoring helper."""

from __future__ import annotations

import importlib.util
from pathlib import Path


SCRIPT = Path(__file__).with_name("build_human_enemy_variant.py")
spec = importlib.util.spec_from_file_location("build_human_enemy_variant", SCRIPT)
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)


def expect_system_exit(callback, contains: str) -> None:
    try:
        callback()
    except SystemExit as exc:
        message = str(exc)
        assert contains in message, f"expected {contains!r} in {message!r}"
        return
    raise AssertionError("expected SystemExit")


def main() -> None:
    canonical_frames = {frame_id: {} for frame_id in module.ARM_FRAME_BY_PART.values()}
    assert module.authored_arm_frames("body_02", canonical_frames) == module.ARM_FRAME_BY_PART

    full_baked = dict(canonical_frames)
    expected_baked = {
        part_name: f"{base_frame}_body_08"
        for part_name, base_frame in module.ARM_FRAME_BY_PART.items()
    }
    full_baked.update({frame_id: {} for frame_id in expected_baked.values()})
    assert module.authored_arm_frames("body_08", full_baked) == expected_baked

    partial_baked = dict(canonical_frames)
    partial_baked[expected_baked["leftUpperArm"]] = {}
    expect_system_exit(
        lambda: module.authored_arm_frames("body_08", partial_baked),
        "partial baked arm set",
    )

    missing_canonical = dict(canonical_frames)
    missing_canonical.pop(module.ARM_FRAME_BY_PART["rightLowerArm"])
    expect_system_exit(
        lambda: module.authored_arm_frames("body_02", missing_canonical),
        "missing canonical articulated arm frame",
    )

    print("build_human_enemy_variant regression tests passed")


if __name__ == "__main__":
    main()
