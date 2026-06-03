# pandora — Design DNA

> **STATUS: ⚠️ TOMER HASN'T TESTED YET** — open the clone, click & hover the buttons, confirm it behaves like the real site.

**Source:** https://us.pandora.net
**Captured:** 2026-06-03T02:27:38.524Z
**Tech stack:** React

## Palette (real, from rendered DOM)
- Page background: `#ffffff`
- Primary text: `#211710`
- Accent: `#71706c`
- Top text colors: `#211710` `#ffffff` `#71706c` `#27251f` `#000000` `#696969`
- Top backgrounds: `#ffffff` `#211710` `#ff93a0` `#f4f7fa` `#f6f9fc` `#ffcad4`

## Typography
- Primary font: **GothamSSm-Book, Arial, sans-serif**
- Full stack: `GothamSSm-Book, Arial, sans-serif`
- Size scale: `16px` `11px` `12px` `20px` `13px` `14px` `13.12px` `40px` `14.4px`
- H1: 16px / weight 400 / GothamSSm-Book
- Font files: `/mobify/bundle/2174/static/fonts/GothamSSm-Book.woff2?app=content` `/mobify/bundle/2174/static/fonts/GothamSSm-Book.otf?app=content` `/mobify/bundle/2174/static/fonts/GothamSSm-BookItalic.woff2?app=content`

## Shape & components
- Border radii used: `9999px` `4px` `2px` `6px`
- Primary button: bg `?`, text `#ffffff`, radius `0px`, padding `0px`, transform `uppercase`
- Transitions present: yes

## Hover behaviour (the "it must feel the same" part)
- On hover, real buttons change: **color** rgb(33, 23, 16) → rgb(117, 117, 117)
- Transition timing: `background-color 0.2s, border-color 0.2s, color 0.2s, fill 0.2s, stroke 0.2s, opacity 0.2s, box-shadow 0.2s, transform 0.2s`

## Files
- `design-tokens.json` — structured tokens (the trainable artifact)
- `index.html` — interactive clone (open in browser, test it)
- `screenshot-desktop.png` — what the real site looked like when captured
- `raw/` — original HTML + CSS for deep reference
