# Rogue_JS Notes

## Glyph Atlas

- The game now has two atlas concepts:
  - `BITMAP_ATLAS_COLOR_PNG` in `Rogue_JS.html` is the live in-game atlas.
  - `_atlas_mono_saved.png` is a saved monochrome fallback/reference atlas for later work.
- The current color atlas review image is `_atlas_color_generated.png`.

## Font Findings

- The embedded `RogueRareNotoColor` font is the best source for most emoji-style game glyphs.
- The embedded `RogueSymbols` font was not reliable for several UI/control symbols during atlas generation.
- Windows `seguisym.ttf` (`Segoe UI Symbol`) was reliable for control/button symbols like:
  - menu
  - map
  - log
  - close
  - movement arrows
  - zoom symbols
- Windows `seguiemj.ttf` (`Segoe UI Emoji`) was useful as a fallback for some color emoji that the embedded color font failed to render correctly.

## Important Rendering Quirks

- The gendered wizard ZWJ sequence `U+1F9D9 U+200D U+2642 U+FE0F` did not render correctly through the atlas-generation path.
- The closest Unicode-sequence rendering attempts were misleading. The correct male wizard was recovered by extracting the font's embedded bitmap glyphs directly from the `CBDT` table.
- The key glyphs found in the embedded color font were:
  - `glyph00232` = female mage
  - `glyph00233` = male mage
  - `u1F9D9` = plain ungendered mage
- The correct current wizard tile source is `glyph00233`.
- Direct extraction method:
  - load `RogueRareNotoColor` with `fontTools.ttLib.TTFont`
  - inspect `font['CBDT'].strikeData[0]`
  - extract `strike['glyph00233'].data`
  - strip the bytes before the embedded PNG header `89 50 4E 47 0D 0A 1A 0A`
  - save the remaining bytes as PNG
- The heart glyph in the embedded color font rendered blank.
- The heart tile currently needs a fallback source from `Segoe UI Emoji`.
- Glyphs with `FE0F` or `200D` must be treated as emoji during atlas generation, even when they are otherwise BMP codepoints.

## Atlas Build Lessons

- The first monochrome atlas was useful as a fallback reference, but it came from the wrong rendering path for the main color build.
- For color emoji tiles, render onto a larger transparent working canvas, crop to the glyph bounds, then center the cropped result into the fixed atlas cell.
- This avoids clipping wide glyphs like wind/tornado.
- Keep atlas tiles RGBA throughout. Do not flatten onto white.
- In runtime bitmap mode:
  - color mode should use atlas pixels as-is
  - mono mode may tint the sprite

## Current Hybrid Source Strategy

- Emoji/game creature/spell glyphs: primarily from `RogueRareNotoColor`
- Wizard tile: from the embedded `RogueRareNotoColor` bitmap glyph `glyph00233`
- UI/control symbols: from `Segoe UI Symbol`
- Problem fallback emoji such as heart: use `Segoe UI Emoji` if needed

## Files Worth Inspecting

- `Rogue_JS.html`
- `_atlas_color_generated.png`
- `_atlas_mono_saved.png`
