# starbucks — Design DNA

> **STATUS: ⚠️ TOMER HASN'T TESTED YET** — open the clone, click & hover the buttons, confirm it behaves like the real site.

**Source:** https://www.starbucks.com
**Captured:** 2026-06-03T02:32:38.860Z
**Tech stack:** Next.js / React

## Palette (real, from rendered DOM)
- Page background: `#ffffff`
- Primary text: `#000000`
- Accent: `#008248`
- Top text colors: `#000000` `#ffffff` `#008248` `#00754a` `#808080`
- Top backgrounds: `#006242` `#ffffff` `#00754a` `#32462f` `#008248` `#000000`

## Typography
- Primary font: **SoDoSans, "Helvetica Neue", Helvetica, Arial, sans-serif**
- Full stack: `SoDoSans, "Helvetica Neue", Helvetica, Arial, sans-serif`
- Size scale: `16px` `14px` `19px` `24px` `13px` `10px` `14.25px`
- H1: ? / weight ? / 
- Font files: `/_next/static/media/LanderTall-Book.ca52961b.woff2` `/_next/static/media/LanderTall-Book.abb8fc70.woff` `/_next/static/media/SoDoSans-Regular.fb96a065.woff`

## Shape & components
- Border radii used: `50px` `8px` `12px 12px 0px 0px`
- Primary button: bg `#008248`, text `#ffffff`, radius `50px`, padding `7px 16px`, transform `capitalize`
- Transitions present: yes

## Hover behaviour (the "it must feel the same" part)
- On hover, real buttons change: **bg** rgb(0, 130, 72) → rgb(2, 93, 52)
- Transition timing: `all`

## Files
- `design-tokens.json` — structured tokens (the trainable artifact)
- `index.html` — interactive clone (open in browser, test it)
- `screenshot-desktop.png` — what the real site looked like when captured
- `raw/` — original HTML + CSS for deep reference
