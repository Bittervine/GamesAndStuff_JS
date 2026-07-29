# Bundled proximity-text fonts

This directory contains the two original, unmodified Google Fonts files with
these exact names:

- `Inter[opsz,wght].ttf`
- `Caveat[wght].ttf`

Official sources:

- Inter: https://github.com/google/fonts/blob/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf
- Caveat: https://github.com/google/fonts/blob/main/ofl/caveat/Caveat%5Bwght%5D.ttf

The Level Editor exposes only `Inter` and `Caveat` for proximity-triggered TEXT
entities. Browser and SDL presentation both prefer these bundled files. A deliberately incomplete development tree may fall back to a system font, but shipped builds should retain these exact bundled files.

Do not rename, subset, convert, or otherwise modify the font files. Their full
SIL Open Font License 1.1 texts and copyright notices are retained under
`licenses/`.
