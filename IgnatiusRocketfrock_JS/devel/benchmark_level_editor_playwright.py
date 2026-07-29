#!/usr/bin/env python3
"""Compare the Level Editor with the production Canvas baseline in Chromium.

This is an optional development probe. It requires Python Playwright and a
Chromium executable, and expects the project to be served over HTTP.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import math
import os
import re
from pathlib import Path
from typing import Any

try:
    from playwright.async_api import Browser, Page, async_playwright
except ImportError as error:  # pragma: no cover - optional local dependency
    raise SystemExit(
        "Python Playwright is required: python -m pip install playwright"
    ) from error

CADENCE_RE = re.compile(r"cadence\s+([0-9.]+)\s+fps")


def finite_number(value: Any, fallback: float = 0.0) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return fallback
    return number if math.isfinite(number) else fallback


async def drag_canvas(page: Page, selector: str, duration_seconds: float, steps: int) -> None:
    box = await page.locator(selector).bounding_box()
    if not box:
        raise RuntimeError(f"Could not measure {selector}")
    start_x = box["x"] + box["width"] * 0.68
    start_y = box["y"] + box["height"] * 0.42
    end_x = box["x"] + box["width"] * 0.28
    end_y = box["y"] + box["height"] * 0.62
    await page.mouse.move(start_x, start_y)
    await page.mouse.down()
    delay_ms = max(1.0, duration_seconds * 1000.0 / max(1, steps))
    for index in range(1, steps + 1):
        progress = index / steps
        await page.mouse.move(
            start_x + (end_x - start_x) * progress,
            start_y + (end_y - start_y) * progress,
        )
        await page.wait_for_timeout(delay_ms)
    await page.mouse.up()
    await page.wait_for_timeout(350)


async def layout_snapshot(page: Page) -> dict[str, Any]:
    return await page.evaluate(
        """() => {
            const stage = document.querySelector('#stage');
            const overlay = document.querySelector('#stage-overlay');
            const wrap = document.querySelector('#canvas-wrap') || stage?.parentElement;
            const workbench = document.querySelector('#workbench') || document.body;
            const rect = (node) => {
                const value = node?.getBoundingClientRect?.();
                return value ? { x: value.x, y: value.y, width: value.width, height: value.height, right: value.right } : null;
            };
            const transform = (node) => {
                const matrix = node?.getContext?.('2d')?.getTransform?.();
                return matrix ? { a: matrix.a, b: matrix.b, c: matrix.c, d: matrix.d, e: matrix.e, f: matrix.f } : null;
            };
            return {
                innerWidth,
                devicePixelRatio,
                bodyScrollWidth: document.body.scrollWidth,
                stage: rect(stage),
                overlay: rect(overlay),
                wrap: rect(wrap),
                workbench: rect(workbench),
                stageBacking: stage ? [stage.width, stage.height] : null,
                overlayBacking: overlay ? [overlay.width, overlay.height] : null,
                stageContextTransform: transform(stage),
                overlayContextTransform: transform(overlay)
            };
        }"""
    )


async def level_action_snapshot(page: Page) -> dict[str, Any]:
    return await page.evaluate(
        """() => {
            const levelPanel = document.querySelector('aside .box');
            const buttons = [...(levelPanel?.querySelectorAll('button') || [])].map((button) => button.textContent.trim());
            return {
                hasExportPanel: [...document.querySelectorAll('aside .box > h2')].some((heading) => heading.textContent.trim() === 'Export'),
                buttons,
                textareaCount: document.querySelectorAll('#export-json-summary, #open-json, #copy-json, aside .box textarea#level-json').length
            };
        }"""
    )


async def benchmark_baseline(
    browser: Browser,
    base_url: str,
    level: str,
    zoom: float,
    viewport: dict[str, int],
    device_scale_factor: float,
    duration: float,
    steps: int,
    screenshot_dir: Path | None,
) -> dict[str, Any]:
    context = await browser.new_context(viewport=viewport, device_scale_factor=device_scale_factor)
    page = await context.new_page()
    url = f"{base_url}/level-renderer-baseline.html?level={level}&zoom={zoom}&x=0&y=0"
    await page.goto(url, wait_until="domcontentloaded", timeout=120_000)
    await page.wait_for_function(
        "document.querySelector('#loading')?.hidden === true", timeout=120_000
    )
    await page.click("#reset")
    await drag_canvas(page, "#stage", duration, steps)
    readout = await page.locator("#readout-main").inner_text()
    match = CADENCE_RE.search(readout)
    result = {
        "readout": readout,
        "cadenceFps": finite_number(match.group(1) if match else 0),
        "layout": await layout_snapshot(page),
    }
    if screenshot_dir:
        await page.screenshot(path=str(screenshot_dir / "baseline.png"))
    await context.close()
    return result


async def benchmark_editor(
    browser: Browser,
    base_url: str,
    level: str,
    zoom: float,
    viewport: dict[str, int],
    device_scale_factor: float,
    duration: float,
    steps: int,
    screenshot_dir: Path | None,
) -> dict[str, Any]:
    context = await browser.new_context(viewport=viewport, device_scale_factor=device_scale_factor)
    page = await context.new_page()
    await page.goto(
        f"{base_url}/level-editor.html?profile=1&webgl=0",
        wait_until="domcontentloaded",
        timeout=120_000,
    )
    await page.wait_for_function(
        "document.querySelector('#level-select')?.options?.length >= 2",
        timeout=120_000,
    )
    await page.select_option("#level-select", f"levels/{level}.json")
    await page.click("#load-level")
    await page.wait_for_function(
        f"document.querySelector('#status')?.textContent.includes('Loaded levels/{level}.json')",
        timeout=120_000,
    )
    await page.fill("#zoom", str(zoom))
    await page.locator("#zoom").dispatch_event("change")
    await page.click('button[data-tool="pan"]')
    await drag_canvas(page, "#stage", duration, steps)
    performance = await page.evaluate("globalThis.__ignatiusEditorPerformance || null")
    readout = await page.locator("#renderer-readout").inner_text()
    result = {
        "readout": readout,
        "cadenceFps": finite_number((performance or {}).get("cadenceFps")),
        "performance": performance,
        "layout": await layout_snapshot(page),
        "levelActions": await level_action_snapshot(page),
    }
    if screenshot_dir:
        await page.screenshot(path=str(screenshot_dir / "editor.png"))
    await context.close()
    return result


def layout_warnings(name: str, result: dict[str, Any]) -> list[str]:
    layout = result.get("layout") or {}
    warnings: list[str] = []
    if finite_number(layout.get("bodyScrollWidth")) > finite_number(layout.get("innerWidth")) + 1:
        warnings.append(f"{name}: body horizontally overflows the viewport")
    stage = layout.get("stage") or {}
    wrap = layout.get("wrap") or {}
    workbench = layout.get("workbench") or {}
    if finite_number(stage.get("width")) > finite_number(workbench.get("width")) + 1:
        warnings.append(f"{name}: stage is wider than its workbench")
    if abs(finite_number(stage.get("width")) - finite_number(wrap.get("width"))) > 1:
        warnings.append(f"{name}: stage and viewport widths differ")
    stage_backing = layout.get("stageBacking")
    overlay_backing = layout.get("overlayBacking")
    if overlay_backing is not None and stage_backing != overlay_backing:
        warnings.append(f"{name}: stage and overlay backing sizes differ")
    stage_transform = layout.get("stageContextTransform") or {}
    identity_error = max(
        abs(finite_number(stage_transform.get("a"), 1) - 1),
        abs(finite_number(stage_transform.get("b"), 0)),
        abs(finite_number(stage_transform.get("c"), 0)),
        abs(finite_number(stage_transform.get("d"), 1) - 1),
        abs(finite_number(stage_transform.get("e"), 0)),
        abs(finite_number(stage_transform.get("f"), 0)),
    )
    if identity_error > 1e-6:
        warnings.append(f"{name}: production renderer inherited a non-identity Canvas transform")
    return warnings


async def async_main(args: argparse.Namespace) -> int:
    screenshot_dir = Path(args.screenshot_dir).resolve() if args.screenshot_dir else None
    if screenshot_dir:
        screenshot_dir.mkdir(parents=True, exist_ok=True)
    viewport = {"width": args.width, "height": args.height}
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            headless=not args.headed,
            executable_path=args.chromium or None,
            args=[
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--no-proxy-server",
                "--proxy-bypass-list=*",
            ],
        )
        try:
            baseline = await benchmark_baseline(
                browser, args.base_url.rstrip("/"), args.level, args.zoom,
                viewport, args.device_scale_factor, args.duration, args.steps, screenshot_dir,
            )
            editor = await benchmark_editor(
                browser, args.base_url.rstrip("/"), args.level, args.zoom,
                viewport, args.device_scale_factor, args.duration, args.steps, screenshot_dir,
            )
        finally:
            await browser.close()

    ratio = editor["cadenceFps"] / baseline["cadenceFps"] if baseline["cadenceFps"] > 0 else 0
    report = {
        "baseline": baseline,
        "editor": editor,
        "editorToBaselineCadenceRatio": ratio,
    }
    print(json.dumps(report, indent=2))
    warnings = layout_warnings("baseline", baseline) + layout_warnings("editor", editor)
    level_actions = editor.get("levelActions") or {}
    if level_actions.get("hasExportPanel"):
        warnings.append("editor: obsolete Export panel is still present")
    if int(level_actions.get("textareaCount") or 0) > 0:
        warnings.append("editor: obsolete export controls or serialized text surface remain")
    expected_actions = {"Load", "New level", "Import level", "Export level", "Load from Browser", "Save in Browser"}
    if not expected_actions.issubset(set(level_actions.get("buttons") or [])):
        warnings.append("editor: Level panel is missing one or more grouped level-data actions")
    if ratio and ratio < args.minimum_ratio:
        warnings.append(
            f"editor cadence is only {ratio:.2%} of baseline; expected at least {args.minimum_ratio:.0%}"
        )
    for warning in warnings:
        print(f"WARNING: {warning}")
    return 1 if warnings else 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    parser.add_argument("--chromium", default=os.environ.get("CHROMIUM_PATH", "/usr/bin/chromium"))
    parser.add_argument("--level", default="level_002")
    parser.add_argument("--zoom", type=float, default=0.365)
    parser.add_argument("--width", type=int, default=1749)
    parser.add_argument("--height", type=int, default=926)
    parser.add_argument("--device-scale-factor", type=float, default=1.1)
    parser.add_argument("--duration", type=float, default=3.0)
    parser.add_argument("--steps", type=int, default=180)
    parser.add_argument("--minimum-ratio", type=float, default=0.70)
    parser.add_argument("--screenshot-dir")
    parser.add_argument("--headed", action="store_true")
    return parser.parse_args()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(async_main(parse_args())))
