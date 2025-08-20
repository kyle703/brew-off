# Brew-Off Reveal Storyboard — Vertical Stacked Flow (Framer Motion PM Spec)

> **Scope:** ONLY the live reveal deck. Host-controlled. No horizontal slides.  
> **Layout paradigm:** A **single vertical page** that **builds downward**. The **current reveal** is always **centered** in the viewport; previously revealed content **stacks above**.  
> **Animation system:** Framer Motion (`AnimatePresence`, `useAnimate`, `variants`, motion values).  
> **Order:** Label → Color → Drinkability → Flavor → Overall (Grand Champion finale).  
> **Data:** `winners[Category]` arrays (winner first), each beer has: `entryId`, `name`, optional `brewer`, `img`, `scores`, and metrics.  
> **Tone:** Fun, celebratory, zero-jank. Correctness first.

---

## Global Interaction & Behavior

- **Advance:** Host presses **→** or **Space** for **next step**; **←** for **previous** step. On-screen Prev/Next buttons mirror keys.
- **Structure:** Each **category** section is a vertical block containing its own **podium** and **entry reveal steps** (🥉 → 🥈 → 🥇). After a category completes, the **final category** is “Overall” with a **full-screen finale**.
- **Viewport behavior:** On **every step**, the page **scrolls** so the **active card** or **active category header/podium** is pinned **center** (scrollTo with easing). Previous content remains above; next content is rendered below but dimmed until active.
- **Reduced motion:** If `prefers-reduced-motion`, simplify to opacity-only transitions, **no confetti**, **no large scaling**, **no vertical scroll animation** (jump to anchors).
- **Preload:** Before each category’s reveals, preload top-3 label images; preload Overall top-3 before finale.
- **Timing guidelines (not code):**
  - Section enter/exit (opacity/translate/blur): **0.30–0.40s**, easeOut/easeIn.
  - Card scale-in hero: **0.35–0.45s** spring (low stiffness), overshoot 1.02 → settle 1.00.
  - Medal/ornament drop: **0.25–0.30s**, slight bounce.
  - Card-to-podium travel: **0.35s**, bezier ease; small scale-down during travel.
  - Staggers between elements: **60–90ms**.

---

## Layout & Components Overview

### Vertical Page Sections (in order)

1. **Opening Title Card**
2. **Category Section** (repeated for: Label, Color, Drinkability, Flavor)
   - **Category Header**
   - **Podium Component** (empty pedestals initially)
   - **Reveal Steps**: Bronze card (hero → drop → dock), Silver card (hero → drop → dock), Gold card (hero → confetti → drop → dock)
3. **Finale Section (Overall)**
   - **Finale Header**
   - **Finale Hero Card** (full-screen experience)
   - **Finale Podium Strip** (🥈 and 🥉 mini-cards)
4. **Closing / Leaderboard Unlock**

**Viewport rule:** As each sub-step is executed, **scroll** so the relevant element (header, hero card, or podium) is **perfectly centered**. Previously revealed items remain visible above.

---

## Card Aesthetic (Reusable Entry Card)

- **Aspect ratio:** **Fixed square** (e.g., 1:1) with **object-fit: cover** image. Hero state can scale up to occupy ~**60–70% of viewport width** on desktop (max 680px), and ~**80–90%** on mobile.
- **Card base:**
  - Background: deep navy/graphite (`#171922`) with subtle grain/noise.
  - Corners: **14px** radius; **1px** inner border (navy `#2a3350`); soft shadow (ambient, not harsh).
- **Image frame:** Slight inner **bevel** effect using overlay gradient (top faint highlight, bottom faint shadow).
- **Bavarian Banner (top or bottom):**
  - A **ribbon banner** anchored to the card (see “Banner Aesthetic” below).
  - Contains **Beer Name** (bold), and **[EntryID]**; optional Brewer as a smaller sub-line.
- **Badges row (beneath image or in banner):**
  - Pill badges: background `#23273a`, text `#E9ECF5`, radius 10px: **Avg (category)**, **Votes**, optional **Style/ABV**.
- **Medal ornament anchor area (top center):**
  - Reserved space for **medal SVG drop** during reveal (does not overlap text permanently; floats above during animation).

**Hero state (during reveal):** Card **scales up** to **spotlight** (70vw/80vh cap), centered, with **dimmed background** and optional **vignette**. Post-reveal, card **shrinks** and **moves** to its **podium slot**.

---

## Podium Component (Per Category)

- **Composition:** Three pedestals on a base plinth, styled as **Bavarian wood** with blue-white diamond inlays.
  - **Heights:** 🥇 **highest**, 🥈 medium, 🥉 lowest (classic podium silhouette).
  - **Labels:** Pedestal tops have small nameplates (subtle mixed-metal effect).
  - **Slots:** Each pedestal has a **card anchor** (slot) where the scaled-down entry card will dock (centered).
- **Empty state (intro):** Podium fades in; pedestals rise from bottom slightly; nameplates shimmer once.
- **Docked state:** Cards are smaller (e.g., 240–300px), aligned with pedestal tops; a faint glow behind the 🥇 slot when filled.
- **Responsiveness:** On mobile, layout stacks vertically with 🥇 centered first, 🥈 and 🥉 below with reduced width.

**Animation roles:**

- **On category start:** Podium enters (rise + fade).
- **On each docking:** The destination pedestal **pulses** (glow ring 300ms) right before card lands.

---

## Custom SVG & Banner Aesthetic

### Medal SVGs (🥇 Gold, 🥈 Silver, 🥉 Bronze)

- **Shape:** Round medallion (beveled), layered with:
  - Outer ring (metal gradient, subtle scratches).
  - Inner disk (engraved Bavarian lozenge pattern, very subtle).
  - Ribbon tabs (deep blue with gold pinstripe).
  - Large numeral (1/2/3) or emoji medal overlay; keep high contrast.
- **Animation on drop:**
  - **Drop-in from above** with **light rotation** (−8° → 0°), **bounce** on landing (translateY overshoot 8–12px).
  - **Shine sweep** (diagonal specular pass) 400–600ms after landing.
- **Color grading:**
  - Gold: warm amber (#E3B341 → #B8860B shades).
  - Silver: cool grey (#C7CCD6 → #9AA3B2).
  - Bronze: rich copper (#B07D4F → #7A5230).

### Bavarian Banner (Card banner)

- **Base shape:** Wide ribbon with **forked ends**, slight arc.
- **Pattern:** **Blue-white diamonds** (toned down), with a **cream overlay** panel for text.
- **Trim:** Fine gold pinline around the cream panel.
- **Typography:** Display face (Fraktur/Gothic) for Beer Name; smaller sans-serif for [EntryID] / brewer.
- **Animation:**
  - On hero reveal: **Unfurl** effect (scaleX from 0.96 → 1.00, skew reset), subtle cloth-like bounce.
  - On dock: banner remains static; scale to the new card size smoothly.

---

## Detailed Category Flow (Per Category Section)

**Section enter:**

- **Category Header** (ribbon + large title) fades/slides in.
- **Podium appears**: rises into view; nameplates shimmer once.
- **Viewport scrolls** to center the **header**, then **podium**.

**Reveal Step A — 🥉 Bronze (host presses Next):**

1. **Scroll**: Center the **hero staging area** (an empty anchor just below the header).
2. **Card Hero-in:**
   - Bronze entry card **scales up** from 0.92 → **hero size**, y: +24 → 0, opacity 0 → 1.
   - **Banner unfurls** atop the card; badges fade in with **stagger**.
3. **Medal Drop:**
   - 🥉 **drops** from above into the **medal anchor** on the card; bounce; **shine sweep**.
4. **Dock to Podium:**
   - Card **shrinks** to **podium scale**, translates to **🥉 pedestal slot**; minor rotation correction; background vignette clears.
   - **Podium 🥉 glow pulse** as the card lands.
5. **State:** Bronze now **fixed** on the podium; remains visible above when we move on.

**Reveal Step B — 🥈 Silver:**

- Same sequence as Bronze with **Silver** medal colors/effects.
- If few entries (no 🥉), skip Step A and run Silver as first step.
- **Dock** to the 🥈 slot; pulse on land.

**Reveal Step C — 🥇 Gold (host presses Next):**

1. **Scroll**: Back to hero staging area, center on screen.
2. **Card Hero-in:** Gold entry scales up; **more assertive spring** (still tasteful).
3. **Confetti Burst:** Trigger **confetti** right after hero landing (single burst).
4. **Medal Drop:** 🥇 drops, bounce, shine.
5. **Dock to Podium:** Card travels to the **🥇 slot**; podium **halo** behind 🥇 fades in for ~1s and settles to a gentle glow.

**Category exit (after Gold docks):**

- **Scroll** to center the **now-complete podium** for a beat.
- Host presses Next → **scroll** to next category’s header.

---

## Finale (Overall) — Special Full-Screen Treatment

**Finale Header (build-up):**

- “🏆 Grand Champion — Coming up…”
- Background **bokeh** or **soft spotlight** cones; gentle drift.
- Preload overall top-3 label images if not already.

**Finale Winner Hero (full-screen):**

- Switch to **immersive layout**: hero card centered, larger than category hero (e.g., up to **min(80vmin, 780px)**).
- **Enter choreography:**
  1. **Ambient dim** of background; vignette emphasizes center.
  2. **Hero card pop**: scale 0.94 → 1.00 with soft overshoot; slight rotation correction to 0°.
  3. **Grand Confetti Burst**: more pieces than standard category; **no recycle**.
  4. **Gold Crown Ornament** (custom SVG) **rises up** behind the card (subtle parallax), shimmering edge.
  5. **Bavarian Banner unfurls** (larger variant), shows Beer Name + [EntryID], brewer name, **Avg Overall** and **Votes** badges.
- **Podium Strip (context):**
  - After a beat (host advances), a **horizontal strip** slides up revealing 🥈 and 🥉 mini-cards with medal badges (smaller versions of earlier cards).
- **Exit:** None auto; host advances to closing.

---

## Closing / Unlock

- “Prost! 🍻 Leaderboard is now unlocked.”
- Button: **View Leaderboard** (primary, gold).
- **Side-effect:** When this frame is centered for the first time, set the **reveal-complete gate** (for Leaderboard unlock).

---

## Behavior & Edge Cases

- **Missing Entries:**
  - If a category has only 2 entries, skip Bronze and re-center animations; **podium** still renders 3 tiers with 🥉 empty.
  - If only 1 entry, skip to Gold reveal.
  - If no entries, skip category entirely; show a small “no eligible entries” banner in the stack for record.
- **Image Failures:**
  - Use **themed placeholder** (stein/pretzel SVG). Apply the same animations.
- **Revisiting Steps:**
  - **Prev** returns to the **last in-category step** (e.g., back from Gold dock to Gold hero-in).
  - Previously docked cards remain docked when revisiting (no need to replay entire travel unless host steps back before the docking happened).
- **Focus & Accessibility:**
  - The **active element** (header/hero/podium) receives focus for screen readers on step change; maintain visible focus outlines on buttons.
  - Alt text: `"<Beer Name> [EntryID]"` for all images.
  - Respect `prefers-reduced-motion`.

---

## Acceptance Checklist

- [ ] **Vertical flow** only: No horizontal slide change; the page **builds downward** and always **scrolls** to center the current element.
- [ ] **Per-category**: Header appears, podium enters, then **🥉 → 🥈 → 🥇** reveals run exactly as described (hero scale-in → medal drop → dock to podium) do not use these emojis, we need custom components
- [ ] **Medal SVGs**: Drop, bounce, and shine once per reveal; colors and textures match the described metal looks; **Bavarian ribbon** included.
- [ ] **Bavarian banners** adorn each card hero and scale down gracefully on podium dock.
- [ ] **Finale** uses the **full-screen hero** treatment with **grand confetti**, **crown ornament**, **banner**, and **runner-up strip**.
- [ ] **Preload gate**: No winner hero enters until its image is loaded (show “loading assets…” micro-state if needed).
- [ ] **Reduced motion** path verified: opacity-only transitions, no confetti, instant scroll to anchors.
- [ ] **Performance**: No visible jank when stepping through; image loads do not block interactions once preloaded.
- [ ] **Unlock**: Closing frame sets the gate that unlocks the leaderboard.

---

## Visual Assets (Non-blocking Guidance)

- **Medal SVGs**: Three sizes (hero overlay, card-top ornament, tiny badge). Provide as inline SVG with gradient fills & subtle noise.
- **Crown SVG (Finale)**: Stylized Bavarian crest/crown with diamond inlays and gold filigree; low-contrast backdrop usage.
- **Banners**: Reusable ribbon SVG with text slots; variant sizes for hero and podium cards.

---

## Notes for Implementation (Non-code)

- **Framer Motion**: Use `AnimatePresence` for frame-like swaps (hero vs docked view), `useAnimate` to choreograph the **hero → medal drop → dock** timeline.
- **Scroll control**: After each step resolves, **smooth scroll** to the targeted section/element so it’s pinned center; disable auto when reduced motion.
- **State machine**: Steps per category: `intro → podium-enter → bronze(hero→drop→dock) → silver(hero→drop→dock) → gold(hero→confetti→drop→dock) → done`. Finale has `header → hero → podium strip → done`.

---
