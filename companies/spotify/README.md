# spotify — Design DNA

> **STATUS: ⚠️ TOMER HASN'T TESTED YET** — open the clone, click & hover the buttons, confirm it behaves like the real site.

**Source:** https://www.spotify.com
**Captured:** 2026-06-03T02:15:36.605Z
**Tech stack:** React

## Palette (real, from rendered DOM)
- Page background: `#1ed760`
- Primary text: `#b3b3b3`
- Accent: `#7c7c7c`
- Top text colors: `#ffffff` `#b3b3b3` `#000000` `#7c7c7c` `#121212` `#0000ee`
- Top backgrounds: `#1ed760` `#ffffff` `#1f1f1f` `#333333` `#121212` `#000000`

## Typography
- Primary font: **SpotifyMixUI, CircularSp-Arab, CircularSp-Hebr, CircularSp-Cyrl, CircularSp-Grek, CircularSp-Deva, "Helvetica Neue", helvetica, arial, "Hiragino Sans", "Hiragino Kaku Gothic ProN", Meiryo, "MS Gothic**
- Full stack: `SpotifyMixUI, CircularSp-Arab, CircularSp-Hebr, CircularSp-Cyrl, CircularSp-Grek, CircularSp-Deva, "Helvetica Neue", helvetica, arial, "Hiragino Sans", "Hiragino Kaku Gothic ProN", Meiryo, "MS Gothic"`
- Size scale: `16px` `13.3333px` `14px` `12px` `24px` `10.5px` `14.4px`
- H1: 16px / weight 700 / SpotifyMixUI
- Font files: n/a

## Shape & components
- Border radii used: `6px` `9999px` `500px` `50%`
- Primary button: bg `#1f1f1f`, text `#ffffff`, radius `50%`, padding `12px`, transform `none`
- Transitions present: yes

## Hover behaviour (the "it must feel the same" part)
- On hover, real buttons change: **bg** rgb(31, 31, 31) → rgb(42, 42, 42); **transform** none → matrix(1.04, 0, 0, 1.04, 0, 0)
- Transition timing: `background-color 0.2s ease-in-out, color 0.2s ease-in-out`

## Files
- `design-tokens.json` — structured tokens (the trainable artifact)
- `index.html` — interactive clone (open in browser, test it)
- `screenshot-desktop.png` — what the real site looked like when captured
- `raw/` — original HTML + CSS for deep reference
