# duolingo — Design DNA

> **STATUS: ⚠️ TOMER HASN'T TESTED YET** — open the clone, click & hover the buttons, confirm it behaves like the real site.

**Source:** https://www.duolingo.com
**Captured:** 2026-06-03T02:34:10.343Z
**Tech stack:** React

## Palette (real, from rendered DOM)
- Page background: `#ffffff`
- Primary text: `#3c3c3c`
- Accent: `#777777`
- Top text colors: `#3c3c3c` `#777777` `#4b4b4b` `#58cc02` `#1cb0f6` `#afafaf`
- Top backgrounds: `#ffffff` `#ddf4ff` `#100f3e`

## Typography
- Primary font: **din-round, sans-serif**
- Full stack: `din-round, sans-serif`
- Size scale: `17px` `15px` `48px` `64px` `14px` `16px` `32px`
- H1: 32px / weight 700 / din-round
- Font files: n/a

## Shape & components
- Border radii used: `12px`
- Primary button: bg `?`, text `#afafaf`, radius `0px`, padding `0px`, transform `uppercase`
- Transitions present: yes

## Hover behaviour (the "it must feel the same" part)
- No hover delta captured (button may animate via transform/JS).

## Files
- `design-tokens.json` — structured tokens (the trainable artifact)
- `index.html` — interactive clone (open in browser, test it)
- `screenshot-desktop.png` — what the real site looked like when captured
- `raw/` — original HTML + CSS for deep reference
