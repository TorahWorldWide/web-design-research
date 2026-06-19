# LESSONS — what I learned building these clones

This file is my accumulating memory across the whole job. Every time I make a
mistake and fix it, I write the rule here so I never repeat it. Read this BEFORE
building each new site.

## Rules learned

1. **Read computed styles from the live rendered DOM, never guess from raw CSS.**
   curl-only gives a skeleton on JS-rendered sites (Next.js/React). Real values
   come from getComputedStyle on visible elements. (validated on Nike)

2. **Skip fully-transparent colors (rgba alpha 0).** They pollute the palette and
   show up as fake "black". Filter them at extraction.

3. **The brand accent is NOT the most common color.** The most common text color is
   almost always the near-black body text (#111). The accent is the standout color
   that is not black/white/grey. Pick it by exclusion.

4. **Pill buttons are a signal.** A large border-radius (e.g. 30px on Nike) means the
   brand uses pill buttons. Carry the real radius into the clone, don't default to 0.

5. **If the hover-probe finds no delta, still animate.** Many sites animate via JS or
   on child elements, so the probe can miss it. Provide a tasteful default
   (translateY(-2px) + shadow) so the clone never feels dead. A static button fails
   Tomer's "it must behave like the original" test.

## ⚠️ BIG LESSON (Tomer flagged the clones looked wrong)
6. **A single fixed HTML template + brand colors is NOT a clone.** build.js poured every
   site into the same e-commerce skeleton (nav: New/Men/Women/Sale + product grid) and
   only swapped colors. Result: Spotify (a dark music app) came out as a green store,
   Figma/Tiffany too. Tomer correctly said "a little similar but mostly totally different."
   FIX: faithful-snapshot approach (snapshot.js) — save the REAL rendered DOM with the
   REAL CSS inlined + <base href> so real images/fonts load, strip <script> so it can't
   redirect. Spotify snapshot scored 10/10 identical, Figma 9/10. THIS is the method.
7. **Some sites block bots at the edge (Akamai/Cloudflare).** Tiffany returned "Access
   Denied / errors.edgesuite.net". That's a WALL, not a retry. Detect block phrases
   ("Access Denied", "Pardon Our Interruption", "Just a moment", "enable JavaScript and
   cookies") and mark BLOCKED rather than shipping a broken page.
8. **The template-clone (build.js) is still useful as a LEARNING artifact** (it forces me
   to extract tokens and reason about category), but it's NOT what to show Tomer as "looks
   like the real site." Keep both: snapshot = fidelity, design-tokens.json = training data.

## Open questions to check per category
- Luxury (Tiffany, Cartier, Gucci, LV): do they use SERIF fonts + huge whitespace +
  slow fades? If my builder defaults to sans-serif, that's a mistake to fix.
- SaaS/AI (OpenAI, Claude, Notion, Figma): dark mode? gradients? rounded cards?
- Sportswear (Nike, Adidas, Lululemon): bold, tight, loud, image-led.

## ⚠️ BIG LESSON #2 (the Web Design Learning Pass — category-blind generator)
9. **One fixed skeleton for every brand = every clone looks the same.** build.js v2 poured
   luxury (Gucci), SaaS (Notion/Claude) and sport (Nike) into the SAME e-commerce template:
   nav New/Men/Women/Sale + "Shop Now" + product grid. Vision proof: Notion & Claude came out
   as generic stores; Gucci had a generic centered hero. FIX: build.js v3 picks a CATEGORY
   archetype per brand (luxury=editorial serif + huge whitespace + sharp corners; saas=clean
   sans marketing hero + feature cards, dark-mode aware; sport=bold loud image-led + pill CTAs;
   consumer=bright + very rounded + friendly). Nav and CTA labels now match the category too.
   The category map lives at the top of build.js — add new slugs there.
10. **Blocked-capture garbage was shipped as if real.** 6 brands (tiffany, cartier, gucci,
    lululemon, rolex, adidas) returned Times New Roman + #1151ff + 0 images + an "Access Denied"
    / "Error Page" title — those are the BROWSER DEFAULTS scraped off a bot-block page, not the
    brand's design. Worst case: adidas (a bold sport brand) looked elegant-serif because of it.
    FIX: detect blocked captures (default font + no images, OR a block-phrase title) and fall
    back to the category's DEFAULT design language, labelled honestly with an amber "ARCHETYPE
    RECONSTRUCTION" banner. Never present default-font garbage as extracted truth.
11. **No contrast guard = invisible text.** Notion rendered black text (#000000) on its dark bg
    (#191918); Claude rendered light text on a light bg. Both heroes were unreadable. FIX: a
    luminance-based readable()/contrast-ratio guard recomputes text color against its actual
    background everywhere (hero, sections, buttons). Button text color is derived from the accent's
    luminance so a button label is never the same color as its fill.
12. **Never overlay hero text on an OG share-card image.** The OG image often already CONTAINS
    text, so the H1 collided with baked-in words (Notion showed double-text mush). FIX: hero text
    sits on a solid/gradient brand background; real content images (filtered to exclude og/share/
    social/card URLs) live in their own image band, never under headline text.
13. **A hero with white text needs a dark background even when there's no image.** Blocked sport
    brands (adidas/lululemon) had a white-text hype hero with an empty white bg → invisible H1.
    FIX: when no hero image exists, the sport hero gets a dark charcoal gradient so white text
    stays visible. Also: truncate copy at a WORD boundary (clip()), never mid-word ("science-based le").
14. **Accent sanitizer.** Reject #1151ff (the old hardcoded default), near-white, near-black, any
    color equal to the text color, and low-chroma greys. Pick the most-saturated real palette color;
    fall back to the category accent (luxury gold, saas indigo, sport black, consumer red) only if
    nothing valid is found.
