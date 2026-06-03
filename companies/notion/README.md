# notion — Design DNA

> **STATUS: ⚠️ TOMER HASN'T TESTED YET** — open the clone, click & hover the buttons, confirm it behaves like the real site.

**Source:** https://www.notion.com
**Captured:** 2026-06-03T02:14:32.873Z
**Tech stack:** Next.js / React

## Palette (real, from rendered DOM)
- Page background: `#191918`
- Primary text: `#000000`
- Accent: `#f6f5f4`
- Top text colors: `#000000` `#f6f5f4` `#a39e98` `#ffffff` `#615d59` `#0075de`
- Top backgrounds: `#ffffff` `#000000` `#f6f5f4` `#191918` `#097fe8` `#f9f9f8`

## Typography
- Primary font: **NotionInter, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol**
- Full stack: `NotionInter, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"`
- Size scale: `16px` `14px` `20px` `24px` `12px` `40px` `22px` `48px` `54px` `42px`
- H1: 64px / weight 700 / NotionInter
- Font files: `/front-static/fonts/NotionInter-Regular.woff2` `/front-static/fonts/NotionInter-Regular.woff` `/front-static/fonts/NotionInter-Medium.woff2`

## Shape & components
- Border radii used: `8px` `12px` `4px` `9999px`
- Primary button: bg `#455dd3`, text `#ffffff`, radius `8px`, padding `4px 14px`, transform `none`
- Transitions present: yes

## Hover behaviour (the "it must feel the same" part)
- On hover, real buttons change: **color** rgb(163, 158, 152) → rgb(97, 93, 89); **borderColor** rgb(163, 158, 152) → rgb(97, 93, 89)
- Transition timing: `all`

## Files
- `design-tokens.json` — structured tokens (the trainable artifact)
- `index.html` — interactive clone (open in browser, test it)
- `screenshot-desktop.png` — what the real site looked like when captured
- `raw/` — original HTML + CSS for deep reference
