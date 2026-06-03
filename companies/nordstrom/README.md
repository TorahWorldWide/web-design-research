# nordstrom — Design DNA

> **STATUS: ⚠️ TOMER HASN'T TESTED YET** — open the clone, click & hover the buttons, confirm it behaves like the real site.

**Source:** https://www.nordstrom.com
**Captured:** 2026-06-03T02:19:17.641Z
**Tech stack:** React

## Palette (real, from rendered DOM)
- Page background: `#191a1b`
- Primary text: `#191a1b`
- Accent: `#647175`
- Top text colors: `#191a1b` `#647175` `#d82508` `#ffffff` `#dce3e6` `#000000`
- Top backgrounds: `#191a1b` `#ffffff` `#efefef` `#fff0ee` `#000000` `#b2d494`

## Typography
- Primary font: **Brandon Text", Arial, sans-serif**
- Full stack: `"Brandon Text", Arial, sans-serif`
- Size scale: `16px` `15px` `14px` `12px` `13px` `28px` `32px` `18px` `60px`
- H1: ? / weight ? / 
- Font files: `BrandonTextWeb-Bold.woff2` `BrandonTextWeb-Bold.woff` `BrandonTextWeb-Regular.woff2`

## Shape & components
- Border radii used: `2px` `4px` `8px` `50%`
- Primary button: bg `?`, text `#ffffff`, radius `0px`, padding `0px`, transform `none`
- Transitions present: yes

## Hover behaviour (the "it must feel the same" part)
- On hover, real buttons change: **borderColor** rgb(25, 26, 27) rgb(25, 26, 27) rgba(0, 0, 0, 0) → rgb(25, 26, 27) rgb(25, 26, 27) rgb(0, 0, 0)
- Transition timing: `opacity 0.25s`

## Files
- `design-tokens.json` — structured tokens (the trainable artifact)
- `index.html` — interactive clone (open in browser, test it)
- `screenshot-desktop.png` — what the real site looked like when captured
- `raw/` — original HTML + CSS for deep reference
