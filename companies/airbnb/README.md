# airbnb — Design DNA

> **STATUS: ⚠️ TOMER HASN'T TESTED YET** — open the clone, click & hover the buttons, confirm it behaves like the real site.

**Source:** https://www.airbnb.com
**Captured:** 2026-06-03T02:33:04.058Z
**Tech stack:** React

## Palette (real, from rendered DOM)
- Page background: `#ffffff`
- Primary text: `#222222`
- Accent: `#6a6a6a`
- Top text colors: `#222222` `#6a6a6a` `#c1c1c1` `#ffffff` `#ff385c` `#000000`
- Top backgrounds: `#dddddd` `#f2f2f2` `#ffffff` `#b0b0b0` `#222222` `#ebebeb`

## Typography
- Primary font: **Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif**
- Full stack: `"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif`
- Size scale: `14px` `12px` `16px` `13px` `8px` `11px` `20px` `28px`
- H1: 28px / weight 700 / Airbnb Cereal VF
- Font files: `https://a0.muscache.com/airbnb/static/airbnb-dls-web/build/fonts/cereal-variable/AirbnbCerealVF_W_Wght.8816d9e5c3b6a860636193e36b6ac4e4.woff2` `https://a0.muscache.com/airbnb/static/airbnb-dls-web/build/fonts/cereal-variable/AirbnbCerealVF_Italics_W_Wght.bd5e0f97cea11e9264b40656a83357ec.woff2` `https://a0.muscache.com/airbnb/static/airbnb-dls-web/build/fonts/cereal-variable/AirbnbCerealVF_Arabic_W_Wght.6bee4dd7ab27ef998da2f3a25ae61b48.woff2`

## Shape & components
- Border radii used: `20px` `50%` `9px` `14px`
- Primary button: bg `#f2f2f2`, text `#222222`, radius `50%`, padding `0px`, transform `none`
- Transitions present: yes

## Hover behaviour (the "it must feel the same" part)
- On hover, real buttons change: **bg** rgba(0, 0, 0, 0) → rgb(247, 247, 247)
- Transition timing: `box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1), transform 0.1s cubic-bezier(0.2, 0, 0, 1)`

## Files
- `design-tokens.json` — structured tokens (the trainable artifact)
- `index.html` — interactive clone (open in browser, test it)
- `screenshot-desktop.png` — what the real site looked like when captured
- `raw/` — original HTML + CSS for deep reference
