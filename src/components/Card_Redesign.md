# Brew-Off Card Overlay — PM Task Breakdown (Overlay + Tags)

> Goal: Replace SVG-heavy label rendering with a **single PNG overlay** (decorative border + banner) layered over a user’s label photo. Add **metadata tags** below. Must look Bavarian, scale cleanly, and work in both **hero** and **docked/podium** states.

---

## 1) Assets & Export

- [ ] **Overlay PNG** (from design mock)
  - Contents: **decorative frame + Bavarian ribbon banner** ONLY. **No medal, no badges, no photo.**
  - **Transparent “image window”** (center area) so the user photo shows through.
  - Canvas aspect: **portrait 4:5** (recommended; keeps label tall and readable).
  - Export sizes: **overlay@1x (960w)**, **@2x (1440w)**, **@3x (1920w)** with identical aspect ratio. Provide **transparent PNG**.
  - Trim transparent margins; 24px safe padding inside edge.
- [ ] **Banner safe area spec** (for text)
  - Provide a rectangle (in overlay coordinates) where beer name + entry id should render.
  - For initial cut: banner text box centered horizontally, ~**76%** overlay width, positioned **~78%** down from top; height **~10–12%** of overlay.
- [ ] **Icons** (for tags, simple)
  - Hop cone, beer stein, wheat, pint glass (monotone SVG, 16–18px).

**Acceptance:** Overlay shows a clear transparent opening; banner visible; no baked-in medals/tags; sharp at 2x DPR.

---

## 2) Component Structure

- [ ] **`EntryOverlayCard`**
  - **Container (relative)**, maintains **4:5 aspect ratio**.
  - **User image layer** (absolute, z=0): `object-fit: cover`, clipped by container radius; center focal point.
  - **Overlay layer** (absolute, z=1): the PNG overlay; `pointer-events: none`.
  - **Banner text layer** (absolute, z=2): beer name + `[EntryID]` centered within the banner safe area.
  - **Tags row** (below the card, not on overlay): pill badges (Avg, Votes, Style/ABV).
- [ ] **States**
  - **Hero**: container width ~**min(70vw, 680px)**; drop shadow stronger.
  - **Docked**: container width ~**280–320px**; subdued shadow; same overlay.

**Acceptance:** Visual matches the mock; layering correct; banner text sits cleanly inside the ribbon area.

---

## 3) Layout & Sizing (precise)

- Card aspect: **4:5**; corner radius **16px** (card), overlay PNG edges remain square; overlay art provides its own ornamental corners.
- **User image safe area** (visible through overlay):
  - Fill entire container; overlay mask defines the visible opening; no letterboxing.
- **Banner text**
  - Line 1: **Beer Name** (display font / blackletter), single line, **truncate with ellipsis**.
  - Line 2 (optional, lighter): **`[EntryID]`** and/or Brewer (keep to one short line, ellipsis).
  - Vertical alignment: center within the banner’s cream panel.
- **Color tokens**
  - `--bavarian-blue: #0E1623`, `--gold: #E3B341`, `--cream: #F3E9D2`, `--navy-ink: #171922`, `--muted: #AAB0C0`.

**Acceptance:** No text spills outside the banner at 16–24 character beer names; `[EntryID]` always visible.

---

## 4) Typography

- Beer name: **Blackletter/Fraktur** (fallback to a strong serif if unavailable). Tracking slightly tightened.
- Secondary (ID/Brewer): geometric sans or workhorse serif; **90%** size of name.
- Tags: same secondary font, **uppercase** labels optional.

**Acceptance:** Readable on projector and mobile; blackletter only for the name.

---

## 5) Tags (metadata badges, below card)

- **Placement:** A horizontal row **below** the card; not baked into overlay.
- **Badge style:** Rounded pill, background `#192235` (90% opacity), text `#E9ECF5`, 10px radius, 8px vertical padding, 12px horizontal padding, 8–12px gap.
- **Content (order)**
  - **Avg <Category>** (e.g., “Avg Label: 4.72”) + hop icon.
  - **Votes: <n>** + stein icon.
  - Optional third badge: **Style/ABV** + wheat/pint icon.
- **Mobile wrap:** Badges wrap to 2 lines if needed; keep visual spacing consistent.

**Acceptance:** Badges never overlap card; icons aligned; numbers formatted to 2 decimals.

---

## 6) Motion (Framer Motion targets)

- **Hero reveal**
  - Card: scale **0.92 → 1.00**, y **+24 → 0**, opacity **0 → 1** (350–400ms spring).
  - Banner text: fade/slide up 80ms after card settles.
- **Medal behavior:** **None** on overlay (medal is removed per spec).
- **Docking**
  - Scale down to dock size; move to podium slot (350ms ease); reduce shadow.
- **Reduced motion:** Use opacity only; disable transforms.

**Acceptance:** Smooth 60fps on modern laptop; no text jitter; reduced-motion clean.

---

## 7) Accessibility

- Alt text: `"<Beer Name> [EntryID]"` on the **user image**.
- Contrast: verify badge text on dark pills meets AA.
- Name truncation: `title` tooltip reveals full beer name on hover/focus.

**Acceptance:** Lighthouse a11y ≥ 90 on the card page.

---

## 8) Data Wiring

- Input props to `EntryOverlayCard`:
  - `imageUrl` (beer label photo; may be Google Drive; normalize to `uc?export=view`).
  - `name` (beer), `entryId`, optional `brewer`.
  - `avg`, `votes`, optional `style`, `abv`.
- Fallback image (stein/pretzel SVG) when `imageUrl` fails; still show overlay + banner text.

**Acceptance:** Component renders with or without a working image.

---

## 9) QA Checklist

- Long beer names (20–28 chars) truncate cleanly; ID remains visible.
- Low-res images still look acceptable (cover + overlay hides edges).
- Hi-DPI displays render overlay crisply (use @2x/@3x).
- Dark/light photos: banner text stays readable (banner is opaque).
- Mobile: card at 90vw width, tags wrap; no overflow.

**Acceptance:** Visual parity with overlay mock; cross-device tested.

---

## 10) Deliverables

- `EntryOverlayCard` component with overlay layering + banner text + tags row.
- Overlay PNGs @1x/@2x/@3x; banner safe-area documentation (x/y/width/height as % of overlay).
- Usage docs (props, examples: hero and docked).
