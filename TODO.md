# ✅ Brew-Off Portal TODO

## Foundation

- [x] Define theme (colors, fonts, Oktoberfest aesthetic) Add the aesthetic to the STYLE.md file
- [x] Configure Tailwind + shadcn theme tokens
- [x] Build cache system for TSV + images
- [ x] Set up router with `/`, `/results`, `/reveal`

## Data Layer

- [x] Fetch utility for TSV parsing
- [x] Parse registrants for beer metadata + labels
- [x] Parse judging sheet for category scores
- [x] Cache results + images locally

## Home Page

- [x] Hero section with title + year
- [ ] Carousel of beer labels (Drive assets)
- [x] Buttons:
  - [x] See Results (→ `/results`)
  - [x] Register Beer (external form)
  - [x] Judging Form (external form)

## Visual Composition Details (applies across frames)

- **Cards & images**
  - Label images: square, `object-fit: cover`, rounded corners 12–14px, 1px dark border.
  - Place cards: medal icon top, image, beer name (bold), EntryID (muted), score badges.
- **Badges**
  - Background: deep navy; text: light; radius 8px; compact padding; minimal shadow.
- **Typography**
  - Headings: Fraktur display (if available). Body: clean sans-serif. Maintain contrast and legibility.
- **Background**
  - Dark blue lozenge/pattern; keep **low contrast** so content pops.
  - For hero/winner, slightly brighten the background or add a soft vignette.

---

## Error/Edge Handling (frame behavior)

- **Missing data**
  - No 3rd place → skip Step A in podium; center remaining cards; update helper text (“Top 2”).
  - No winner (empty category) → replace frames with “No eligible entries for {Category}” bumper.
- **Broken/missing image**
  - Use themed placeholder (stein/pretzel SVG) with the same animations.
- **Slow network**
  - Category intro displays **“Loading assets…”** sub-text until preload completes; Next press does nothing until ready (show subtle disabled affordance).
- **Back navigation**
  - Prev replays animations for that frame (no partial states retained) except podium: when returning, keep all revealed if they had been revealed previously in this session.

---

## Pacing & Feel

- **No auto-advance.** The host sets the rhythm.
- **Snappy, not jittery.** Keep all single transitions in the 300–400ms range with crisp easings.
- **Restraint.** Confetti only on category winner + Grand Champion frames. Use glow/sparkle sparingly.

---

## Acceptance Checklist (Storyboard Ready)

- [ ] Each frame type above is implemented with the described **visible elements** and **choreography**.
- [ ] Podium frame supports **3 sequential reveals** via host clicks before exiting the frame.
- [ ] Confetti bursts trigger only on winner frames and the Grand Champion.
- [ ] Preload blocks winner frames until their images are ready (clear “loading assets” micro-state).
- [ ] Reduced-motion mode renders cleanly with opacity-only transitions and no confetti.
- [ ] Closing frame reliably unlocks the leaderboard gate.

---

## Results Page

- [ ] Initially blank (hidden behind reveal gate)
- [ ] Unlock leaderboard only after reveal slideshow is complete
- [ ] Full results table, filterable by category
- [ ] Winner highlights at top after reveal

## Reveal Slideshow

- [ ] Manual advance (no auto transitions)
- [ ] Step order:
  1. Category card
  2. Winner beer card
  3. Pause for applause
  4. Transition animation
- [ ] Confetti animation when winners revealed
- [ ] Fun, party-style transitions

## Styling & Animations

- [ ] Festive theme integration
- [ ] Beer label cards styled cleanly
- [ ] Animated reveals (Framer Motion)
- [ ] Confetti & celebration effects

## Deployment

- [ ] Add static fallback cache JSON + images
- [ ] Configure CI/CD to Netlify / Vercel
- [ ] Verify TSV + Drive folder endpoints are public

## Completed Tasks ✅

1. Simplify podium component to ensure it always displays correctly
2. Fix layout issues with cards and podium positioning
3. Remove complex animations that were causing rendering issues
4. Ensure proper spacing between podium elements
5. Position medals at the bottom of pedestals
6. Make base color match the podiums
7. Fix vertical layout to show category title at top, cards in middle, podium at bottom
8. Scale cards on podium based on their rank/placement
9. Translate cards down to be closer to podium based on rank
10. Reduce horizontal spacing between cards
11. Adjust vertical translation to account for card scaling
12. Fix bug with confetti showing for category winners
13. Remove complete step from CategoryReveal
14. Fix navigation controls in FinaleReveal
15. Add logging to FinaleReveal
16. Reorder FinaleReveal to show 3rd, 2nd, then 1st place
17. Apply confetti only when 1st place is revealed
18. Add test button for confetti effect
19. Fix confetti effect with Bavarian themed colors
20. Improve confetti rendering and positioning
21. Make confetti continuous (no duration limit) for grand champion
22. Create CommentBubbles component for displaying judge comments
23. Create test page to demonstrate comment bubbles
24. Integrate comments with EntryCard component
25. Create CategoryRevealWithComments component
26. Add RevealWithComments page to demonstrate comments during reveals
27. Fix infinite scheduling loop in CommentBubbles component
28. Fix comment positioning and overlap issues
29. Integrate comments into main Reveal component and clean up old WithComments components

```

```
