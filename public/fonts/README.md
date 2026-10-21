# Open Sans for social cards

The build-time social-card renderer uses local Open Sans Latin WOFF files at weights 400 and 700. These files are not fetched when a page or social image is requested.

- Source package: `@fontsource/open-sans` version `5.3.0`.
- Upstream project: https://github.com/googlefonts/opensans
- Package source: https://github.com/fontsource/font-files/tree/main/fonts/google/open-sans
- Downloaded on 2026-10-21, unchanged, from jsDelivr:
  - https://cdn.jsdelivr.net/npm/@fontsource/open-sans@5.3.0/files/open-sans-latin-400-normal.woff
  - https://cdn.jsdelivr.net/npm/@fontsource/open-sans@5.3.0/files/open-sans-latin-700-normal.woff
- Local files:
  - `src/assets/fonts/open-sans-latin-400-normal.woff`, 17,252 bytes.
  - `src/assets/fonts/open-sans-latin-700-normal.woff`, 16,684 bytes.

Copyright 2020 The Open Sans Project Authors. The fonts are licensed under the SIL Open Font License 1.1. The full upstream license and copyright notice are preserved in [OFL-Open-Sans.txt](./OFL-Open-Sans.txt).

WOFF is intentional and supported by Satori. Each weight is a static font instance. The renderer embeds these local font bytes in its generated SVG before Sharp writes the PNG.
