# figma — Design DNA

> **STATUS: ⚠️ TOMER HASN'T TESTED YET** — open the clone, click & hover the buttons, confirm it behaves like the real site.

**Source:** https://www.figma.com
**Captured:** 2026-06-03T02:14:54.076Z
**Tech stack:** Next.js / React, React, Framer

## Palette (real, from rendered DOM)
- Page background: `#ffffff`
- Primary text: `#000000`
- Accent: `#33dfdf`
- Top text colors: `#000000` `#ffffff` `#33dfdf` `#b98e01`
- Top backgrounds: `#ffffff` `#000000` `#e6e6e6` `#4d49fc` `#f3ffe3` `#e2e2e2`

## Typography
- Primary font: **figmaSans, "figmaSans Fallback", "SF Pro Display", system-ui, helvetica, sans-serif**
- Full stack: `figmaSans, "figmaSans Fallback", "SF Pro Display", system-ui, helvetica, sans-serif`
- Size scale: `18px` `16px` `24px` `56px` `72px` `12px`
- H1: 72px / weight 400 / figmaSans
- Font files: `/_netlify/_next/static/media/7c42ed55a7834032-s.p.woff2` `/_netlify/_next/static/media/7c42ed55a7834032-s.p.woff2`

## Shape & components
- Border radii used: `50%` `50px` `2px` `8px`
- Primary button: bg `#000000`, text `#000000`, radius `50%`, padding `0px`, transform `none`
- Transitions present: yes

## Hover behaviour (the "it must feel the same" part)
- On hover, real buttons change: **bg** rgba(0, 0, 0, 0.08) → rgb(0, 0, 0); **color** rgb(0, 0, 0) → rgb(255, 255, 255); **borderColor** rgb(0, 0, 0) → rgb(255, 255, 255)
- Transition timing: `all`

## Files
- `design-tokens.json` — structured tokens (the trainable artifact)
- `index.html` — interactive clone (open in browser, test it)
- `screenshot-desktop.png` — what the real site looked like when captured
- `raw/` — original HTML + CSS for deep reference
