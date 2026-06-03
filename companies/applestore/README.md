# applestore — Design DNA

> **STATUS: ⚠️ TOMER HASN'T TESTED YET** — open the clone, click & hover the buttons, confirm it behaves like the real site.

**Source:** https://www.apple.com/store
**Captured:** 2026-06-03T02:29:13.801Z
**Tech stack:** React

## Palette (real, from rendered DOM)
- Page background: `#f5f5f7`
- Primary text: `#1d1d1f`
- Accent: `#333336`
- Top text colors: `#1d1d1f` `#000000` `#333336` `#6e6e73` `#ffffff` `#b64400`
- Top backgrounds: `#ffffff` `#d2d2d7` `#000000` `#f5f5f7` `#e8e8ed` `#add8ff`

## Typography
- Primary font: **SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif**
- Full stack: `"SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif`
- Size scale: `17px` `12px` `14px` `24px` `28px` `44px` `8.4px` `19.89px` `12.6px` `14.04px`
- H1: 80px / weight 600 / SF Pro Display
- Font files: `/wss/fonts/SF-Pro-Display/v3/sf-pro-display_thin.woff2` `/wss/fonts/SF-Pro-Display/v3/sf-pro-display_thin.woff` `/wss/fonts/SF-Pro-Display/v3/sf-pro-display_thin.ttf`

## Shape & components
- Border radii used: `18px` `56px` `5px` `980px`
- Primary button: bg `?`, text `#1d1d1f`, radius `0px`, padding `0px`, transform `none`
- Transitions present: yes

## Hover behaviour (the "it must feel the same" part)
- No hover delta captured (button may animate via transform/JS).

## Files
- `design-tokens.json` — structured tokens (the trainable artifact)
- `index.html` — interactive clone (open in browser, test it)
- `screenshot-desktop.png` — what the real site looked like when captured
- `raw/` — original HTML + CSS for deep reference
