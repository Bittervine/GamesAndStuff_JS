## Layout Standard For Canvas Games

- Use the viewport as the outer layout container.
- Set both `html` and `body` to fill the viewport:
  - `width: 100dvw`
  - `height: 100dvh`
- Make `body` a 2-row CSS grid:
  - top row: `minmax(0, 1fr)` for the play area
  - bottom row: `auto` for controls
- Put the play canvas inside a dedicated wrapper element in the top row.
- Make the wrapper fill all remaining space:
  - `width: 100%`
  - `height: 100%`
  - `overflow: hidden`
- Keep the controls in the bottom row and ensure they always remain visible.
- Let JS measure the actual play-area wrapper size and resize the canvas drawing buffer to match.
- Let the canvas element stretch to the wrapper size with CSS.
- Draw using the actual canvas dimensions, not hard-coded sizes.
- Use the same computed origin and cell size for:
  - drawing
  - hit detection
  - input mapping
- After the first resize, do a second resize on the next animation frame so layout settles before final sizing.
- If controls need to shrink on short screens, shrink font and spacing rather than letting them overflow.

## Do

- Do let CSS decide the window layout.
- Do let JS adapt the canvas content to the measured space.
- Do keep controls visible at all times.
- Do remeasure after layout settles.

## Don’t

- Don’t size the canvas only from the window height or width.
- Don’t subtract control height twice.
- Don’t center the play area vertically if it wastes usable space.
- Don’t rely on a single early measurement before the browser has finished laying out the grid.
- Don’t let controls push the page into vertical scrolling.
