# apple — Design DNA

> **STATUS: ⚠️ TOMER HASN'T TESTED YET** — open the clone, click & hover the buttons, confirm it behaves like the real site.

**Source:** https://www.apple.com
**Captured:** 2026-06-03T02:15:13.821Z
**Tech stack:** unknown

## Palette (real, from rendered DOM)
- Page background: `#ffffff`
- Primary text: `#1d1d1f`
- Accent: `#e8e8ed`
- Top text colors: `#1d1d1f` `#000000` `#e8e8ed` `#2997ff` `#ffffff` `#86868b`
- Top backgrounds: `#f5f5f7` `#000000` `#1d1d1f` `#0071e3` `#161617` `#ffffff`

## Typography
- Primary font: **SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif**
- Full stack: `"SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif`
- Size scale: `12px` `17px` `24px` `14px` `44px` `21px` `40px` `56px` `18px` `28px`
- H1: 34px / weight 600 / SF Pro Text
- Font files: `../assets/ac-footer/legacy/appleicons_ultralight.woff` `../assets/ac-footer/legacy/appleicons_ultralight.ttf` `../assets/ac-footer/legacy/appleicons_ultralight.eot`

## Shape & components
- Border radii used: `980px` `5px` `8px` `11px`
- Primary button: bg `#f5f5f7`, text `#000000`, radius `8px`, padding `8px 15px`, transform `none`
- Transitions present: yes

## Hover behaviour (the "it must feel the same" part)
- On hover, real buttons change: **bg** rgb(245, 245, 247) → rgb(255, 255, 255)
- Transition timing: `all`

## Files
- `design-tokens.json` — structured tokens (the trainable artifact)
- `index.html` — interactive clone (open in browser, test it)
- `screenshot-desktop.png` — what the real site looked like when captured
- `raw/` — original HTML + CSS for deep reference
