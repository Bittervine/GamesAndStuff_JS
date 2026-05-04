#!/usr/bin/env python3
"""Compare Thorium Gap spawn count formulas by simulation.

This script runs 1000 trials for each level/difficulty combination and prints
the average spawn count for:

1. The current integer-random formula.
2. A fractional-random variant that preserves more difficulty scaling.
"""

from __future__ import annotations

import argparse
import math
import random
from dataclasses import dataclass


@dataclass(frozen=True)
class Difficulty:
    name: str
    spawn_count: float


DIFFICULTIES = [
    Difficulty("Easy", 0.8),
    Difficulty("Normal", 0.9),
    Difficulty("Hard", 1.1),
]


def clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def current_formula(level_index: int, diff_spawn_count: float) -> int:
    base = 4 + math.floor(level_index / 5) + random.randint(0, 2)
    return int(clamp(round(base * diff_spawn_count), 2, 9))


def fractional_formula(level_index: int, diff_spawn_count: float) -> int:
    base = 4 + math.floor(level_index / 5) + random.uniform(0.0, 2.0)
    return int(clamp(round(base * diff_spawn_count), 2, 9))


def average_spawn_count(trials: int, level_index: int, diff_spawn_count: float, fn) -> float:
    total = 0
    for _ in range(trials):
        total += fn(level_index, diff_spawn_count)
    return total / trials


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--trials", type=int, default=1000, help="Number of simulations per level/difficulty")
    parser.add_argument("--levels", type=int, default=25, help="How many level indices to test, starting at 0")
    args = parser.parse_args()

    print(f"Trials per cell: {args.trials}")
    print(f"Levels tested: 0..{args.levels - 1}")
    print()
    print(f"{'Level':>5}  {'Diff':<6}  {'Current':>8}  {'Fractional':>10}  {'Delta':>7}")
    print("-" * 46)

    for level_index in range(args.levels):
        for diff in DIFFICULTIES:
            current_avg = average_spawn_count(args.trials, level_index, diff.spawn_count, current_formula)
            fractional_avg = average_spawn_count(args.trials, level_index, diff.spawn_count, fractional_formula)
            delta = fractional_avg - current_avg
            print(
                f"{level_index:5d}  {diff.name:<6}  "
                f"{current_avg:8.3f}  {fractional_avg:10.3f}  {delta:7.3f}"
            )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
